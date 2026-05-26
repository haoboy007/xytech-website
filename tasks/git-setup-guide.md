# Git 仓库初始化与推送指南

## 第一步：在 GitHub 创建仓库

1. 打开 https://github.com/new
2. 仓库名称：`xytech-website`
3. 选择 **Public**（或 Private，Private 需要配置更多权限）
4. 勾选 **Add a README file**
5. 点击 **Create repository**

## 第二步：在秒哒终端初始化并推送代码

```bash
cd /workspace/app-bset9i1icp35

# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 提交（注意：不要提交 .env 中的敏感信息）
git commit -m "v17: 添加合伙人招募页面 + 自动部署配置"

# 关联远程仓库（替换为你的用户名）
git remote add origin https://github.com/你的用户名/xytech-website.git

# 推送到 main 分支
git branch -M main
git push -u origin main
```

## 第三步：配置 GitHub Secrets

进入仓库页面 → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

依次添加：

| Secret 名称 | 说明 | 示例值 |
|------------|------|--------|
| `ALIYUN_HOST` | 服务器 IP | `8.154.33.106` |
| `ALIYUN_PORT` | SSH 端口 | `22` |
| `ALIYUN_USER` | SSH 用户名 | `root` |
| `ALIYUN_PASSWORD` | SSH 密码 | 你的密码 |
| `ALIYUN_DEPLOY_PATH` | 部署目录 | `/www/wwwroot/xytech` |

## 第四步：以后每次更新

```bash
cd /workspace/app-bset9i1icp35

git add .
git commit -m "描述本次更新内容"
git push origin main
```

推送后 GitHub Actions 会自动构建并部署到阿里云服务器。

## 注意事项

1. **不要提交 `.env` 文件到 GitHub**
   - 已在 `.gitignore` 中排除
   - 生产环境需在服务器单独配置

2. **首次推送可能需要 GitHub 认证**
   ```bash
   # 配置 Git 用户名和邮箱
   git config --global user.name "你的名字"
   git config --global user.email "your@email.com"
   ```

3. **如果 push 失败**，可能是 GitHub 需要 Personal Access Token
   - 访问 https://github.com/settings/tokens
   - 生成 Token 替代密码

## 验证部署

推送后访问：
- GitHub 仓库 → **Actions** 标签查看构建状态
- 官网 `https://www.cnxy.tech` 查看是否更新
