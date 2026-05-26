# Taro 小程序版本开发参考

> 基于齐鲁汇H5迁移至微信小程序的实践路径，最大化复用现有React代码

## 技术选型

| 层级 | H5 方案 | Taro 小程序方案 |
|------|---------|----------------|
| 框架 | React 18 + Vite | Taro 3 + React |
| UI组件 | shadcn/ui + Tailwind | Taro UI / NutUI / 自研 |
| 样式 | Tailwind CSS | SCSS / CSS Modules / 自研原子类 |
| 路由 | React Router | Taro 路由（app.config.ts）|
| 状态 | React Context | React Context / Zustand（小程序兼容版）|
| 网络 | fetch / axios | Taro.request |
| 存储 | localStorage | Taro.setStorageSync |
| 图片 | 原生input file | Taro.chooseImage / wx.chooseImage |
| 地图 | 百度地图JS SDK | 腾讯地图SDK / 微信小程序原生map |
| 支付 | 微信支付H5 | 微信小程序支付 |
| 分享 | Web Share API | onShareAppMessage / onShareTimeline |
| 推送 | 浏览器Push | 微信小程序订阅消息 |
| 扫码 | Web QR Scanner | wx.scanCode |

## 项目结构迁移

### Taro 项目目录

```
qiluhui-taro/
├── config/                    # Taro 配置
│   ├── index.ts              # 编译配置
│   └── dev.ts / prod.ts
├── src/
│   ├── app.config.ts         # 全局页面路由 + tabBar
│   ├── app.tsx               # 入口组件
│   ├── app.scss              # 全局样式
│   ├── pages/                # 页面（与H5 pages对应）
│   │   ├── index/            # 首页（原HomePage）
│   │   │   ├── index.tsx
│   │   │   └── index.scss
│   │   ├── circle/           # 老乡圈（原CirclePage）
│   │   ├── profile/          # 个人中心（原ProfilePage）
│   │   ├── admin/            # 管理后台（原AdminPage）
│   │   └── ...
│   ├── components/           # 组件（与H5 components对应）
│   │   ├── ui/               # 基础UI组件（替换shadcn/ui）
│   │   │   ├── button/
│   │   │   ├── card/
│   │   │   ├── dialog/
│   │   │   ├── input/
│   │   │   └── badge/
│   │   └── common/
│   │       ├── SectionHeader/
│   │       ├── SearchInput/
│   │       ├── LoadingState/
│   │       └── EmptyState/
│   ├── services/
│   │   └── api.ts            # API 封装（适配Taro.request）
│   ├── stores/               # 状态管理（如使用Zustand）
│   │   └── authStore.ts
│   ├── utils/
│   │   └── index.ts
│   └── types/
│       └── index.ts
├── supabase/                 # 与H5共用数据库和Edge Functions
│   └── migrations/
└── package.json
```

### app.config.ts 路由配置

```typescript
// src/app.config.ts
export default defineAppConfig({
  pages: [
    'pages/index/index',           // 首页
    'pages/circle/index',          // 老乡圈
    'pages/profile/index',         // 个人中心
    'pages/admin/index',           // 管理后台
    'pages/verification/index',    // 用户认证
    'pages/chat-list/index',       // 私信列表
    'pages/chat/index',            // 私信详情
    'pages/events/index',          // 活动列表
    'pages/event-detail/index',    // 活动详情
    'pages/business/index',        // 商业合作
    'pages/points/index',          // 积分中心
    'pages/ai-assistant/index',    // AI助手
  ],
  tabBar: {
    color: '#999',
    selectedColor: '#1890ff',
    backgroundColor: '#fff',
    borderStyle: 'black',
    list: [
      { pagePath: 'pages/index/index', text: '首页', iconPath: 'assets/tab-home.png', selectedIconPath: 'assets/tab-home-active.png' },
      { pagePath: 'pages/circle/index', text: '圈子', iconPath: 'assets/tab-circle.png', selectedIconPath: 'assets/tab-circle-active.png' },
      { pagePath: 'pages/business/index', text: '合作', iconPath: 'assets/tab-biz.png', selectedIconPath: 'assets/tab-biz-active.png' },
      { pagePath: 'pages/profile/index', text: '我的', iconPath: 'assets/tab-me.png', selectedIconPath: 'assets/tab-me-active.png' },
    ]
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '齐鲁汇',
    navigationBarTextStyle: 'black',
  },
});
```

## 核心适配指南

### 1. 路由适配

```tsx
// H5: React Router
import { useNavigate, useParams } from 'react-router-dom';
const navigate = useNavigate();
navigate('/post/123');
const { id } = useParams();

// Taro: 原生路由
import Taro from '@tarojs/taro';
Taro.navigateTo({ url: `/pages/post-detail/index?id=123` });
const { id } = Taro.useRouter().params;
```

### 2. 网络请求适配

```tsx
// services/api.ts — 统一封装兼容H5和小程序
import Taro from '@tarojs/taro';

const isWeapp = process.env.TARO_ENV === 'weapp';

export async function fetchPosts() {
  if (isWeapp) {
    const { data } = await Taro.request({
      url: `${API_BASE}/rest/v1/posts`,
      method: 'GET',
      header: { 'apikey': SUPABASE_ANON_KEY }
    });
    return data;
  } else {
    // H5 原有 fetch 逻辑
    const res = await fetch(`${API_BASE}/rest/v1/posts`);
    return res.json();
  }
}

// 或直接使用 supabase-js（支持小程序）
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// supabase-js 内部自动适配 Taro.request
```

### 3. 图片上传适配

```tsx
// H5
const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  await uploadToSupabase(file);
};

// Taro 小程序
const handleUpload = async () => {
  const { tempFiles } = await Taro.chooseImage({ count: 1 });
  const filePath = tempFiles[0].path;
  
  // 上传到 Supabase Storage
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(`public/${Date.now()}.jpg`, {
      data: await Taro.getFileSystemManager().readFile({ filePath, encoding: 'base64' }),
      contentType: 'image/jpeg'
    });
};
```

### 4. 本地存储适配

```tsx
// utils/storage.ts — 统一存储封装
export const storage = {
  get(key: string) {
    if (isWeapp) {
      return Taro.getStorageSync(key);
    }
    return localStorage.getItem(key);
  },
  set(key: string, value: string) {
    if (isWeapp) {
      Taro.setStorageSync(key, value);
    } else {
      localStorage.setItem(key, value);
    }
  },
  remove(key: string) {
    if (isWeapp) {
      Taro.removeStorageSync(key);
    } else {
      localStorage.removeItem(key);
    }
  }
};
```

### 5. UI 组件替换（shadcn/ui → 自研组件）

小程序不支持 Tailwind CSS 的复杂工具类组合，需自研基础组件：

```tsx
// components/ui/button/index.tsx
import { Button as TaroButton } from '@tarojs/components';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, variant = 'default', size = 'md', disabled, onClick 
}) => {
  const classMap = {
    default: 'bg-primary text-white',
    outline: 'border border-primary text-primary bg-transparent',
    ghost: 'bg-transparent text-primary',
  };
  const sizeMap = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  return (
    <TaroButton 
      className={`rounded-lg ${classMap[variant]} ${sizeMap[size]} ${disabled ? 'opacity-50' : ''}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </TaroButton>
  );
};
```

### 6. 样式方案

```scss
// app.scss — 全局变量（替代 Tailwind config）
page {
  --primary: #1890ff;
  --primary-foreground: #ffffff;
  --background: #f5f5f5;
  --foreground: #333333;
  --muted: #f0f0f0;
  --muted-foreground: #999999;
  --card: #ffffff;
  --border: #e8e8e8;
  --destructive: #ff4d4f;
  --radius: 8px;
  font-size: 14px;
  color: var(--foreground);
}

// 公共工具类（精简版 Tailwind）
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.flex-1 { flex: 1; }
.gap-2 { gap: 8px; }
.p-4 { padding: 16px; }
.rounded-xl { border-radius: 12px; }
.bg-card { background-color: var(--card); }
.text-sm { font-size: 12px; }
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

### 7. 底部导航适配

```tsx
// 小程序 tabBar 在 app.config.ts 中配置
// 非 tab 页面内需要底部导航时：

// components/layout/BottomNav.tsx
import Taro from '@tarojs/taro';

const tabs = [
  { page: 'pages/index/index', label: '首页', icon: 'home' },
  { page: 'pages/circle/index', label: '圈子', icon: 'circle' },
  { page: 'pages/business/index', label: '合作', icon: 'briefcase' },
  { page: 'pages/profile/index', label: '我的', icon: 'user' },
];

export const BottomNav = () => {
  const currentPath = Taro.useRouter().path;
  
  return (
    <view className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2 z-50">
      {tabs.map(tab => (
        <view 
          key={tab.page}
          className={`flex flex-col items-center ${currentPath === tab.page ? 'text-primary' : 'text-gray-400'}`}
          onClick={() => Taro.switchTab({ url: `/${tab.page}` })}
        >
          <text className="text-xs">{tab.label}</text>
        </view>
      ))}
    </view>
  );
};
```

### 8. 微信登录适配

```tsx
// 替换H5的 Supabase Auth 为微信登录
const handleWechatLogin = async () => {
  const { code } = await Taro.login({ provider: 'weixin' });
  
  // 调用 Edge Function 用 code 换 session
  const { data } = await Taro.request({
    url: `${API_BASE}/functions/v1/wechat-login`,
    method: 'POST',
    data: { code }
  });
  
  // 存储 JWT token
  Taro.setStorageSync('token', data.token);
  
  // 初始化 supabase 客户端
  supabase.auth.setSession(data.session);
};
```

### 9. 分享功能

```tsx
// 页面内分享
import Taro from '@tarojs/taro';

// 定义分享内容
Taro.useShareAppMessage(() => ({
  title: '齐鲁汇 — 全球山东人的线上家乡',
  path: '/pages/index/index?invite=' + userId,
  imageUrl: 'https://.../share-cover.jpg'
}));

Taro.useShareTimeline(() => ({
  title: '齐鲁汇 — 全球山东人的线上家乡',
  query: 'invite=' + userId,
  imageUrl: 'https://.../share-cover.jpg'
}));
```

### 10. 订阅消息（替代推送通知）

```tsx
// 请求订阅权限
const requestSubscribe = async () => {
  const res = await Taro.requestSubscribeMessage({
    tmplIds: [
      'TEMPLATE_ID_1',  // 活动报名成功
      'TEMPLATE_ID_2',  // 认证审核结果
      'TEMPLATE_ID_3',  // 私信通知
    ]
  });
  
  if (res['TEMPLATE_ID_1'] === 'accept') {
    // 用户同意，记录到后端
    await supabase.from('user_subscriptions').upsert({
      user_id: userId,
      template_id: 'TEMPLATE_ID_1',
      status: 'subscribed'
    });
  }
};
```

## 页面迁移对照表

| H5 页面 | Taro 页面 | 路径 | 备注 |
|---------|----------|------|------|
| HomePage | index | pages/index/index | 首页 |
| CirclePage | circle | pages/circle/index | 老乡圈 |
| PostDetailPage | post-detail | pages/post-detail/index | 帖子详情 |
| ProfilePage | profile | pages/profile/index | 个人中心 |
| AdminPage | admin | pages/admin/index | 管理后台 |
| ChatListPage | chat-list | pages/chat-list/index | 私信列表 |
| ChatPage | chat | pages/chat/index | 私信详情 |
| EventsPage | events | pages/events/index | 活动列表 |
| EventDetailPage | event-detail | pages/event-detail/index | 活动详情 |
| BusinessPage | business | pages/business/index | 商业合作 |
| PointsCenterPage | points | pages/points/index | 积分中心 |
| AIAssistantPage | ai-assistant | pages/ai-assistant/index | AI助手 |
| VerificationPage | verification | pages/verification/index | 用户认证 |
| NotificationsPage | notifications | pages/notifications/index | 消息通知 |
| FollowsPage | follows | pages/follows/index | 关注/粉丝 |

## 迁移Checklist

- [ ] 初始化 Taro 项目（React 模板）
- [ ] 配置 app.config.ts 页面路由和 tabBar
- [ ] 复用 Supabase 数据库和 Edge Functions（无需改动后端）
- [ ] 迁移 AuthContext 为微信登录 + Supabase 会话
- [ ] 创建基础UI组件库（Button/Card/Input/Badge/Dialog）
- [ ] 编写全局样式变量（替代 Tailwind）
- [ ] 逐页迁移：复制页面逻辑 + 适配API调用 + 适配路由
- [ ] 图片上传改为 Taro.chooseImage
- [ ] 地图组件改为腾讯地图或小程序原生 map
- [ ] 分享功能接入 onShareAppMessage
- [ ] 通知改为微信小程序订阅消息
- [ ] 积分签到页面适配（获取用户地理位置需用户授权）
- [ ] 管理后台页面（非tab页面，使用 navigateTo）
- [ ] 打包上传微信开发者工具测试
- [ ] 提交微信审核
