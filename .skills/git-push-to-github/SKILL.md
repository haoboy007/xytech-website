---
name: git-push-to-github
description: >
  在秒哒（Miaoda）等云端开发环境中，全自动将当前项目的最新代码推送到 GitHub 远程仓库。
  用户**仅需提供 GitHub Personal Access Token**，本技能自动完成：
  检测Git仓库状态 → 读取上次推送记录 → **自动推断版本号（在上次基础上递增）**
  → **自动分析git diff生成更新摘要** → 生成规范化的commit message
  → 使用Token配置远程URL → 推送代码 → 清理Token确保安全。
  适用于用户需要将秒哒内完成的代码改动（前端、后端、Edge Functions 等）
  部署到 GitHub 的场景，全程无需用户手动输入版本号或更新内容。
  触发时机：用户说"推送到GitHub"、"部署到GitHub"、"git push到github"、
  "把代码推到GitHub"、"同步到github"、"发布到github"、
  "备份代码到github"，或任何涉及将秒哒代码推送到远程GitHub仓库的请求。
  即使环境网络不稳定导致直接git push超时，本技能也会提供
  打包下载+手动上传的备选方案。
---

# GitHub 代码推送技能

## 核心目标

在秒哒云端环境中，**全自动**将当前工作目录的代码推送到 GitHub 远程仓库。用户只需提供 Token，版本号和更新摘要均由秒哒自动推断。

## 前置条件检查

执行推送前，按以下顺序检查：

1. **Git 仓库检测**
   - 检查当前目录是否存在 `.git` 文件夹
   - 如果不存在，向用户说明：当前目录不是 Git 仓库，是否需要先 `git init` 或切换到正确目录

2. **远程仓库检测**
   - 执行 `git remote -v`，确认是否已配置 `origin`
   - 如果无 origin，询问用户 GitHub 仓库地址（如 `https://github.com/user/repo.git`）

3. **变更检测**
   - 执行 `git status --short`
   - 如果无变更，提示用户当前工作区无修改，是否需要 `--force` 推送（不推荐）

4. **上次推送记录检测**
   - 执行 `git log --oneline -1` 获取最近 commit
   - 从 commit message 中提取版本号（正则匹配 `v[0-9]+` 或 `[0-9]+\.[0-9]+\.[0-9]+`）
   - 如果找不到版本号，默认从 `v1` 开始

5. **网络连通性测试**
   - 执行 `curl -sI https://github.com --connect-timeout 5 | head -1`
   - 如果超时或返回非200，预判直接推送可能失败，提前告知用户并准备备选方案

## 用户交互流程

### 第一步：获取 GitHub Token（唯一需要用户提供的）

向用户请求 GitHub Personal Access Token，提示格式如下：

> 请将 GitHub Personal Access Token 粘贴给我。生成方式：
> 1. 打开 https://github.com/settings/tokens
> 2. 点击 "Generate new token (classic)"
> 3. 勾选 `repo` 权限
> 4. 复制 Token（以 `ghp_` 开头）
>
> ⚠️ Token 仅用于本次推送，完成后立即清除。

### 第二步：自动推断版本号

**秒哒自动执行，无需询问用户。**

1. 读取最近 commit message：`git log --format=%B -1`
2. 用正则提取版本号：
   - `v([0-9]+)` → 提取 v{N} 格式
   - `([0-9]+)\.([0-9]+)\.([0-9]+)` → 提取 semver 格式
3. 递增版本号：
   - v52 → v53
   - 1.2.3 → 1.2.4（patch 位递增）
4. 如果找不到版本号，默认使用 `v1`
5. **向用户展示推断结果**："基于上次推送记录，本次自动使用版本号 **v53**，是否确认？"
   - 用户可直接确认，或提供自定义版本号覆盖

### 第三步：自动推断更新摘要

**秒哒自动执行，无需询问用户。**

1. 获取变更文件列表：`git diff --name-only HEAD`
2. 获取变更统计：`git diff --stat HEAD`
3. 基于文件路径和变更量，推断更新内容：

**推断规则表：**

| 文件路径模式 | 推断为 |
|-------------|--------|
| `src/components/**/*.tsx` | "优化前端页面组件" |
| `src/components/ai-assistant/*` | "改进 AI 智能助手功能" |
| `src/components/Hero.tsx` | "优化首页 Hero 区视觉效果" |
| `src/components/Navbar.tsx` | "改进导航栏交互体验" |
| `supabase/functions/**/*` | "更新后端 Edge Functions" |
| `src/db/*` | "调整数据库相关配置" |
| `src/hooks/*` | "新增或优化 React Hooks" |
| `public/**/*` | "更新静态资源文件（图片/图标等）" |
| `package.json` | "更新项目依赖" |
| `*.css` / `*.scss` | "调整样式与配色方案" |
| `*.md` | "更新文档内容" |
| `.skills/**/*` | "新增或改进技能模块" |
| `tasks/*` | "更新任务交付物" |

4. 读取关键文件的 diff 内容（最多5个文件的前30行），用 AI 推理生成更精确的摘要
5. 生成 3-5 条更新要点
6. **向用户展示推断结果**：
   ```
   基于代码变更自动推断的更新摘要：
   - 修复 AI 助手飞书推送调用方式（fetch 替代 supabase.invoke）
   - 添加协作平台同步说明文案（3处提示）
   - 优化 Hero 区波浪线高亮交互效果
   是否确认？可直接确认或修改。
   ```

### 第四步：生成 Commit Message

基于自动推断的版本号和摘要，生成规范化 commit message：

```
feat: 自动推断的更新标题

版本: v53

更新内容：
- 要点1（自动推断）
- 要点2（自动推断）
- 要点3（自动推断）

推送时间: 2026-05-26 12:30
推送环境: 秒哒云端
```

规则：
- 标题行使用 `type: description` 格式，type 由变更内容推断：
  - 新增功能 → `feat:`
  - 修复 Bug → `fix:`
  - 文档更新 → `docs:`
  - 样式调整 → `style:`
  - 重构代码 → `refactor:`
  - 其他 → `update:`
- 版本号单独一行
- 更新要点使用列表形式

### 第五步：执行推送（带超时保护）

推送使用内置脚本 `scripts/push.sh`，支持全自动模式：

**全自动模式（推荐）：**
```bash
./scripts/push.sh --auto <github_token>
```
此模式下脚本自动：
- 从上次 commit 提取版本号并递增
- 分析 `git diff` 推断更新摘要
- 生成规范化 commit message
- 执行安全推送 + Token 清理

**手动模式（可选）：**
```bash
./scripts/push.sh <github_token> <version> <commit_message>
```

**核心推送流程（内嵌于脚本中）：**
```bash
# 1. 保存原始远程URL
ORIGIN_URL=$(git remote get-url origin)

# 2. 设置带Token的远程URL（Token嵌入URL中，避免交互式密码输入）
git remote set-url origin "https://USER:TOKEN@github.com/USER/REPO.git"

# 3. 添加所有变更并提交
git add -A
git commit -m "生成的commit message"

# 4. 推送（带60秒超时）
git push origin main

# 5. 立即恢复原始URL（移除Token）
git remote set-url origin "$ORIGIN_URL"

# 6. 清除环境变量中的Token痕迹
unset TOKEN_VAR
```

> ⚠️ **关键安全步骤**：第5步和第6步必须立即执行，无论推送成功或失败。

### 第六步：结果反馈

根据推送结果向用户汇报：

#### 推送成功
```
✅ 推送成功！
📦 仓库: https://github.com/USER/REPO
🔖 版本: v52
📝 提交: abc1234 — 更新摘要标题
🔗 查看提交: https://github.com/USER/REPO/commit/abc1234
🔐 Token 已清除
```

#### 推送失败（网络超时）
```
❌ 推送失败：连接GitHub超时（环境网络限制）

已为您准备以下替代方案：

方案A（推荐）: 打包下载后手动上传
- 生成 zip 部署包
- 下载到本地解压
- 用 git push 或 GitHub 网页上传

方案B: 使用 GitHub CLI
- 在本地终端执行 gh repo sync

方案C: 使用 GitHub Desktop
- 下载 zip → 用 Desktop 打开 → 连接远程仓库 → 推送
```

#### 推送失败（权限不足）
```
❌ 推送失败：权限不足 (403)
可能原因：
1. Token 权限不足 — 请重新生成并勾选 "repo" 权限
2. 仓库所有者不匹配 — 确认您有该仓库的写入权限
3. 2FA 限制 — 部分组织仓库需要 SSO 授权

请检查 Token 设置后重试。
```

#### 推送失败（冲突）
```
❌ 推送失败：远程仓库存在冲突
建议：
1. 先执行 git pull origin main 合并远程变更
2. 解决冲突后重新推送

是否自动执行 git pull？
```

## 异常处理矩阵

| 异常 | 检测方式 | 处理策略 |
|------|---------|---------|
| 无Git仓库 | `.git` 不存在 | 提示初始化或切换目录 |
| 无origin | `git remote` 为空 | 询问仓库地址并配置 |
| 无变更 | `git status` 为空 | 询问是否强制推送 |
| 网络超时 | `curl github.com` 超时 | 立即准备zip打包备选方案 |
| 认证失败 | `git push` 返回 403/401 | 提示检查Token权限 |
| 推送冲突 | `git push` 返回 rejected | 提供git pull合并方案 |
| Token泄露风险 | 任何步骤中断 | 强制恢复URL + 清除变量 |

## 备选方案：打包下载手动上传

当直接推送因网络问题失败时，自动生成干净的部署包：

```bash
# 生成排除敏感文件的 zip 包
zip -r deploy.zip . \
  -x "node_modules/*" \
  -x "dist/*" \
  -x ".git/*" \
  -x "*.log" \
  -x ".env" \
  -x ".env.local"
```

提示用户：
1. 在秒哒文件管理器中下载 `deploy.zip`
2. 本地解压后执行：
   ```bash
   git add -A
   git commit -m "v52: 更新摘要"
   git push origin main
   ```
3. 或直接用 GitHub 网页上传

## 安全规范

1. **Token 生命周期**：仅在推送命令执行期间存在于内存中，完成后立即清除
2. **URL 恢复**：无论推送成功或失败，`git remote set-url origin` 恢复原始URL必须执行
3. **历史清理**：执行 `history -c` 清除终端历史中的Token痕迹
4. **不持久化**：绝不将Token写入任何文件（包括日志、配置、环境变量文件）
5. **权限最小化**：建议用户生成 Token 时仅勾选 `repo` 权限

## 参考文档

- `references/troubleshooting.md` — 常见问题及解决方案
- `references/security.md` — Token 安全最佳实践与泄露应急处理
