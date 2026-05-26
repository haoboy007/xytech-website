# 雄元科技官网 — 阿里云服务器自动部署指南

> 服务器信息：阿里上海轻量云 · IP: 47.100.36.211
> 宝塔面板：http://47.100.36.211:8888

---

## 一、服务器端配置（在宝塔面板执行）

### 1. 创建网站目录

登录宝塔面板 → 终端，执行：

```bash
mkdir -p /www/wwwroot/xytech-website
chmod 755 /www/wwwroot/xytech-website
```

### 2. 添加 SSH 公钥（用于 GitHub Actions 自动部署）

在宝塔终端执行以下命令，生成密钥对：

```bash
# 生成密钥对
ssh-keygen -t ed25519 -C "github-actions-deploy" -f /root/.ssh/github_actions -N ""

# 添加公钥到 authorized_keys
cat /root/.ssh/github_actions.pub >> /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys

# 显示公钥内容（供核对）
echo "=== SSH 公钥 ==="
cat /root/.ssh/github_actions.pub

# 显示私钥内容（需要复制到 GitHub Secrets）
echo ""
echo "=== SSH 私钥（请完整复制以下内容）==="
cat /root/.ssh/github_actions
```

> ⚠️ **安全提醒**：私钥内容请妥善保管，仅用于 GitHub Secrets 配置。

---

## 二、宝塔面板站点配置

### 1. 添加站点

1. 宝塔面板 → 网站 → 添加站点
2. 域名：填写 `www.cnxy.tech`（或您的实际域名）
3. 根目录：`/www/wwwroot/xytech-website`
4. 选择 PHP 版本：**纯静态**
5. 点击提交

### 2. 配置伪静态（SPA 路由回退）

1. 进入站点设置 → 伪静态
2. 选择模板：`thinkphp` 或输入以下内容：

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

3. 点击保存

### 3. 配置 SSL（可选但强烈建议）

1. 站点设置 → SSL → Let's Encrypt
2. 勾选域名 → 申请证书
3. 开启 **强制 HTTPS**

---

## 三、GitHub 仓库 Secrets 配置

### 1. 打开 Secrets 页面

访问：
```
https://github.com/haoboy007/xytech-website/settings/secrets/actions
```

### 2. 添加以下 Secrets

| Secret 名称 | 值 | 说明 |
|-------------|-----|------|
| `ALIYUN_HOST` | `47.100.36.211` | 阿里云服务器公网 IP |
| `ALIYUN_USERNAME` | `root` | SSH 登录用户名 |
| `ALIYUN_SSH_KEY` | *(私钥内容)* | 上一步生成的私钥完整内容 |
| `ALIYUN_TARGET_DIR` | `/www/wwwroot/xytech-website` | 网站部署目录 |

### 3. 添加 Secret 步骤

1. 点击 **New repository secret**
2. Name 填入上表中的名称
3. Secret 填入对应的值
4. 点击 **Add secret**

---

## 四、触发自动部署

### 方式 1：推送代码自动触发

本地推送代码到 main 分支：

```bash
git add -A
git commit -m "更新网站内容"
git push origin main
```

GitHub Actions 将自动：
1. 构建网站（BASE_URL=/，适配自定义域名）
2. 通过 SSH 上传到阿里云服务器

### 方式 2：手动触发

1. 打开 GitHub 仓库 → Actions → **Deploy to Aliyun Server**
2. 点击 **Run workflow** → 选择分支 `main` → **Run workflow**

---

## 五、查看部署状态

### 查看 Actions 运行日志

https://github.com/haoboy007/xytech-website/actions

### 查看部署后的网站

等待约 1-2 分钟后访问：
- http://www.cnxy.tech（配置域名后）
- http://47.100.36.211（直接使用 IP）

---

## 六、常见问题

### Q1: SSH 连接失败

检查：
1. 阿里云安全组是否放行 22 端口
2. `/root/.ssh/authorized_keys` 权限是否为 600
3. SSH 私钥是否正确复制到 GitHub Secrets

### Q2: 网站刷新 404

检查宝塔伪静态配置：
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### Q3: 样式或脚本加载失败

检查 `BASE_URL` 环境变量是否为 `/`（阿里云使用自定义域名时）。

---

## 七、安全建议

1. ✅ 修改宝塔面板默认密码
2. ✅ 修改服务器 root 密码：`passwd root`
3. ✅ 阿里云安全组仅开放必要端口（22/80/443/8888）
4. ✅ 配置域名 DNS 解析到 47.100.36.211
5. ✅ 启用宝塔面板 SSL

---

*文档生成时间: 2026-05-26*