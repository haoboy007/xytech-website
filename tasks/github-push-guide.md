# GitHub 推送傻瓜教程（写给 Git 新手）

> 目标：把秒哒里的雄元科技官网代码，推送到你的 GitHub 仓库

---

## 第一步：在 GitHub 上创建仓库

1. 打开浏览器，访问 **https://github.com/new**
2. **Repository name** 填入：`xytech-website`（可以随便取）
3. **Description**（描述）可选填：`雄元科技官网 - React + TypeScript + Tailwind`
4. 选择 **Public**（公开，免费）
5. **不要勾选** "Initialize this repository with a README"
6. 点击页面最下方的绿色按钮 **Create repository**

---

## 第二步：在秒哒终端执行推送命令

按顺序复制以下命令，粘贴到秒哒终端执行：

```bash
cd /workspace/app-bset9i1icp35

# 设置你的 Git 身份信息（已设置可跳过）
git config user.name "haoboy007"
git config user.email "haoboy007@users.noreply.github.com"

# 添加远程仓库（注意：把 xytech-website 换成你实际取的仓库名）
git remote add origin https://github.com/haoboy007/xytech-website.git

# 切换到 main 分支并推送
git branch -M main
git push -u origin main
```

执行最后一条 `git push` 后，终端会提示输入密码：

```
Username for 'https://github.com': haoboy007
Password for 'https://haoboy007@github.com':
```

**注意**：这里的 Password **不是你的 GitHub 登录密码**，而是 GitHub 的 **Personal Access Token（个人访问令牌）**。

---

## 第三步：获取 GitHub Personal Access Token

如果你还没有 Token，按以下步骤生成：

### 3.1 打开 Token 生成页面

浏览器访问：**https://github.com/settings/tokens/new**

### 3.2 填写 Token 信息

| 项目 | 填写内容 |
|------|----------|
| **Note** | `xytech-deploy`（随便填，用于标识） |
| **Expiration** | 选择 **No expiration**（永不过期）或 **90 days** |
| **Select scopes** | 勾选以下内容： |

**必须勾选的权限：**

- ✅ `repo` — 完整仓库控制（推送/拉取/删除）

勾选后点击页面底部 **Generate token** 按钮。

### 3.3 复制 Token

**⚠️ 重要**：Token 只会显示一次！请立即复制保存到安全的地方（比如记事本）。

格式类似：`ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## 第四步：回到秒哒继续推送

把刚才复制的 Token 粘贴到密码提示处，然后回车。

```
Username for 'https://github.com': haoboy007
Password for 'https://haoboy007@github.com': ghp_xxxxxxxxxxxxxxxxxxxxx
```

如果看到以下输出，说明推送成功：

```
Enumerating objects: ...
Counting objects: ...
Writing objects: ...
remote: Resolving deltas: ...
To https://github.com/haoboy007/xytech-website.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

---

## 第五步：验证推送成功

1. 打开浏览器，访问：**https://github.com/haoboy007/xytech-website**
2. 应该能看到你的代码文件列表
3. 点击 **Actions** 标签，应该能看到一个名为 "Deploy to Aliyun Server" 的工作流

---

## 第六步：以后每次更新的推送（只需3行）

以后在秒哒修改代码后，只需执行：

```bash
cd /workspace/app-bset9i1icp35
git add .
git commit -m "描述这次更新做了什么"
git push origin main
```

**示例：**

```bash
git add .
git commit -m "feat: 修改首页标题文字"
git push origin main
```

推送后：
- GitHub Actions 会自动构建并部署到阿里云服务器（约2-3分钟）
- 访问 `https://www.cnxy.tech` 即可看到更新

---

## 常见问题 FAQ

### Q1: 提示 "remote origin already exists"

说明你之前添加过远程仓库。执行：

```bash
git remote remove origin
git remote add origin https://github.com/haoboy007/xytech-website.git
```

### Q2: 提示 "Authentication failed"

检查：
1. Token 是否复制完整（包括 `ghp_` 前缀）
2. Token 是否勾选了 `repo` 权限
3. 是否输入了 GitHub 登录密码（应该用 Token 而不是密码）

### Q3: 提示 "Permission denied"

可能是 Token 权限不够，重新生成一个并确保勾选 `repo`。

### Q4: 如何保存 Token 避免每次都输入？

使用 Git 凭证缓存：

```bash
# 缓存凭证15分钟
git config --global credential.helper cache

# 或者永久保存（有安全风险，仅在私人电脑使用）
git config --global credential.helper store
```

### Q5: 推送时提示 "rejected"（拒绝推送）

如果 GitHub 仓库已有内容，执行：

```bash
git pull origin main --rebase
git push origin main
```

### Q6: 我不想要公开仓库，可以用私有仓库吗？

可以！在创建仓库时选择 **Private**。GitHub 现在对免费用户也支持私有仓库，但 GitHub Actions 的免费额度有限制（每月2000分钟）。

---

## 完整流程图

```
秒哒修改代码
    ↓
git add .                  ← 告诉 Git 哪些文件要保存
git commit -m "描述"        ← 保存这次修改的快照
git push origin main       ← 把快照推送到 GitHub
    ↓
GitHub 收到代码
    ↓
GitHub Actions 自动运行
    ↓
自动构建 → 上传到阿里云
    ↓
官网 www.cnxy.tech 更新
```

---

## 联系支持

如有问题请联系：
- 邮箱：hezuo@cnxy.tech
- 电话：18301592576
