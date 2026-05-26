#!/bin/bash
# ============================================
# 宝塔面板自动部署脚本（服务器端执行）
# 将此脚本放在服务器 /www/wwwroot/deploy.sh
# 用法：bash /www/wwwroot/deploy.sh
# ============================================

set -e

# 配置
REPO_URL="https://github.com/你的用户名/xytech-website.git"
SOURCE_DIR="/www/wwwroot/xytech-source"
DEPLOY_DIR="/www/wwwroot/xytech"
LOG_FILE="/www/wwwroot/deploy.log"

echo "========================================" | tee -a "$LOG_FILE"
echo "  雄元科技官网自动部署 $(date)" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"

# 确保源码目录存在
if [ ! -d "$SOURCE_DIR/.git" ]; then
    echo "[INFO] 首次克隆仓库..." | tee -a "$LOG_FILE"
    mkdir -p "$SOURCE_DIR"
    git clone "$REPO_URL" "$SOURCE_DIR"
fi

cd "$SOURCE_DIR"

echo "[1/6] 拉取最新代码..." | tee -a "$LOG_FILE"
git fetch origin main
git reset --hard origin/main

echo "[2/6] 安装依赖..." | tee -a "$LOG_FILE"
npm install

echo "[3/6] 构建生产包..." | tee -a "$LOG_FILE"
npm run build

echo "[4/6] 移除秒哒CDN链接..." | tee -a "$LOG_FILE"
sed -i '/<link rel="stylesheet" id="fonts-code"/d' dist/index.html

echo "[5/6] 验证构建产物..." | tee -a "$LOG_FILE"
FILE_COUNT=$(find dist -type f | wc -l)
echo "  文件数量: $FILE_COUNT" | tee -a "$LOG_FILE"

echo "[6/6] 部署到网站目录..." | tee -a "$LOG_FILE"
rm -rf "$DEPLOY_DIR"/*
cp -r "$SOURCE_DIR"/dist/* "$DEPLOY_DIR"/

# 修正权限
chown -R www:www "$DEPLOY_DIR"
chmod -R 755 "$DEPLOY_DIR"

echo "========================================" | tee -a "$LOG_FILE"
echo "  ✅ 部署完成！$(date)" | tee -a "$LOG_FILE"
echo "  网站目录: $DEPLOY_DIR" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
