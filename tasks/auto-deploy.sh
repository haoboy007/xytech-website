#!/bin/bash
set -euo pipefail

# ============================================
# XYTech 网站自动部署脚本
# 功能：从GitHub拉取最新代码 → 构建 → 部署到Nginx
# 适用：阿里云服务器（47.100.36.211）
# 建议：配合 crontab 定时执行，或 systemd 服务管理
# ============================================

# --- 配置 ---
PROJECT_DIR="/www/wwwroot/xytech-website"
DIST_DIR="$PROJECT_DIR/dist"
NGINX_ROOT="/www/wwwroot/xytech-website/dist"
LOG_FILE="/var/log/xytech-auto-deploy.log"
BACKUP_DIR="/www/wwwroot/xytech-backups"
KEEP_BACKUPS=5

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 时间戳
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# 日志函数
log() {
    echo "[$TIMESTAMP] $1" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

# --- 开始部署 ---
log_info "======================================"
log_info "开始自动部署 XYTech 网站"
log_info "======================================"

# 检查项目目录
cd "$PROJECT_DIR" || {
    log_error "项目目录不存在: $PROJECT_DIR"
    exit 1
}
log_info "当前目录: $(pwd)"

# 检查Git仓库
if [ ! -d ".git" ]; then
    log_error "当前目录不是Git仓库"
    exit 1
fi

# 1. 获取远程最新提交
log_info "步骤 1/6：获取远程最新提交..."
git fetch origin main

# 检查是否有更新
LOCAL_COMMIT=$(git rev-parse HEAD)
REMOTE_COMMIT=$(git rev-parse origin/main)

if [ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ]; then
    log_info "代码已是最新，无需部署"
    log_info "部署结束"
    exit 0
fi

log_info "发现新提交: ${LOCAL_COMMIT:0:8} → ${REMOTE_COMMIT:0:8}"

# 2. 备份当前版本
log_info "步骤 2/6：备份当前版本..."
mkdir -p "$BACKUP_DIR"
if [ -d "$DIST_DIR" ]; then
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S).tar.gz"
    tar -czf "$BACKUP_DIR/$BACKUP_NAME" -C "$PROJECT_DIR" dist/ 2>/dev/null || true
    log_info "备份完成: $BACKUP_NAME"
    
    # 清理旧备份，保留最近 $KEEP_BACKUPS 个
    cd "$BACKUP_DIR"
    ls -t backup-*.tar.gz 2>/dev/null | tail -n +$((KEEP_BACKUPS + 1)) | xargs -r rm -f
    log_info "保留最近 $KEEP_BACKUPS 个备份"
    cd "$PROJECT_DIR"
else
    log_warn "当前无 dist 目录，跳过备份"
fi

# 3. 拉取最新代码
log_info "步骤 3/6：拉取最新代码..."
git pull origin main
log_info "代码更新完成"

# 4. 安装依赖
log_info "步骤 4/6：安装依赖..."
pnpm install --frozen-lockfile
log_info "依赖安装完成"

# 5. 构建项目
log_info "步骤 5/6：构建项目..."
export BASE_URL=/
export SKIP_MIAODA_PLUGIN=true
pnpm exec vite build

if [ ! -f "$DIST_DIR/index.html" ]; then
    log_error "构建失败: dist/index.html 不存在"
    exit 1
fi

BUILD_SIZE=$(du -sh "$DIST_DIR" | cut -f1)
log_info "构建完成，产物大小: $BUILD_SIZE"

# 6. 部署到Nginx
log_info "步骤 6/6：部署到Nginx..."

# 确保目录权限正确
chmod -R 755 "$DIST_DIR"

# 重载Nginx（无需重启，零停机）
if systemctl is-active --quiet nginx; then
    nginx -t && systemctl reload nginx
    log_info "Nginx 重载完成"
else
    log_warn "Nginx 未运行，尝试启动..."
    systemctl start nginx
    log_info "Nginx 启动完成"
fi

# --- 部署完成 ---
NEW_COMMIT=$(git rev-parse --short HEAD)
log_info "======================================"
log_info "✅ 部署成功！"
log_info "最新提交: $NEW_COMMIT"
log_info "部署时间: $(date '+%Y-%m-%d %H:%M:%S')"
log_info "产物大小: $BUILD_SIZE"
log_info "备份目录: $BACKUP_DIR"
log_info "======================================"

# 可选：发送通知（如配置了钉钉/企业微信机器人）
# curl -s "https://oapi.dingtalk.com/robot/send?access_token=YOUR_TOKEN" \
#   -H "Content-Type: application/json" \
#   -d "{\"msgtype\":\"text\",\"text\":{\"content\":\"XYTech网站已自动部署成功！\\n提交: $NEW_COMMIT\\n时间: $(date '+%Y-%m-%d %H:%M:%S')\"}}" > /dev/null 2>&1 || true

exit 0
