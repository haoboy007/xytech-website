#!/bin/bash
# GitHub 安全推送脚本（支持全自动模式）
# 用法:
#   手动模式: ./push.sh <github_token> <version> <commit_message>
#   自动模式: ./push.sh --auto <github_token>
#
# 示例:
#   ./push.sh ghp_xxx v52 "修复飞书推送调用方式"
#   ./push.sh --auto ghp_xxx   # 自动推断版本号和摘要

set -euo pipefail
set +x  # 关闭命令回显，防止Token泄露到日志

# ========== 颜色定义 ==========
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# ========== 参数解析 ==========
AUTO_MODE=false
TOKEN=""
VERSION=""
MSG=""

if [[ "${1:-}" == "--auto" ]]; then
  AUTO_MODE=true
  TOKEN="${2:-}"
else
  TOKEN="${1:-}"
  VERSION="${2:-}"
  MSG="${3:-}"
fi

# ========== 自动推断函数 ==========

# 从上次 commit message 提取版本号并递增
auto_version() {
  local last_commit last_version next_version

  # 读取最近 commit 的完整消息
  last_commit=$(git log --format=%B -1 2>/dev/null || echo "")

  # 尝试提取 v{N} 格式
  last_version=$(echo "$last_commit" | grep -oE 'v[0-9]+' | head -1)

  if [[ -n "$last_version" ]]; then
    # v52 → 52 → 53 → v53
    local num=${last_version#v}
    next_version="v$((num + 1))"
  else
    # 尝试 semver 格式 x.y.z
    last_version=$(echo "$last_commit" | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
    if [[ -n "$last_version" ]]; then
      local major minor patch
      major=$(echo "$last_version" | cut -d. -f1)
      minor=$(echo "$last_version" | cut -d. -f2)
      patch=$(echo "$last_version" | cut -d. -f3)
      next_version="${major}.${minor}.$((patch + 1))"
    else
      # 无版本号记录，从 v1 开始
      next_version="v1"
    fi
  fi

  echo "$next_version"
}

# 基于文件路径推断变更类型
infer_change_type() {
  local file="$1"
  case "$file" in
    src/components/ai-assistant/*) echo "改进 AI 智能助手功能" ;;
    src/components/Hero.tsx) echo "优化首页 Hero 区视觉效果" ;;
    src/components/Navbar.tsx) echo "改进导航栏交互体验" ;;
    src/components/Footer.tsx) echo "更新页脚内容" ;;
    src/components/Contact.tsx) echo "优化联系页面" ;;
    src/components/About.tsx) echo "更新关于页面" ;;
    src/components/Business.tsx) echo "调整业务展示模块" ;;
    src/components/XYAIPlatform.tsx) echo "更新 AI 平台介绍" ;;
    src/components/ThinkTank.tsx) echo "更新智库介绍" ;;
    src/components/*) echo "优化前端页面组件" ;;
    src/hooks/*) echo "新增或优化 React Hooks" ;;
    src/db/*) echo "调整数据库相关配置" ;;
    src/types/*) echo "更新类型定义" ;;
    src/lib/*) echo "更新工具库" ;;
    supabase/functions/*) echo "更新后端 Edge Functions" ;;
    public/*) echo "更新静态资源文件" ;;
    package.json) echo "更新项目依赖" ;;
    package-lock.json|pnpm-lock.yaml|yarn.lock) echo "锁定依赖版本" ;;
    *.css|*.scss) echo "调整样式与配色方案" ;;
    *.md) echo "更新文档内容" ;;
    *.html) echo "更新 HTML 模板" ;;
    *.config.*|*.json) echo "调整项目配置" ;;
    .skills/*) echo "新增或改进技能模块" ;;
    .github/*) echo "更新 CI/CD 工作流" ;;
    tasks/*) echo "更新任务交付物" ;;
    *) echo "更新 ${file##*/}" ;;
  esac
}

# 基于 git diff 自动生成更新摘要
auto_summary() {
  local files changed_files summary_lines=()
  local max_lines=5

  # 获取变更文件列表
  files=$(git diff --name-only --cached 2>/dev/null || git diff --name-only HEAD 2>/dev/null || echo "")

  if [[ -z "$files" ]]; then
    echo "代码同步更新"
    return
  fi

  # 获取变更统计
  changed_files=$(echo "$files" | wc -l | tr -d ' ')

  # 去重推断：每个文件推断一次，去重后取前5条
  local seen=()
  while IFS= read -r file; do
    [[ -z "$file" ]] && continue
    local inferred
    inferred=$(infer_change_type "$file")

    # 去重检查
    local dup=false
    for s in "${seen[@]}"; do
      if [[ "$s" == "$inferred" ]]; then
        dup=true
        break
      fi
    done

    if [[ "$dup" == false ]]; then
      seen+=("$inferred")
      summary_lines+=("$inferred")
      [[ ${#summary_lines[@]} -ge $max_lines ]] && break
    fi
  done <<< "$files"

  # 如果推断条目不足3条，补充文件数量信息
  if [[ ${#summary_lines[@]} -lt 3 && "$changed_files" -gt 5 ]]; then
    summary_lines+=("共修改 ${changed_files} 个文件")
  fi

  # 输出摘要列表
  printf '%s\n' "${summary_lines[@]}"
}

# 根据变更内容推断 commit type
infer_commit_type() {
  local files
  files=$(git diff --name-only --cached 2>/dev/null || git diff --name-only HEAD 2>/dev/null || echo "")

  # 检查关键文件判断 type
  if echo "$files" | grep -qE '\.(css|scss|svg|png|jpg)$'; then
    echo "style"
  elif echo "$files" | grep -qE 'README|\.md$|docs?/'; then
    echo "docs"
  elif echo "$files" | grep -qE 'package\.json|pnpm|lock|config\.'; then
    echo "chore"
  elif echo "$files" | grep -qE 'fix|bug|repair|patch'; then
    echo "fix"
  else
    echo "feat"
  fi
}

# ========== 前置检查 ==========

# 检查参数
if [[ -z "$TOKEN" ]]; then
  echo -e "${RED}用法:${NC}"
  echo "  手动模式: $0 <github_token> <version> <commit_message>"
  echo "  自动模式: $0 --auto <github_token>"
  echo "  示例: $0 ghp_xxx v52 '修复飞书推送'"
  echo "        $0 --auto ghp_xxx"
  exit 1
fi

# 检查 Git 仓库
if [[ ! -d ".git" ]]; then
  echo -e "${RED}错误: 当前目录不是 Git 仓库${NC}"
  exit 1
fi

# 检查远程仓库
if ! git remote get-url origin &>/dev/null; then
  echo -e "${RED}错误: 未配置远程仓库 origin${NC}"
  echo "  请先执行: git remote add origin https://github.com/USER/REPO.git"
  exit 1
fi

ORIGIN_URL=$(git remote get-url origin)

# 解析用户名和仓库名
REPO_PATH=$(echo "$ORIGIN_URL" | sed -E 's|https?://github.com/||; s|\.git$||')
USER_NAME=$(echo "$REPO_PATH" | cut -d'/' -f1)
REPO_NAME=$(echo "$REPO_PATH" | cut -d'/' -f2)

if [[ -z "$USER_NAME" || -z "$REPO_NAME" ]]; then
  echo -e "${RED}错误: 无法解析远程仓库路径${NC}"
  exit 1
fi

# ========== 自动模式：推断版本号和摘要 ==========

if [[ "$AUTO_MODE" == true ]]; then
  echo -e "${CYAN}🤖 自动推断模式已启用${NC}"
  echo ""

  # 推断版本号
  echo -e "${CYAN}正在推断版本号...${NC}"
  VERSION=$(auto_version)
  echo -e "  上次版本: $(git log --format=%B -1 2>/dev/null | grep -oE 'v[0-9]+|[0-9]+\.[0-9]+\.[0-9]+' | head -1 || echo '无')"
  echo -e "  本次版本: ${GREEN}${VERSION}${NC}"
  echo ""

  # 推断更新摘要
  echo -e "${CYAN}正在分析代码变更...${NC}"
  SUMMARY_LINES=$(auto_summary)
  MSG=$(echo "$SUMMARY_LINES" | head -1)
  echo -e "  更新摘要: ${GREEN}${MSG}${NC}"
  echo ""
else
  # 手动模式检查参数
  if [[ -z "$VERSION" || -z "$MSG" ]]; then
    echo -e "${RED}手动模式需要提供版本号和提交信息${NC}"
    echo "  用法: $0 <token> <version> <message>"
    exit 1
  fi
fi

# 检查是否有变更
CHANGES=$(git status --short)
if [[ -z "$CHANGES" ]]; then
  echo -e "${YELLOW}警告: 工作区无变更，是否仍要推送？(y/N)${NC}"
  read -r confirm
  if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    echo "已取消推送"
    exit 0
  fi
fi

# 网络连通性测试
echo -e "${CYAN}测试 GitHub 网络连通性...${NC}"
if ! curl -sI "https://github.com" --connect-timeout 5 &>/dev/null; then
  echo -e "${YELLOW}⚠️ 警告: 无法连接到 GitHub，直接推送可能失败${NC}"
  echo "  将同时准备打包下载备选方案"
fi

# ========== 推送流程 ==========

# 推断 commit type
COMMIT_TYPE=$(infer_commit_type)

# 构建更新要点列表
UPDATE_POINTS=""
if [[ "$AUTO_MODE" == true ]]; then
  while IFS= read -r line; do
    [[ -z "$line" ]] && continue
    UPDATE_POINTS="${UPDATE_POINTS}- ${line}\n"
  done <<< "$SUMMARY_LINES"
fi

# 生成规范化 commit message
COMMIT_MSG="${COMMIT_TYPE}: ${MSG}

版本: ${VERSION}

更新内容：
${UPDATE_POINTS}
推送时间: $(date '+%Y-%m-%d %H:%M:%S')
推送环境: 秒哒云端"

echo ""
echo "========== 推送信息 =========="
echo "版本号: $VERSION"
echo "仓库: $USER_NAME/$REPO_NAME"
echo "提交信息:"
echo -e "$COMMIT_MSG"
echo "=============================="
echo ""

# 设置带Token的远程URL
TOKEN_URL="https://${USER_NAME}:${TOKEN}@github.com/${USER_NAME}/${REPO_NAME}.git"
git remote set-url origin "$TOKEN_URL"

# 清理函数：无论成功或失败都必须执行
cleanup() {
  echo ""
  echo -e "${CYAN}🔒 正在清理Token...${NC}"
  git remote set-url origin "$ORIGIN_URL" 2>/dev/null || true
  unset TOKEN 2>/dev/null || true
  unset TOKEN_URL 2>/dev/null || true
  history -c 2>/dev/null || true
  echo -e "${GREEN}✅ Token 已清除${NC}"
}
trap cleanup EXIT

# 添加并提交
echo -e "${CYAN}正在提交变更...${NC}"
git add -A
if ! git commit -m "$COMMIT_MSG" 2>/dev/null; then
  echo -e "${YELLOW}⚠️ 无新变更可提交${NC}"
fi

# 推送（带超时保护）
echo -e "${CYAN}正在推送到 GitHub（超时限制: 60秒）...${NC}"
PUSH_OUTPUT=""
PUSH_STATUS=0

# 使用 timeout 命令限制推送时间
if command -v timeout &>/dev/null; then
  if ! PUSH_OUTPUT=$(timeout 60 git push origin main 2>&1); then
    PUSH_STATUS=$?
  fi
else
  # 无 timeout 命令时的备选
  if ! PUSH_OUTPUT=$(git push origin main 2>&1); then
    PUSH_STATUS=$?
  fi
fi

# 输出推送结果（隐藏Token）
echo "${PUSH_OUTPUT//${TOKEN}/***HIDDEN***}"

# 判断结果
if [[ $PUSH_STATUS -eq 0 ]]; then
  echo ""
  echo -e "${GREEN}✅ 推送成功！${NC}"
  echo "🔗 仓库地址: https://github.com/${USER_NAME}/${REPO_NAME}"
  echo "🔖 版本: ${VERSION}"
  echo "📝 提交: $(git log --oneline -1 | cut -d' ' -f1)"
elif [[ $PUSH_STATUS -eq 124 ]]; then
  echo ""
  echo -e "${RED}❌ 推送超时（网络连接问题）${NC}"
  echo ""
  echo "替代方案："
  echo "1. 打包下载: zip -r deploy.zip . -x 'node_modules/*' -x 'dist/*' -x '.git/*'"
  echo "2. 本地推送: 下载 zip 后解压，在本地执行 git push"
  exit 2
elif echo "$PUSH_OUTPUT" | grep -q "403"; then
  echo ""
  echo -e "${RED}❌ 权限不足 (403)${NC}"
  echo "可能原因:"
  echo "  - Token 没有 repo 权限"
  echo "  - 组织仓库需要 SSO 授权"
  echo "  - Token 已过期或被撤销"
  exit 3
elif echo "$PUSH_OUTPUT" | grep -q "rejected.*non-fast-forward"; then
  echo ""
  echo -e "${RED}❌ 推送被拒绝（存在冲突）${NC}"
  echo "解决方案: git pull origin main 后重新推送"
  exit 4
else
  echo ""
  echo -e "${RED}❌ 推送失败 (状态码: ${PUSH_STATUS})${NC}"
  exit 1
fi
