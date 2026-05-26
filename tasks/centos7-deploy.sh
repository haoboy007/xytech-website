#!/bin/bash
# ============================================
# CentOS 7 雄元科技官网部署脚本
# 在服务器 root 用户下执行
# ============================================

set -e

REPO_URL="https://github.com/haoboy007/xytech-website.git"
SOURCE_DIR="/www/wwwroot/xytech-source"
DEPLOY_DIR="/www/wwwroot/xytech"
NODE_VERSION="20.12.2"

echo "========================================"
echo "  雄元科技官网 - CentOS 7 部署脚本"
echo "========================================"
echo ""

# 1. 安装基础依赖
echo "[1/8] 安装基础依赖..."
yum install -y git curl wget gcc-c++ make 2>/dev/null || true

# 2. 安装 Node.js 20
echo "[2/8] 安装 Node.js ${NODE_VERSION}..."
if ! command -v node &> /dev/null || [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" != "20" ]; then
    # 使用 NodeSource 安装 Node.js 20
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
    yum install -y nodejs
else
    echo "  Node.js 已安装: $(node -v)"
fi

echo "  Node.js: $(node -v)"
echo "  npm: $(npm -v)"

# 3. 安装 pnpm
echo "[3/8] 安装 pnpm..."
if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm
    echo "  pnpm 已安装"
else
    echo "  pnpm 已安装: $(pnpm -v)"
fi

# 4. 克隆/更新代码
echo "[4/8] 拉取代码..."
if [ ! -d "$SOURCE_DIR/.git" ]; then
    echo "  首次克隆..."
    mkdir -p "$SOURCE_DIR"
    git clone "$REPO_URL" "$SOURCE_DIR"
else
    echo "  更新代码..."
    cd "$SOURCE_DIR"
    git fetch origin main
    git reset --hard origin/main
fi

cd "$SOURCE_DIR"

# 5. 安装依赖
echo "[5/8] 安装项目依赖..."
pnpm install

# 6. 构建
echo "[6/8] 构建生产包..."
pnpm run build

# 7. 移除秒哒CDN链接
echo "[7/8] 清理构建产物..."
sed -i '/<link rel="stylesheet" id="fonts-code"/d' dist/index.html

# 8. 部署
echo "[8/8] 部署到网站目录..."
mkdir -p "$DEPLOY_DIR"
rm -rf "$DEPLOY_DIR"/*
cp -r "$SOURCE_DIR"/dist/* "$DEPLOY_DIR"/

# 修正权限
chown -R www:www "$DEPLOY_DIR" 2>/dev/null || chown -R nginx:nginx "$DEPLOY_DIR" 2>/dev/null || true
chmod -R 755 "$DEPLOY_DIR"

echo ""
echo "========================================"
echo "  ✅ 部署完成！"
echo "  网站目录: $DEPLOY_DIR"
echo "========================================"
echo ""
echo "请确保宝塔面板 Nginx 配置包含："
echo '  location / {'
echo '      try_files $uri $uri/ /index.html;'
echo '  }'
echo ""
echo "文件数量: $(find "$DEPLOY_DIR" -type f | wc -l)"
