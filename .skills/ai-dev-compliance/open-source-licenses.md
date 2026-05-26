# 开源许可证兼容性速查与深度解析

## 一、主流许可证快速对比

### 1.1 宽松型许可证（Permissive）

| 特性 | MIT | Apache-2.0 | BSD-2 | BSD-3 | ISC |
|------|-----|------------|-------|-------|-----|
| 商用 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 修改 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 分发 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 闭源 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 必须保留版权声明 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 必须包含许可证全文 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 专利授权 | 无 | ✅ | 无 | 无 | 无 |
| 商标授权 | 无 | 无 | 无 | 无 | 无 |
| 对衍生作品许可证限制 | 无 | 无 | 无 | 无 | 无 |

### 1.2 弱 copyleft（Weak Copyleft）

| 特性 | LGPL-2.1 | LGPL-3.0 | MPL-2.0 | EPL-1.0 | EPL-2.0 |
|------|----------|----------|---------|---------|---------|
| 商用 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 闭源链接 | ✅动态/静态 | ✅动态/静态 | ✅ | ✅ | ✅ |
| 修改后开源 | 仅修改部分 | 仅修改部分 | 仅修改部分 | 全部 | 全部 |
| 与其他代码混合 | 可 | 可 | 文件级隔离 | 需兼容 | 需兼容 |

### 1.3 强 copyleft（Strong Copyleft）

| 特性 | GPL-2.0 | GPL-3.0 | AGPL-3.0 | SSPL |
|------|---------|---------|----------|------|
| 商用 | ✅ | ✅ | ✅ | ⚠️ |
| 修改/分发 | ✅ | ✅ | ✅ | ⚠️ |
| 衍生作品许可证 | GPL-2.0 | GPL-3.0 | AGPL-3.0 | SSPL |
| 闭源分发 | ❌ | ❌ | ❌ | ❌ |
| 通过网络提供服务 | 不触发 | 不触发 | 触发 | 触发 |
| 专利授权 | 无 | ✅ | ✅ | 无 |
| 禁止Tivo化 | 无 | ✅ | ✅ | 无 |

---

## 二、许可证兼容性矩阵

### 2.1 向下兼容规则

你的代码（行）能否与库代码（列）组合：

| 你的代码 ↓ \ 库代码 → | MIT | Apache-2.0 | BSD | LGPL | GPL-2 | GPL-3 | AGPL | 闭源 |
|---------------------|-----|------------|-----|------|-------|-------|------|------|
| MIT | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Apache-2.0 | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| BSD | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| LGPL | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| GPL-2 | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| GPL-3 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| AGPL | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| 闭源 | ✅ | ✅ | ✅ | ⚠️ | ❌ | ❌ | ❌ | ✅ |

> ⚠️ 标记说明：LGPL列的⚠️表示闭源软件可通过动态链接使用LGPL库，但静态链接或修改后需开源。
> ❌ 标记说明：GPL-2.0与Apache-2.0不兼容（Apache的专利条款与GPL-2.0的"不得增加额外限制"冲突）。

---

## 三、常见技术栈许可证参考

### 3.1 前端框架/库

| 库/框架 | 许可证 | 闭源使用 | 注意 |
|---------|--------|---------|------|
| React | MIT | ✅ | |
| Vue | MIT | ✅ | |
| Angular | MIT | ✅ | |
| Svelte | MIT | ✅ | |
| Next.js | MIT | ✅ | |
| Tailwind CSS | MIT | ✅ | |
| Bootstrap | MIT | ✅ | |
| jQuery | MIT | ✅ | |
| Three.js | MIT | ✅ | |
| D3.js | ISC | ✅ | |
| Lodash | MIT | ✅ | |
| Axios | MIT | ✅ | |

### 3.2 后端框架/库

| 库/框架 | 许可证 | 闭源使用 | 注意 |
|---------|--------|---------|------|
| Node.js/Express | MIT | ✅ | |
| Django | BSD-3 | ✅ | |
| Flask | BSD-3 | ✅ | |
| FastAPI | MIT | ✅ | |
| Spring Boot | Apache-2.0 | ✅ | |
| Ruby on Rails | MIT | ✅ | |
| Laravel | MIT | ✅ | |
| Gin (Go) | MIT | ✅ | |
| .NET Core | MIT | ✅ | |

### 3.3 数据库与存储

| 产品 | 许可证 | 闭源使用 | 注意 |
|------|--------|---------|------|
| PostgreSQL | PostgreSQL License (类BSD) | ✅ | |
| MySQL | GPL-2.0 / 商业许可 | ⚠️ | 纯社区版GPL，商业需购买Oracle许可或改用MariaDB |
| MariaDB | GPL-2.0 / LGPL | ⚠️ | 类似MySQL |
| MongoDB | SSPL (原AGPL) | ⚠️ | 2018年改SSPL，云托管服务需开源 |
| Redis | SSPL (原BSD) | ⚠️ | 2024年3月后版本改SSPL |
| SQLite | 公共领域 | ✅ | 完全自由 |
| Elasticsearch | SSPL / Elastic License | ⚠️ | 非SSPL版本需订阅 |
| ClickHouse | Apache-2.0 | ✅ | |

### 3.4 AI/ML 相关

| 产品 | 许可证 | 闭源使用 | 注意 |
|------|--------|---------|------|
| TensorFlow | Apache-2.0 | ✅ | |
| PyTorch | BSD-3 | ✅ | |
| Hugging Face Transformers | Apache-2.0 | ✅ | |
| Scikit-learn | BSD-3 | ✅ | |
| LangChain | MIT | ✅ | |
| Llama 2/3 | 自定义许可 | ✅ | 月活>7亿需申请授权 |
| Mistral | Apache-2.0 | ✅ | |
| Stable Diffusion | CreativeML Open RAIL-M | ⚠️ | 有使用限制（不得用于特定场景） |
| ComfyUI | GPL-3.0 | ⚠️ | 衍生工具需GPL |

---

## 四、许可证合规实操

### 4.1 依赖清单模板

为项目维护以下文件：

```markdown
# 开源组件清单（OSS Notice）

本项目使用以下开源组件：

| 组件名称 | 版本 | 许可证 | 来源 |
|---------|------|--------|------|
| React | 18.2.0 | MIT | https://github.com/facebook/react |
| PostgreSQL | 15.0 | PostgreSQL License | https://www.postgresql.org/ |
| ... | ... | ... | ... |

详细许可证文本见 LICENSES/ 目录。
```

### 4.2 各许可证的 NOTICE 要求

| 许可证 | NOTICE文件要求 | 示例 |
|--------|---------------|------|
| Apache-2.0 | 必须保留NOTICE文件（如有） | `NOTICE: This product includes software developed by Apache Software Foundation.` |
| BSD-3 | 必须保留版权声明和免责声明 | 在关于页面或LICENSE文件中列出 |
| MIT | 必须保留版权声明 | 同上 |
| GPL | 必须提供源代码或书面 offer | 提供源代码下载链接或书面声明 |

### 4.3 自动扫描工具推荐

| 工具 | 语言 | 特点 |
|------|------|------|
| **license-checker** | Node.js | 最常用，输出JSON/CSV |
| **pip-licenses** | Python | 生成依赖许可证清单 |
| **cargo-license** | Rust | 扫描Rust crate许可证 |
| **go-licenses** | Go | Google出品 |
| **FOSSology** | 通用 | 开源，支持代码级扫描 |
| **Snyk** | 通用 | 商业工具，含漏洞+许可证扫描 |
| **GitHub Dependency Graph** | 通用 | 免费，自动识别许可证 |

---

## 五、特殊场景

### 5.1 修改开源代码后的合规

如果你修改了开源代码：
- **MIT/Apache/BSD**：在文件头部添加你的版权声明，保留原版权声明
- **LGPL**：修改后的文件必须以LGPL开源；未修改的文件不受影响
- **GPL/AGPL**：整个衍生作品必须以相同许可证开源

### 5.2 将开源代码嵌入闭源产品

| 方式 | LGPL库 | GPL库 | MIT/Apache库 |
|------|--------|-------|-------------|
| 动态链接/调用 | ✅ 安全 | ❌ 触发 | ✅ 安全 |
| 静态链接 | ⚠️ 需提供目标文件 | ❌ 触发 | ✅ 安全 |
| 复制源代码到项目 | ❌ 触发 | ❌ 触发 | ✅ 需保留声明 |
| 通过网络API调用 | ✅ 安全 | ⚠️ AGPL触发 | ✅ 安全 |

### 5.3 双许可项目

部分项目同时提供开源许可证和商业许可证：
- **MySQL**：GPL或商业许可
- **Qt**：LGPL/商业许可
- **MongoDB**：SSPL或MongoDB商业许可
- **Elastic**：SSPL或Elastic License

**策略**：如果闭源分发且不想开源，购买商业许可。
