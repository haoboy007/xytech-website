#!/bin/bash
# ============================================
# 服务器自动拉取 + 部署脚本
# 由宝塔计划任务每5分钟执行
# 适用：CentOS 7 + 宝塔面板
# ============================================

set -e

SOURCE_DIR="/www/wwwroot/xytech-source"
DEPLOY_DIR="/www/wwwroot/xytech"
LOG_FILE="/www/wwwroot/deploy.log"
LOCK_FILE="/tmp/xytech-deploy.lock"
REPO_URL="https://github.com/haoboy007/xytech-website.git"

echo "========================================" >> "$LOG_FILE"
echo "  部署开始 $(date '+%Y-%m-%d %H:%M:%S')" >> "$LOG_FILE"

# 防止并发执行
if [ -f "$LOCK_FILE" ]; then
    PID=$(cat "$LOCK_FILE" 2>/dev/null || echo "")
    if [ -n "$PID" ] && ps -p "$PID" > /dev/null 2>&1; then
        echo "  [SKIP] 已有部署进程运行中" >> "$LOG_FILE"
        exit 0
    fi
    rm -f "$LOCK_FILE"
fi

echo $$ > "$LOCK_FILE"

# 确保源码目录存在
if [ ! -d "$SOURCE_DIR/.git" ]; then
    echo "  [INIT] 首次克隆仓库..." >> "$LOG_FILE"
    mkdir -p "$SOURCE_DIR"
    cd "$SOURCE_DIR"
    git clone "$REPO_URL" .
else
    cd "$SOURCE_DIR"
    
    # 获取远程最新版本
    echo "  [FETCH] 获取远程版本..." >> "$LOG_FILE"
    git fetch origin main
    
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse origin/main 2>/dev/null || echo "$LOCAL")
    
    if [ "$LOCAL" = "$REMOTE" ]; then
        echo "  [OK] 已是最新版本 ${LOCAL:0:7}" >> "$LOG_FILE"
        rm -f "$LOCK_FILE"
        exit 0
    fi
    
    echo "  [UPDATE] ${LOCAL:0:7} -> ${REMOTE:0:7}" >> "$LOG_FILE"
    git reset --hard origin/main
fi

cd "$SOURCE_DIR"

# 检查 dist 目录（秒哒构建后推送）
if [ ! -d "$SOURCE_DIR/dist" ]; then
    echo "  [ERROR] dist目录不存在！" >> "$LOG_FILE"
    echo "  可能原因：秒哒端未执行 npm run build 或未将 dist 提交到 Git" >> "$LOG_FILE"
    rm -f "$LOCK_FILE"
    exit 1
fi

FILE_COUNT=$(find "$SOURCE_DIR/dist" -type f | wc -l)
echo "  [BUILD] dist 文件数量: $FILE_COUNT" >> "$LOG_FILE"

# 部署到网站目录
echo "  [DEPLOY] 复制到网站目录..." >> "$LOG_FILE"
rm -rf "$DEPLOY_DIR"/*
cp -r "$SOURCE_DIR"/dist/* "$DEPLOY_DIR"/

# 修正权限
chown -R www:www "$DEPLOY_DIR" 2>/dev/null || chown -R nginx:nginx "$DEPLOY_DIR" 2>/dev/null || true
chmod -R 755 "$DEPLOY_DIR"

echo "  [DONE] 部署完成 $(git rev-parse --short HEAD)" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"

rm -f "$LOCK_FILE"
