#!/bin/bash
# 雄元科技官网一键构建部署脚本
# 用法：./deploy.sh

set -e

echo "=========================================="
echo "  雄元科技官网 — 一键构建部署脚本"
echo "=========================================="
echo ""

PROJECT_DIR="/workspace/app-bset9i1icp35"
DEPLOY_ZIP="xytech-deploy-final.zip"

cd "$PROJECT_DIR"

echo "[1/6] 安装依赖..."
npm ci

echo ""
echo "[2/6] 运行代码检查..."
npm run lint

echo ""
echo "[3/6] 构建生产包..."
npx vite build --emptyOutDir

echo ""
echo "[4/6] 移除秒哒平台CDN引用..."
sed -i '/<link rel="stylesheet" id="fonts-code"/d' dist/index.html

echo ""
echo "[5/6] 验证构建产物..."
FILE_COUNT=$(find dist -type f | wc -l)
echo "  文件数量: $FILE_COUNT"
JS_FILE=$(ls dist/assets/*.js 2>/dev/null | head -1)
CSS_FILE=$(ls dist/assets/*.css 2>/dev/null | head -1)
echo "  JS 文件: $JS_FILE"
echo "  CSS 文件: $CSS_FILE"

echo ""
echo "[6/6] 打包部署文件..."
rm -f "$DEPLOY_ZIP"
zip -r "$DEPLOY_ZIP" dist/
rm -f "tasks/$DEPLOY_ZIP"
cp "$DEPLOY_ZIP" tasks/

echo ""
echo "=========================================="
echo "  ✅ 构建完成！"
echo "=========================================="
echo ""
echo "部署包路径:"
echo "  $PROJECT_DIR/$DEPLOY_ZIP"
echo "  $PROJECT_DIR/tasks/$DEPLOY_ZIP"
echo ""
echo "文件大小:"
ls -lh "$DEPLOY_ZIP" | awk '{print "  " $5}'
echo ""
echo "下一步操作:"
echo "  1. 下载部署包（通过平台文件导出功能）"
echo "  2. 上传到阿里云服务器 /www/wwwroot/xytech"
echo "  3. 解压并配置 Nginx: try_files \$uri \$uri/ /index.html;"
echo ""
echo "或使用 GitHub Actions 自动部署:"
echo "  git add ."
echo "  git commit -m \"更新内容\""
echo "  git push origin main"
echo ""
