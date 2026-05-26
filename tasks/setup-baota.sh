#!/bin/bash
# ============================================
# 宝塔面板自动部署一键配置脚本
# 在阿里云服务器终端执行
# ============================================

set -e

echo "=========================================="
echo "  雄元科技官网 - 宝塔自动部署配置"
echo "=========================================="

# 0. 升级 Node.js 到 v20（关键！）
echo ""
echo "[0/5] 升级 Node.js..."
if [ -f /www/server/nvm/nvm.sh ]; then
    source /www/server/nvm/nvm.sh
    nvm install 20
    nvm use 20
    nvm alias default 20
else
    # 安装 nvm
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install 20
    nvm use 20
fi

node -v
echo "✅ Node.js 升级完成"

# 1. 创建源码目录并克隆
echo ""
echo "[1/5] 创建源码目录并克隆仓库..."
rm -rf /www/wwwroot/xytech-source
mkdir -p /www/wwwroot/xytech-source
cd /www/wwwroot/xytech-source
git clone https://github.com/haoboy007/xytech-website.git .

# 2. 安装依赖并构建
echo ""
echo "[2/5] 安装依赖并构建..."
npm install
npm run build

# 验证构建产物
if [ ! -d "/www/wwwroot/xytech-source/dist" ]; then
    echo "❌ 构建失败，dist 目录不存在"
    exit 1
fi
echo "✅ 构建成功"

# 3. 部署到网站目录
echo ""
echo "[3/5] 部署到网站目录..."
mkdir -p /www/wwwroot/xytech
rm -rf /www/wwwroot/xytech/*
cp -r /www/wwwroot/xytech-source/dist/* /www/wwwroot/xytech/
chown -R www:www /www/wwwroot/xytech
chmod -R 755 /www/wwwroot/xytech
echo "✅ 部署完成"

# 4. 创建自动部署脚本
echo ""
echo "[4/5] 创建自动部署脚本..."

# 使用 printf 写入避免 heredoc 问题
printf '%s\n' '#!/bin/bash' \
'set -e' \
'SOURCE_DIR="/www/wwwroot/xytech-source"' \
'DEPLOY_DIR="/www/wwwroot/xytech"' \
'LOG_FILE="/www/wwwroot/deploy.log"' \
'LOCK_FILE="/tmp/xytech-deploy.lock"' \
'' \
'if [ -f "$LOCK_FILE" ]; then' \
'    PID=$(cat "$LOCK_FILE" 2>/dev/null || echo "")' \
'    if [ -n "$PID" ] && ps -p "$PID" > /dev/null 2>&1; then' \
'        echo "[$(date)] 部署进程运行中，跳过" >> "$LOG_FILE"' \
'        exit 0' \
'    fi' \
'    rm -f "$LOCK_FILE"' \
'fi' \
'' \
'echo $$ > "$LOCK_FILE"' \
'' \
'cd "$SOURCE_DIR"' \
'git fetch origin main 2>/dev/null || exit 0' \
'LOCAL=$(git rev-parse HEAD)' \
'REMOTE=$(git rev-parse origin/main 2>/dev/null || echo "$LOCAL")' \
'' \
'if [ "$LOCAL" = "$REMOTE" ]; then' \
'    echo "[$(date)] 已是最新" >> "$LOG_FILE"' \
'    rm -f "$LOCK_FILE"' \
'    exit 0' \
'fi' \
'' \
'echo "[$(date)] 发现更新 ${LOCAL:0:7} -> ${REMOTE:0:7}" >> "$LOG_FILE"' \
'git reset --hard origin/main' \
'npm install' \
'npm run build' \
'rm -rf "$DEPLOY_DIR"/*' \
'cp -r "$SOURCE_DIR/dist/"* "$DEPLOY_DIR/"' \
'chown -R www:www "$DEPLOY_DIR"' \
'echo "[$(date)] 部署完成 $(git rev-parse --short HEAD)" >> "$LOG_FILE"' \
'rm -f "$LOCK_FILE"' \
> /www/wwwroot/auto-deploy.sh

chmod +x /www/wwwroot/auto-deploy.sh
echo "✅ 自动部署脚本已创建"

# 5. 安装 PM2 并配置进程守护
echo ""
echo "[5/5] 配置 PM2 进程守护..."
npm install -g pm2 serve

mkdir -p /www/wwwroot/logs

printf '%s\n' 'module.exports = {' \
'  apps: [{' \
'    name: "xytech-website",' \
'    cwd: "/www/wwwroot/xytech",' \
'    script: "npx",' \
'    args: "serve -s . -l 3456",' \
'    instances: 1,' \
'    autorestart: true,' \
'    max_memory_restart: "500M",' \
'    env: { NODE_ENV: "production" },' \
'    log_file: "/www/wwwroot/logs/xytech.log",' \
'    error_file: "/www/wwwroot/logs/xytech-error.log",' \
'    out_file: "/www/wwwroot/logs/xytech-out.log"' \
'  }]' \
'};' \
> /www/wwwroot/ecosystem.config.js

# 杀掉旧进程
pm2 delete xytech-website 2>/dev/null || true

# 启动新进程
pm2 start /www/wwwroot/ecosystem.config.js
pm2 save

# 配置开机自启
pm2 startup systemd --user root 2>/dev/null || pm2 startup

echo ""
echo "=========================================="
echo "  ✅ 配置完成！"
echo "=========================================="
echo ""
echo "下一步："
echo "  1. 宝塔面板 → 计划任务 → 添加任务"
echo "     类型: Shell脚本"
echo "     名称: 雄元官网-自动部署"
echo "     周期: 每5分钟"
echo "     脚本: /www/wwwroot/auto-deploy.sh"
echo ""
echo "  2. 网站设置 → 配置文件 → 确认包含："
echo "     location / {"
echo "       root /www/wwwroot/xytech;"
echo "       try_files \$uri \$uri/ /index.html;"
echo "     }"
echo ""
echo "  3. 保存 → 重载配置"
echo ""
echo "PM2 状态:"
pm2 status
