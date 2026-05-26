---
name: community-platform-dev
description: |
  圈层社交平台全栈开发技能。适用于开发同乡会/校友会/行业协会/兴趣社群等圈层社交平台，涵盖信息发布、社区互动、私信聊天、活动管理、商业合作、积分激励、用户认证、AI智能助手、管理后台等完整模块。当用户需要构建社交网络、同乡平台、校友平台、协会平台、社群应用、会员系统、活动报名系统、积分商城、内容社区、即时通讯、企业展示平台、商机对接平台或类似功能时，必须使用此技能。即使需求只涉及其中部分模块（如仅活动系统、仅积分系统、仅私聊功能），也应使用此技能获取经过实战验证的完整架构方案。
---

# 圈层平台AI开发技能

> 基于齐鲁汇H5（36页、35+表、35次迭代）实战经验的圈层社交平台开发范式。
>
> 技术栈：React + TypeScript + Vite + Tailwind CSS + shadcn/ui + Supabase (PostgreSQL + Edge Functions + Realtime + Storage)

## 能力范围

此技能提供圈层社交平台从零到一的全栈开发指导，覆盖以下九大核心模块：

| 模块 | 说明 | 典型页面 |
|------|------|---------|
| 用户与认证 | 注册登录、个人/企业实名认证、有效期管理、关注关系 | ProfilePage、VerificationPage、FollowsPage |
| 信息发布 | 帖子/动态、评论、点赞、资讯、公告、搜索 | HomePage、CirclePage、PostDetailPage、CreatePostPage |
| 社区互动 | 话题分类、热门推荐、置顶精选、内容审核 | HomePage、AdminPage(content) |
| 私信聊天 | 1对1实时消息、会话列表、未读计数 | ChatListPage、ChatPage |
| 活动管理 | 活动发布、报名、签到(QR码)、收藏、评论 | EventsPage、EventDetailPage |
| 商业合作 | 企业名录、商机对接、融资路演、并购投资、招商引才 | BusinessPage、FundingDetailPage、MnaDetailPage |
| 积分系统 | 签到、任务、商城、排行榜、流水、订单管理 | PointsCenterPage、PointsMallPage、PointsSigninPage |
| AI助手 | 大模型对话、智能推荐、内容摘要、客服自动回复 | AIAssistantPage |
| 管理后台 | 数据统计、内容审核、认证管理、积分运营、系统配置 | AdminPage |

## 快速开始

### 1. 确定需求范围

根据用户描述，确定需要哪些模块。建议从最小可用产品(MVP)起步：

- **MVP**：用户系统 + 信息发布 + 管理后台
- **标准版**：MVP + 私信 + 活动 + 积分签到
- **完整版**：全部9大模块 + AI助手 + 支付

### 2. 数据库设计

参考 `references/data-schema.md` 获取完整的数据库表设计范式：

- 用户与身份体系（profiles、user_verifications、follows）
- 信息发布体系（posts、post_comments、post_likes、news）
- 私信系统（messages + get_conversations RPC）
- 活动系统（events、event_registrations、event_comments）
- 积分系统（user_points、point_transactions、point_products、point_orders）
- 通知系统（notifications）
- RLS 权限策略模板
- 索引设计建议

### 3. 前端架构

参考 `references/frontend-patterns.md` 获取前端开发模式：

- 项目结构范式（pages/components/services/types/contexts）
- 标准页面模板（加载态/空状态/错误处理/刷新）
- Admin 管理后台模式（底部Tab导航 + 渲染函数）
- 通用组件（SectionHeader、SearchInput、状态Badge）
- 列表+筛选+搜索组合模式
- Dialog/Modal 详情弹窗模式
- 图片上传模式
- 路由配置与权限守卫

### 4. 各模块详细参考

| 参考文件 | 内容 |
|---------|------|
| `references/admin-panel.md` | 管理后台统计卡片、内容审核、认证中心、积分管理、订单管理、权限控制 |
| `references/points-system.md` | 签到算法（连续天数+7天奖励）、任务触发器、商城兑换、排行榜、订单状态流、防刷机制 |
| `references/activity-system.md` | 活动状态自动流转、报名/取消、QR码签到、签到验证Edge Function、收藏、后台管理 |
| `references/business-module.md` | 企业认领流程、五类商业实体（企业/商机/融资/并购/招商）、详情页通用模板、后台审核 |
| `references/ai-assistant.md` | 文心一言SSE流式对话、快捷问题、多场景AI集成（摘要/推荐/客服）、性能优化 |

## 关键设计决策

### 为什么选择单页Admin？

管理后台采用单页面 + 底部Tab导航，而非传统侧边栏菜单：
- **移动端优先**：管理员可能用手机管理
- **React Native 迁移友好**：未来可平滑转为小程序/APP
- **代码简洁**：避免复杂路由嵌套

### 为什么消息用表结构而非对话表？

messages 表直接存储(sender_id, receiver_id, content, is_read)，通过 RPC 函数聚合为会话列表：
- **查询简单**：无需维护独立的 conversations 表
- **兼容性好**：支持群聊扩展（添加 group_id 即可）
- **性能可接受**：消息量 < 百万级时，索引优化后的聚合查询性能足够

### 为什么积分用RPC函数而非前端计算？

所有积分变动通过 PostgreSQL 函数原子执行：
- **防并发**：避免多请求导致积分重复
- **可追溯**：所有变动强制记录 point_transactions
- **可回滚**：退款时自动返还积分

### 认证有效期管理

```ts
// 通过审核时自动设置有效期
enterprise: 1年  |  personal: 3年
```

认证中心支持30天到期预警、过期/即将到期状态标签、续期待开发。

## 常用API模式

### Supabase 查询模式

```ts
// 带关联查询
const { data } = await supabase
  .from('posts')
  .select('*, profiles(nickname, avatar_url)')
  .eq('audit_status', 'approved')
  .order('created_at', { ascending: false });

// 计数查询
const { count } = await supabase
  .from('posts')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', userId);

// 分页
const { data } = await supabase
  .from('posts')
  .select('*')
  .range(page * 20, (page + 1) * 20 - 1);
```

### Edge Function 模式

```ts
// supabase/functions/<name>/index.ts
import { serve } from '...';
serve(async (req) => {
  const supabase = createClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  // 业务逻辑
  return new Response(JSON.stringify({ success: true }));
});
```

## 开发Checklist

新建圈层平台项目时，按此顺序执行：

- [ ] 初始化数据库（profiles + auth hook）
- [ ] 配置 RLS 策略（admin + owner 双模式）
- [ ] 实现 AuthContext（登录状态 + isAdmin 判断）
- [ ] 搭建基础页面框架（Home + Profile + Admin）
- [ ] 实现核心模块（按需求优先级）
- [ ] 添加积分/通知等增长模块
- [ ] 配置管理后台审核功能
- [ ] 接入AI助手（可选）
- [ ] 部署 Edge Functions
- [ ] 配置迁移脚本（supabase/migrations/）

## 扩展方向

- **小程序迁移**：Taro 方案复用现有 React 代码
- **支付接入**：使用 `payment-wechat` 技能实现微信支付
- **内容安全**：接入百度内容审核API自动检测敏感内容
- **SEO优化**：为资讯/企业页面添加 SSR 或预渲染
- **数据分析**：接入百度统计或自建数据埋点
