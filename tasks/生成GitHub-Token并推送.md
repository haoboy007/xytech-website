# GitHub Personal Access Token 生成 + 秒哒终端推送指南

---

## 第一步：在 GitHub 生成 Token（约 2 分钟）

### 1. 打开 Token 创建页面
点击链接直接跳转：
**https://github.com/settings/tokens**

> 如果未登录，先登录 GitHub 账号 `haoboy007`

### 2. 点击 "Generate new token (classic)"
页面右上角绿色按钮。

### 3. 填写基本信息
| 字段 | 填写内容 |
|------|---------|
| **Note** | `xytech-website-deploy` |
| **Expiration** | `No expiration`（或选择 30/90 天） |

### 4. 勾选权限（Scopes）
勾选以下复选框：
- ✅ **repo** — 完整控制私有仓库（包含所有子项）

> 不需要勾选其他权限。

### 5. 点击 "Generate token"
页面底部绿色按钮。

### 6. 复制 Token（⚠️ 仅此一次机会）
页面上会显示一串绿色背景的字符，例如：
```
ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
**立即复制**！关闭页面后**无法再次查看**。

---

## 第二步：在秒哒终端执行推送

### 方式 A：直接粘贴 Token（推荐）

将下方命令中的 `YOUR_TOKEN_HERE` 替换为您刚刚复制的 Token，然后在秒哒终端中执行：

```bash
cd /workspace/app-bset9i1icp35 && \
git remote set-url origin "https://haoboy007:YOUR_TOKEN_HERE@github.com/haoboy007/xytech-website.git" && \
git push origin main
```

推送成功后，恢复安全 URL：
```bash
cd /workspace/app-bset9i1icp35 && \
git remote set-url origin "https://github.com/haoboy007/xytech-website.git"
```

---

### 方式 B：先配置环境变量再推送（更安全，Token 不留在历史中）

```bash
# 1. 设置环境变量（将 YOUR_TOKEN 替换为实际值）
export GITHUB_TOKEN="YOUR_TOKEN_HERE"

# 2. 设置远程地址
cd /workspace/app-bset9i1icp35
git remote set-url origin "https://haoboy007:${GITHUB_TOKEN}@github.com/haoboy007/xytech-website.git"

# 3. 推送
git push origin main

# 4. 恢复安全 URL + 清除环境变量
git remote set-url origin "https://github.com/haoboy007/xytech-website.git"
unset GITHUB_TOKEN
```

---

## 第三步：验证推送成功

打开以下链接查看最新提交：
**https://github.com/haoboy007/xytech-website/commits/main**

如果看到最新提交 `3ebef8b`（或您自定义的提交信息），说明推送成功。

---

## 常见问题

### Q: 提示 "remote: Permission to ... denied"
Token 权限不足。请重新生成 Token，确保勾选了 `repo` 权限。

### Q: 提示 "fatal: Authentication failed"
Token 输入有误。注意 Token 格式是 `ghp_` 开头的一串字符，复制时不要遗漏。

### Q: 推送后想删除本地 Token 痕迹
执行以下命令清除终端历史中的敏感信息：
```bash
history -c
```
然后关闭当前终端会话。

---

## 安全提示

- ⭐ Token 具有您 GitHub 账号的仓库访问权限，**不要分享给他人**
- ⭐ 推送完成后立即恢复普通 HTTPS URL（去掉 Token）
- ⭐ 建议 Token 过期时间设为 30 天，用完即废
