#!/bin/bash
# ============================================
# 秒哒一键构建 + 自动推送到 GitHub
# 用法: GITHUB_TOKEN=你的Token ./push-to-github.sh
# ============================================

cd "$(dirname "$0")"

GITHUB_USER="haoboy007"
GITHUB_REPO="xytech-website"
ORIGIN_URL="https://github.com/${GITHUB_USER}/${GITHUB_REPO}.git"

echo "========================================"
echo "  秒哒 → GitHub 一键推送"
echo "========================================"
echo ""

# 检查 GitHub Token
if [ -z "$GITHUB_TOKEN" ]; then
    echo "  ⚠️  未找到 GITHUB_TOKEN 环境变量"
    echo ""
    echo "  请使用以下方式设置 Token："
    echo ""
    echo "  方式1 - 临时设置（推荐，当前会话有效）："
    echo "    export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx"
    echo "    ./push-to-github.sh"
    echo ""
    echo "  方式2 - 一行命令执行："
    echo "    GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx ./push-to-github.sh"
    echo ""
    echo "  方式3 - 写入 ~/.bashrc 永久生效："
    echo "    echo 'export GITHUB_TOKEN=你的Token' >> ~/.bashrc"
    echo "    source ~/.bashrc"
    echo ""
    echo "  Token 获取地址：https://github.com/settings/tokens"
    echo "  需要勾选权限：repo（完整仓库访问）"
    exit 1
fi

echo "[1/5] 配置免密推送..."
git remote set-url origin "https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/${GITHUB_USER}/${GITHUB_REPO}.git"

echo "[2/5] 构建生产包..."
npm run build
if [ ! -d "dist" ]; then
    echo "  ❌ 构建失败，dist 目录不存在"
    git remote set-url origin "$ORIGIN_URL"
    exit 1
fi

echo "[3/5] 清理构建产物..."
sed -i '/<link rel="stylesheet" id="fonts-code"/d' dist/index.html 2>/dev/null || true

echo "[4/5] 提交代码..."
git add .
git commit -m "deploy: $(date '+%Y-%m-%d %H:%M:%S')" || true

echo "[5/5] 推送到 GitHub..."
GIT_TERMINAL_PROMPT=0 git push origin main
PUSH_STATUS=$?

# 恢复原始 remote URL（安全清理）
git remote set-url origin "$ORIGIN_URL"

if [ $PUSH_STATUS -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "  ✅ 推送成功！"
    echo "  服务器将在5分钟内自动拉取更新"
    echo "========================================"
else
    echo ""
    echo "========================================"
    echo "  ❌ 推送失败，请检查 Token 是否有效"
    echo "========================================"
    exit 1
fi
