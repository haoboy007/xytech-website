#!/bin/bash
# 雄元科技官网 — 阿里云服务器初始化脚本
# 在宝塔面板终端中执行

set -e

echo "========================================"
echo "  雄元科技官网 — 服务器初始化脚本"
echo "========================================"

# 1. 创建网站目录
echo ""
echo "[1/4] 创建网站目录..."
mkdir -p /www/wwwroot/xytech-website
chmod 755 /www/wwwroot/xytech-website
echo "✅ 目录已创建: /www/wwwroot/xytech-website"

# 2. 生成 SSH 密钥对（用于 GitHub Actions 部署）
echo ""
echo "[2/4] 生成 SSH 密钥对..."
if [ -f /root/.ssh/github_actions ]; then
    echo "⚠️ 密钥对已存在，跳过生成"
else
    ssh-keygen -t ed25519 -C "github-actions-deploy" -f /root/.ssh/github_actions -N ""
    cat /root/.ssh/github_actions.pub >> /root/.ssh/authorized_keys
    chmod 600 /root/.ssh/authorized_keys
    echo "✅ 密钥对已生成"
fi

# 3. 显示密钥信息
echo ""
echo "[3/4] SSH 密钥信息"
echo "----------------------------------------"
echo ""
echo "【公钥】（已添加到 authorized_keys）:"
cat /root/.ssh/github_actions.pub
echo ""
echo "----------------------------------------"
echo ""
echo "【私钥】请复制以下内容，添加到 GitHub Secrets（ALIYUN_SSH_KEY）:"
echo ""
cat /root/.ssh/github_actions
echo ""
echo "----------------------------------------"

# 4. 检查宝塔面板
echo ""
echo "[4/4] 环境检查"
if command -v bt &> /dev/null; then
    echo "✅ 宝塔面板已安装"
    bt default | head -10
else
    echo "⚠️ 未检测到宝塔面板命令"
fi

echo ""
echo "========================================"
echo "  初始化完成！"
echo "========================================"
echo ""
echo "下一步操作："
echo "1. 复制上面的【私钥】内容"
echo "2. 访问 https://github.com/haoboy007/xytech-website/settings/secrets/actions"
echo "3. 添加 Secrets：ALIYUN_SSH_KEY、ALIYUN_HOST、ALIYUN_USERNAME、ALIYUN_TARGET_DIR"
echo "4. 在宝塔面板中添加站点：www.cnxy.tech → /www/wwwroot/xytech-website"
echo "5. 配置伪静态规则（详见 aliyun-deploy-guide.md）"
echo ""