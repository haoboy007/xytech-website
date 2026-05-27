#!/bin/bash
set -e

# ============================================
# XYTech 自动部署系统安装脚本
# 在阿里云服务器上执行此脚本，一键配置自动部署
# ============================================

echo "======================================"
echo "🚀 XYTech 自动部署系统安装"
echo "======================================"

# 1. 复制部署脚本到服务器
echo "[1/5] 复制自动部署脚本..."
cp tasks/auto-deploy.sh /www/wwwroot/xytech-auto-deploy.sh
chmod +x /www/wwwroot/xytech-auto-deploy.sh

# 2. 确保项目目录存在
echo "[2/5] 检查项目目录..."
mkdir -p /www/wwwroot/xytech-website
mkdir -p /www/wwwroot/xytech-backups
mkdir -p /var/log

# 3. 复制 systemd 配置
echo "[3/5] 安装 systemd 定时器..."
cp tasks/xytech-auto-deploy.service /etc/systemd/system/
cp tasks/xytech-auto-deploy.timer /etc/systemd/system/

# 4. 重载并启用定时器
echo "[4/5] 启动定时器..."
systemctl daemon-reload
systemctl enable xytech-auto-deploy.timer
systemctl start xytech-auto-deploy.timer

# 5. 验证安装
echo "[5/5] 验证安装..."
echo ""
echo "定时器状态:"
systemctl status xytech-auto-deploy.timer --no-pager || true
echo ""
echo "下次执行时间:"
systemctl list-timers xytech-auto-deploy.timer --no-pager || true
echo ""
echo "======================================"
echo "✅ 安装完成！"
echo "======================================"
echo ""
echo "📋 使用说明:"
echo "   • 查看定时器状态: systemctl status xytech-auto-deploy.timer"
echo "   • 手动触发部署: systemctl start xytech-auto-deploy.service"
echo "   • 查看部署日志: tail -f /var/log/xytech-auto-deploy.log"
echo "   • 查看定时器列表: systemctl list-timers"
echo ""
echo "⏰ 定时任务:"
echo "   • 每天凌晨 2:00 自动检查并部署"
echo "   • 服务器重启后 5 分钟也会执行一次"
echo ""
echo "📝 日志位置:"
echo "   • 部署日志: /var/log/xytech-auto-deploy.log"
echo "   • 备份目录: /www/wwwroot/xytech-backups"
echo ""
echo "🔧 自定义配置:"
echo "   编辑 /www/wwwroot/xytech-auto-deploy.sh 修改配置项"
echo ""
