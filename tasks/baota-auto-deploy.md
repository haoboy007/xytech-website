# 宝塔面板自动部署 + 进程守护完整配置

## 概述

实现目标：
1. **每隔5分钟**自动拉取 GitHub 最新代码
2. **一键构建部署**到网站目录
3. **进程守护**确保网站始终运行不掉线

---

## 第一步：服务器准备工作

### 1.1 安装 Node.js（宝塔面板操作）

1. 登录宝塔面板 → **软件商店**
2. 搜索 **"Node.js版本管理器"** → 点击安装
3. 安装完成后，进入 **Node.js版本管理器**
4. 安装 **Node.js 20.x** 版本（点击安装按钮）
5. 设置 Node.js 20.x 为默认版本

### 1.2 安装 PM2（进程守护工具）

在宝塔终端执行：

```bash
npm install -g pm2
```

### 1.3 创建源码目录

在宝塔终端执行：

```bash
mkdir -p /www/wwwroot/xytech-source
cd /www/wwwroot/xytech-source

# 克隆你的仓库（首次）
git clone https://github.com/haoboy007/xytech-website.git .

# 安装依赖
npm install

# 构建测试
npm run build
```

---

## 第二步：创建自动部署脚本

在宝塔终端创建脚本文件：

```bash
cat > /www/wwwroot/auto-deploy.sh << 'SCRIPT_EOF'
#!/bin/bash
# ============================================
# 雄元科技官网自动部署脚本
# 由宝塔计划任务每5分钟执行
# ============================================

set -e

SOURCE_DIR="/www/wwwroot/xytech-source"
DEPLOY_DIR="/www/wwwroot/xytech"
LOG_FILE="/www/wwwroot/deploy.log"
LOCK_FILE="/tmp/xytech-deploy.lock"
REPO_URL="https://github.com/haoboy007/xytech-website.git"

echo "========================================" | tee -a "$LOG_FILE"
echo "  自动部署开始 $(date '+%Y-%m-%d %H:%M:%S')" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"

# 防止并发执行
if [ -f "$LOCK_FILE" ]; then
    PID=$(cat "$LOCK_FILE" 2>/dev/null)
    if ps -p "$PID" > /dev/null 2>&1; then
        echo "[WARN] 已有部署进程在运行(PID:$PID)，跳过本次" | tee -a "$LOG_FILE"
        exit 0
    else
        rm -f "$LOCK_FILE"
    fi
fi

echo $$ > "$LOCK_FILE"

# 确保源码目录存在
if [ ! -d "$SOURCE_DIR/.git" ]; then
    echo "[INFO] 首次克隆仓库..." | tee -a "$LOG_FILE"
    mkdir -p "$SOURCE_DIR"
    git clone "$REPO_URL" "$SOURCE_DIR"
    cd "$SOURCE_DIR"
    npm install
else
    cd "$SOURCE_DIR"
    
    # 获取远程最新版本
    echo "[1/6] 获取远程版本..." | tee -a "$LOG_FILE"
    git fetch origin main
    
    # 检查是否有更新
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse origin/main)
    
    if [ "$LOCAL" = "$REMOTE" ]; then
        echo "[INFO] 代码已是最新，无需部署" | tee -a "$LOG_FILE"
        rm -f "$LOCK_FILE"
        exit 0
    fi
    
    echo "[INFO] 发现更新: ${LOCAL:0:7} -> ${REMOTE:0:7}" | tee -a "$LOG_FILE"
fi

cd "$SOURCE_DIR"

echo "[2/6] 拉取最新代码..." | tee -a "$LOG_FILE"
git reset --hard origin/main

echo "[3/6] 安装依赖..." | tee -a "$LOG_FILE"
npm install

echo "[4/6] 构建生产包..." | tee -a "$LOG_FILE"
npm run build

echo "[5/6] 检查构建产物..." | tee -a "$LOG_FILE"
if [ ! -d "$SOURCE_DIR/dist" ]; then
    echo "[ERROR] 构建失败，dist目录不存在" | tee -a "$LOG_FILE"
    rm -f "$LOCK_FILE"
    exit 1
fi

FILE_COUNT=$(find "$SOURCE_DIR/dist" -type f | wc -l)
echo "  构建成功，文件数量: $FILE_COUNT" | tee -a "$LOG_FILE"

echo "[6/6] 部署到网站目录..." | tee -a "$LOG_FILE"
rm -rf "$DEPLOY_DIR"/*
cp -r "$SOURCE_DIR"/dist/* "$DEPLOY_DIR"/

# 修正权限
chown -R www:www "$DEPLOY_DIR"
chmod -R 755 "$DEPLOY_DIR"

echo "========================================" | tee -a "$LOG_FILE"
echo "  ✅ 部署完成！$(date '+%Y-%m-%d %H:%M:%S')" | tee -a "$LOG_FILE"
echo "  部署目录: $DEPLOY_DIR" | tee -a "$LOG_FILE"
echo "  最新提交: $(git rev-parse --short HEAD)" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"

rm -f "$LOCK_FILE"
SCRIPT_EOF

chmod +x /www/wwwroot/auto-deploy.sh
```

---

## 第三步：宝塔计划任务配置

### 3.1 添加定时拉取任务

1. 宝塔面板 → **计划任务**
2. 点击 **添加任务**
3. 按以下配置填写：

| 配置项 | 值 |
|--------|-----|
| **任务类型** | Shell脚本 |
| **任务名称** | 雄元官网-自动部署 |
| **执行周期** | 每5分钟 |
| **脚本内容** | `/www/wwwroot/auto-deploy.sh` |

4. 点击 **确定**

### 3.2 测试执行

1. 在计划任务列表中找到刚创建的任务
2. 点击 **执行** 按钮（手动运行一次测试）
3. 查看 **日志** 输出，确认无错误

---

## 第四步：PM2 进程守护（确保不掉线）

### 4.1 创建 PM2 配置文件

```bash
cat > /www/wwwroot/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'xytech-website',
      cwd: '/www/wwwroot/xytech',
      script: 'npx',
      args: 'serve -s . -l 3456',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3456
      },
      // 日志配置
      log_file: '/www/wwwroot/logs/xytech-website.log',
      out_file: '/www/wwwroot/logs/xytech-out.log',
      error_file: '/www/wwwroot/logs/xytech-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      // 崩溃后自动重启
      min_uptime: '10s',
      max_restarts: 10,
      // 健康检查
      listen_timeout: 10000,
      kill_timeout: 5000
    }
  ]
};
EOF

mkdir -p /www/wwwroot/logs
```

### 4.2 安装 serve 并启动 PM2

```bash
# 安装 serve（静态文件服务器）
cd /www/wwwroot/xytech
npm install -g serve

# 安装 pm2-logrotate（日志轮转）
pm install -g pm2-logrotate

# 启动进程守护
pm2 start /www/wwwroot/ecosystem.config.js

# 保存 PM2 配置（开机自启）
pm2 save
pm2 startup
```

### 4.3 宝塔 PM2 管理器（可选图形界面）

1. 宝塔面板 → **软件商店**
2. 搜索 **"PM2管理器"** → 安装
3. 安装后可在宝塔面板图形化管理进程

---

## 第五步：Nginx 反向代理配置

### 5.1 修改网站配置

宝塔面板 → **网站** → 找到 `www.cnxy.tech` → **设置** → **配置文件**

在原有配置中添加反向代理：

```nginx
server {
    listen 80;
    server_name www.cnxy.tech cnxy.tech;
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1000;
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        root /www/wwwroot/xytech;
    }
    
    # 前端路由支持（关键！）
    location / {
        root /www/wwwroot/xytech;
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }
    
    # 安全响应头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

### 5.2 保存并重载

点击 **保存** → 点击 **重载配置**

---

## 第六步：一键手动部署（备用）

如果自动任务异常，可手动执行：

```bash
# 在宝塔终端执行
/www/wwwroot/auto-deploy.sh
```

或在宝塔面板 → **计划任务** → 找到任务 → 点击 **执行**

---

## 第七步：监控与日志

### 7.1 查看部署日志

```bash
# 部署日志
cat /www/wwwroot/deploy.log

# 实时查看
tail -f /www/wwwroot/deploy.log
```

### 7.2 查看 PM2 进程状态

```bash
pm2 status
pm2 logs xytech-website
```

### 7.3 查看 Nginx 错误日志

宝塔面板 → **日志** → **Nginx** → 查看错误日志

---

## 完整工作流

```
┌─────────────┐    git push    ┌─────────────────┐
│  秒哒开发    │ ────────────→ │   GitHub 仓库    │
└─────────────┘               └─────────────────┘
                                         │
                    宝塔计划任务每5分钟拉取  │
                                         ▼
                              ┌─────────────────┐
                              │  宝塔自动部署     │
                              │  git pull        │
                              │  npm install     │
                              │  npm run build   │
                              │  cp dist → xytech│
                              └─────────────────┘
                                         │
                                         ▼
                              ┌─────────────────┐
                              │ PM2 进程守护     │
                              │ serve 静态服务   │
                              │ 崩溃自动重启     │
                              └─────────────────┘
                                         │
                                         ▼
                              ┌─────────────────┐
                              │ Nginx 反向代理   │
                              │ www.cnxy.tech   │
                              └─────────────────┘
```

---

## 常见问题

### Q1: 部署后网站白屏？

检查 Nginx 配置是否包含 `try_files $uri $uri/ /index.html;`

### Q2: 静态资源 404？

检查构建产物是否正确复制到 `/www/wwwroot/xytech`

### Q3: PM2 进程不停重启？

```bash
pm2 logs xytech-website --lines 50
# 查看具体错误原因
```

### Q4: 如何手动停止自动部署？

宝塔面板 → **计划任务** → 找到任务 → 点击 **暂停**

### Q5: 如何立即部署最新代码？

```bash
cd /www/wwwroot/xytech-source
git pull origin main
npm install
npm run build
rm -rf /www/wwwroot/xytech/*
cp -r /www/wwwroot/xytech-source/dist/* /www/wwwroot/xytech/
```

---

## 联系方式

- 邮箱：hezuo@cnxy.tech
- 电话：18301592576
