# Token 安全最佳实践

## Token 生命周期管理

### 生成阶段
1. **最小权限原则**：仅勾选任务必需的权限
   - 推送代码：`repo`（完整仓库访问）
   - 读取代码：`repo` 或 `public_repo`
   - 不需要勾选 `workflow`、`admin:repo_hook` 等无关权限

2. **设置过期时间**：
   - 短期任务：7 天
   - 常规使用：30 天
   - 长期项目：90 天
   - 避免选择 "No expiration"

3. **命名规范**：
   - 格式：`项目名-用途-日期`，如 `xytech-deploy-20260526`
   - 便于日后识别和清理

---

## 使用阶段

### 秒哒环境中的安全操作

1. **绝不写入文件**：
   ```bash
   # ❌ 错误：将Token写入文件
   echo "TOKEN=ghp_xxx" > .env
   
   # ✅ 正确：仅作为环境变量使用
   export GITHUB_TOKEN="ghp_xxx"
   ```

2. **嵌入URL而非交互输入**：
   ```bash
   # ❌ 错误：交互式输入（秒哒环境不支持）
   git push origin main
   # Username: ...
   # Password: ...
   
   # ✅ 正确：Token嵌入URL中
   git remote set-url origin "https://USER:TOKEN@github.com/USER/REPO.git"
   git push origin main
   git remote set-url origin "https://github.com/USER/REPO.git"
   ```

3. **立即恢复URL**：
   无论推送成功还是失败，必须执行：
   ```bash
   git remote set-url origin "https://github.com/USER/REPO.git"
   ```

4. **清除环境变量**：
   ```bash
   unset GITHUB_TOKEN
   ```

5. **清除终端历史**：
   ```bash
   history -c
   ```

---

## 泄露检测与应急

### 如果怀疑 Token 已泄露

**立即执行**：
1. 登录 GitHub → Settings → Developer settings → Personal access tokens
2. 找到对应 Token → 点击 **Delete**
3. 重新生成新 Token
4. 检查仓库安全日志（Settings → Security log）是否有异常操作

### 如果 Token 已写入 git 历史

**紧急处理**：
1. 撤销该 Token（立即失效）
2. 从 git 历史中移除敏感信息：
   ```bash
   # 使用 git-filter-repo 或 BFG Repo-Cleaner
   git filter-repo --replace-text <(echo 'ghp_xxx==>REDACTED')
   ```
3. 强制推送清理后的历史（谨慎操作）：
   ```bash
   git push origin main --force
   ```
4. 通知团队成员更新本地仓库

---

## 日志安全

### 避免在日志中输出 Token

```bash
# ❌ 错误：日志包含完整URL（含Token）
echo "Remote URL: $(git remote get-url origin)" >> push.log

# ✅ 正确：日志中隐藏Token
echo "Remote URL: https://github.com/USER/REPO.git" >> push.log
```

### 推送脚本的日志处理

脚本输出应使用 `set +x` 模式运行，避免打印命令本身：
```bash
#!/bin/bash
set +x  # 关闭命令回显
# ... 推送逻辑 ...
```

---

## 组织仓库额外注意

如果目标仓库属于 GitHub 组织：

1. **SSO 授权**：Token 需要授权该组织访问
   - 路径：Settings → Developer settings → Personal access tokens → Configure SSO
   - 点击对应组织的 "Authorize"

2. **IP 白名单**：部分组织启用了 IP 限制，秒哒环境 IP 可能不在白名单中
   - 联系组织管理员添加秒哒出口 IP
   - 或使用本地推送方案

3. **分支保护规则**：组织仓库可能有强制 PR 合并规则，禁止直接 push 到 main
   - 需要先创建分支 → 提交 PR → 合并
   - 或联系仓库管理员调整保护规则
