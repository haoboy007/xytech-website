# 雄元科技官网 — 部署到 GitHub 指南

## 部署包信息
- **文件**：`xytech-website-deploy.zip`（3.2 MB）
- **代码状态**：最新版，已提交到本地 Git
- **最新提交**：`3ebef8b` — 修复飞书推送调用方式 + 添加协作平台同步说明

---

## 方案一：GitHub 网页手动上传（推荐，最简单）

### 步骤 1：下载部署包
在秒哒文件管理器中下载 `tasks/xytech-website-deploy.zip`。

### 步骤 2：进入 GitHub 仓库
打开 https://github.com/haoboy007/xytech-website

### 步骤 3：上传文件
1. 点击页面上的 **"Add file"** → **"Upload files"**
2. 将 zip 包解压到本地
3. 将解压后的所有文件（保留目录结构）拖拽到 GitHub 上传区域
4. 在 **"Commit changes"** 区域填写提交信息：
   ```
   更新：修复飞书推送 + 添加同步说明文案 + 波浪线动画
   ```
5. 点击 **"Commit changes"**

### 步骤 4：确认部署成功
刷新 GitHub 仓库页面，确认 `src/components/ai-assistant/AIAssistant.tsx` 已更新。

---

## 方案二：命令行推送（需要 GitHub Token）

如果您想在秒哒终端直接推送到 GitHub，需要先配置 GitHub Personal Access Token：

### 步骤 1：生成 GitHub Token
1. 打开 https://github.com/settings/tokens
2. 点击 **"Generate new token (classic)"**
3. 勾选权限：`repo`（完整仓库访问权限）
4. 点击 **"Generate token"**
5. **立即复制 token**（页面关闭后不可再见）

### 步骤 2：在秒哒终端执行推送命令
```bash
cd /workspace/app-bset9i1icp35

# 使用 token 配置远程地址（将 YOUR_TOKEN 替换为实际 token）
git remote set-url origin https://haoboy007:YOUR_TOKEN@github.com/haoboy007/xytech-website.git

# 推送最新代码
git push origin main

# 推送完成后，恢复安全URL（可选）
git remote set-url origin https://github.com/haoboy007/xytech-website.git
```

### 步骤 3：验证推送
打开 https://github.com/haoboy007/xytech-website/commits/main 查看最新提交。

---

## 方案三：GitHub Desktop / VS Code Git 扩展

1. 将 `xytech-website-deploy.zip` 下载到本地并解压
2. 用 GitHub Desktop 或 VS Code 打开解压后的文件夹
3. 连接到远程仓库 `https://github.com/haoboy007/xytech-website.git`
4. 提交并推送所有更改

---

## 本次部署包含的更新内容

| 文件 | 更新内容 |
|------|---------|
| `src/components/ai-assistant/AIAssistant.tsx` | 修复飞书推送：`supabase.functions.invoke()` → 原生 `fetch` |
| `src/components/ai-assistant/AIAssistant.tsx` | 添加3处说明文案：对话内容将同步至企业协作平台用于回访 |
| `src/components/Hero.tsx` | 太极粒子系统 → 简洁波浪线光流动效 |
| `src/components/Hero.tsx` | 波浪线高亮 + 鼠标靠近变金色 |
| `src/components/Navbar.tsx` | 适配暗色Hero区，z-index提升 |

---

## 注意事项

1. **不要提交 `.env` 文件** — 已排除在 zip 包外，需手动创建
2. **不要提交 `node_modules`** — 已在 `.gitignore` 中排除
3. **Vite 构建** — 部署后如需更新线上版本，需在 Vercel/Cloudflare Pages 等平台重新构建
4. **Edge Functions** — Supabase Edge Function 代码需单独在 Supabase 控制台部署，不在前端代码仓库中管理
