# 阿里云服务器手动部署教程（自主上传）

> 适用场景：GitHub Actions 网络不稳定时，直接在阿里云服务器上拉取代码、构建并部署。

---

## 一、服务器环境准备

### 1.1 安装 Node.js 22

```bash
# 使用 NodeSource 安装 Node 22
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

# 验证
node -v   # v22.x.x
npm -v
```

### 1.2 安装 pnpm 11

```bash
# 全局安装 pnpm 11
npm install -g pnpm@11.3.0

# 验证
pnpm -v   # 11.3.0
```

### 1.3 安装 Nginx

```bash
# Ubuntu/Debian
apt-get update
apt-get install -y nginx

# 启动并开机自启
systemctl start nginx
systemctl enable nginx
```

---

## 二、项目部署目录

### 2.1 创建网站目录

```bash
mkdir -p /www/wwwroot/xytech-website
cd /www/wwwroot/xytech-website
```

### 2.2 从 GitHub 克隆项目

```bash
git clone https://github.com/haoboy007/xytech-website.git .
```

---

## 三、构建项目

### 3.1 安装依赖

```bash
cd /www/wwwroot/xytech-website
pnpm install --frozen-lockfile
```

### 3.2 构建生产版本

```bash
# 设置环境变量并构建
export BASE_URL=/
export SKIP_MIAODA_PLUGIN=true
pnpm exec vite build

# 构建产物位于 dist/ 目录
ls -la dist/
```

---

## 四、Nginx 配置

### 4.1 创建站点配置文件

```bash
# 创建配置文件
cat > /etc/nginx/sites-available/xytech-website << 'EOF'
server {
    listen 80;
    server_name www.cnxy.tech cnxy.tech;
    root /www/wwwroot/xytech-website/dist;
    index index.html;

    # 前端路由支持（SPA）
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
EOF
```

### 4.2 启用站点

```bash
# 创建软链接
ln -s /etc/nginx/sites-available/xytech-website /etc/nginx/sites-enabled/

# 测试配置
nginx -t

# 重载 Nginx
systemctl reload nginx
```

---

## 五、HTTPS / SSL 配置（宝塔面板更简单）

### 方式 A：使用宝塔面板（推荐）

1. 登录宝塔面板：`http://47.100.36.211:8888`
2. 点击「网站」→「添加站点」
3. 填写域名：`www.cnxy.tech`
4. 根目录选择：`/www/wwwroot/xytech-website/dist`
5. PHP 版本选择「纯静态」
6. 点击「设置」→「SSL」→「Let's Encrypt」申请免费证书
7. 开启「强制 HTTPS」

### 方式 B：手动配置 Certbot

```bash
# 安装 Certbot
apt-get install -y certbot python3-certbot-nginx

# 申请证书
certbot --nginx -d www.cnxy.tech -d cnxy.tech

# 自动续期已配置，无需手动操作
```

---

## 六、域名 DNS 配置

在域名服务商处添加 A 记录：

| 记录类型 | 主机记录 | 记录值 |
|---------|---------|--------|
| A | www | 47.100.36.211 |
| A | @ | 47.100.36.211 |

---

## 七、后续更新部署

### 7.1 更新代码并重新构建

```bash
cd /www/wwwroot/xytech-website

# 拉取最新代码
git pull origin main

# 重新安装依赖（如 package.json 有变化）
pnpm install --frozen-lockfile

# 重新构建
export BASE_URL=/
export SKIP_MIAODA_PLUGIN=true
pnpm exec vite build

# Nginx 自动读取 dist/ 目录，无需重启
# 如需清除浏览器缓存，可重载 Nginx
systemctl reload nginx
```

### 7.2 自动化脚本（可选）

将上述命令保存为脚本，一键更新：

```bash
cat > /www/wwwroot/update-xytech.sh << 'EOF'
#!/bin/bash
set -e
cd /www/wwwroot/xytech-website
echo "拉取最新代码..."
git pull origin main
echo "安装依赖..."
pnpm install --frozen-lockfile
echo "构建项目..."
export BASE_URL=/
export SKIP_MIAODA_PLUGIN=true
pnpm exec vite build
echo "重新加载 Nginx..."
systemctl reload nginx
echo "✅ 部署完成！"
EOF

chmod +x /www/wwwroot/update-xytech.sh
```

使用方法：
```bash
/www/wwwroot/update-xytech.sh
```

---

## 八、常见问题

### Q1：构建时出现 `packages field missing or empty`

确保 `pnpm-workspace.yaml` 包含以下内容：
```yaml
packages:
  - '.'
```

### Q2：GitHub 拉取代码时网络超时

```bash
# 配置 Git 代理（如有代理服务器）
git config --global http.proxy http://代理IP:端口

# 或使用 SSH 方式拉取
git clone git@github.com:haoboy007/xytech-website.git
```

### Q3：pnpm install 报错

```bash
# 清除缓存重试
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Q4：Nginx 403 错误

```bash
# 检查目录权限
chmod 755 /www/wwwroot/xytech-website/dist
chown -R www-data:www-data /www/wwwroot/xytech-website/dist
```

---

## 九、服务器安全配置（重要）

```bash
# 修改 root 密码
passwd root

# 宝塔面板修改默认密码
# 登录 http://47.100.36.211:8888 → 面板设置 → 修改密码

# 阿里云安全组配置：仅开放 22, 80, 443, 8888
# 登录阿里云控制台 → 安全组 → 配置规则
```

---

## 十、部署完成检查清单

- [ ] Node.js 22 已安装
- [ ] pnpm 11.3.0 已安装
- [ ] Nginx 已安装并运行
- [ ] 项目已克隆到 `/www/wwwroot/xytech-website`
- [ ] `pnpm install` 成功
- [ ] `pnpm exec vite build` 成功，dist/ 目录存在
- [ ] Nginx 站点配置正确
- [ ] 域名 A 记录指向服务器 IP
- [ ] SSL 证书已申请
- [ ] 访问 `https://www.cnxy.tech` 正常显示

---

> 如有问题，请检查 Nginx 错误日志：`tail -f /var/log/nginx/error.log`
