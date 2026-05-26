# GitHub 推送常见问题及解决方案

## 网络类问题

### 问题：git push 连接超时
**现象**：
```
fatal: unable to access 'https://github.com/...': Connection timed out
```

**原因**：秒哒云端环境到 GitHub 的网络链路不稳定。

**解决方案**：
1. 使用打包下载方案（生成 zip → 本地解压 → 本地 git push）
2. 或尝试增加 Git 的超时设置：
   ```bash
   git config --global http.lowSpeedLimit 1000
   git config --global http.lowSpeedTime 60
   ```
3. 或改用 SSH 方式（如果本地有 SSH key）

---

### 问题：curl 测试通过但 git push 仍超时
**现象**：`curl -I https://github.com` 返回 200，但 `git push` 超时。

**原因**：curl 和 git 使用的网络协议/端口不同，git 可能走 443 但握手更复杂。

**解决方案**：
- 增加 Git 连接超时：`GIT_HTTP_LOW_SPEED_LIMIT=1000 GIT_HTTP_LOW_SPEED_TIME=120 git push origin main`
- 或直接使用打包下载方案

---

## 认证类问题

### 问题：403 Forbidden
**现象**：
```
remote: Permission to user/repo.git denied
fatal: unable to access 'https://github.com/.../': The requested URL returned error: 403
```

**原因**：
1. Token 没有 `repo` 权限
2. Token 已过期
3. 组织仓库需要 SSO 授权
4. 2FA 开启但未授权

**解决方案**：
1. 重新生成 Token，确保勾选 `repo`
2. 如果是组织仓库，在 Token 页面点击 "Configure SSO" 授权该组织
3. 检查 Token 是否过期（Settings → Developer settings → Personal access tokens）

---

### 问题：401 Unauthorized
**现象**：
```
fatal: Authentication failed for 'https://github.com/...'
```

**原因**：Token 输入错误或 Token 已被撤销。

**解决方案**：
1. 确认 Token 完整复制（不要遗漏开头或结尾字符）
2. 在 GitHub 上检查 Token 状态（绿色 = 活跃，红色 = 已撤销）
3. 重新生成新 Token

---

## Git 操作类问题

### 问题：仓库无变更
**现象**：
```
On branch main
Your branch is up to date with 'origin/main'.
nothing to commit, working tree clean
```

**原因**：工作区无修改，或修改未保存到工作区。

**解决方案**：
1. 确认代码已保存（编辑器 Ctrl+S）
2. 检查 `git status`，确认变更存在
3. 如果确实无变更但想推送（如仅更新标签），询问用户是否确认

---

### 问题：推送被拒绝（非快进）
**现象**：
```
! [rejected]        main -> main (non-fast-forward)
```

**原因**：远程仓库有本地没有的提交，直接推送会覆盖他人工作。

**解决方案**：
1. 执行 `git pull origin main` 合并远程变更
2. 如果有冲突，手动解决后重新 `git add` + `git commit`
3. 再次 `git push origin main`

---

### 问题：无 origin 远程仓库
**现象**：
```
fatal: No configured push destination.
```

**解决方案**：
1. 询问用户 GitHub 仓库地址
2. 执行：`git remote add origin https://github.com/USER/REPO.git`
3. 重新推送

---

### 问题：分支名称不匹配
**现象**：
```
error: src refspec main does not match any
```

**原因**：本地分支名可能为 `master` 而非 `main`。

**解决方案**：
1. 检查本地分支名：`git branch`
2. 推送正确分支：`git push origin master` 或 `git push origin main`

---

## 环境类问题

### 问题：Git 未安装
**现象**：
```
bash: git: command not found
```

**解决方案**：
- 秒哒环境通常预装 Git，如未安装，提示用户联系秒哒客服
- 或使用 zip 打包方案绕过 Git

---

### 问题：工作目录不是 Git 仓库
**现象**：`.git` 目录不存在。

**解决方案**：
1. 询问用户是否需要 `git init` 初始化仓库
2. 或询问正确的项目路径
3. 如果用户只想上传文件，使用 zip 打包方案

---

## 打包下载类问题

### 问题：zip 包太大
**现象**：生成的 zip 超过几十MB。

**原因**：包含了 `node_modules`、`.git`、构建产物等。

**解决方案**：
- 确保 zip 命令排除了以下目录：
  ```
  -x "node_modules/*" -x "dist/*" -x ".git/*"
  -x ".sync/*" -x ".skills/*" -x "tasks/*"
  -x "*.log" -x ".env" -x ".env.local"
  ```

### 问题：zip 包含敏感文件
**现象**：`.env` 文件被包含在 zip 中。

**解决方案**：
- 检查 `.gitignore` 是否包含 `.env`
- 在 zip 命令中显式排除：`-x ".env" -x ".env.local"`
- 提醒用户在本地解压后自行创建 `.env` 文件
