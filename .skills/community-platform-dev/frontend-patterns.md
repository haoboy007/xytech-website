# 圈层平台前端开发模式

> 基于 React + shadcn/ui + Tailwind CSS + Vite + TypeScript 的 39 页实践经验

## 项目结构范式

```
src/
├── pages/           # 页面组件（每个路由对应一个页面）
│   ├── HomePage.tsx
│   ├── CirclePage.tsx
│   ├── PostDetailPage.tsx
│   ├── ProfilePage.tsx
│   └── AdminPage.tsx
├── components/
│   ├── ui/          # shadcn/ui 基础组件（Button, Card, Dialog, Input, Badge, Avatar, Tabs等）
│   ├── common/      # 业务公共组件
│   │   ├── SectionHeader.tsx     # 带图标和计数的区块标题
│   │   ├── SearchInput.tsx       # 带图标的搜索输入框
│   │   ├── LoadingState.tsx      # 加载骨架屏
│   │   └── EmptyState.tsx        # 空状态提示
│   └── layout/
│       └── BottomNav.tsx         # 底部导航栏
├── services/
│   └── api.ts       # 所有 Supabase API 调用（按模块分组）
├── types/
│   └── types.ts     # TypeScript 类型定义
├── contexts/
│   └── AuthContext.tsx           # 认证上下文（用户状态、角色判断）
├── hooks/
│   └── useAuth.ts   # 自定义 Hook
├── lib/
│   └── utils.ts     # 工具函数（cn合并、日期格式化等）
└── routes.tsx       # 路由配置
```

## 页面组件设计模式

### 标准页面模板

每个页面应包含：
1. **数据加载**：useEffect 初始化加载
2. **加载状态**：loading 骨架屏
3. **空状态**：EmptyState 组件
4. **错误处理**：try-catch + toast 提示
5. **刷新能力**：下拉刷新或刷新按钮

```tsx
// 标准页面结构
export default function SomePage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await fetchItems();
      setItems(data);
    } catch (err) {
      toast.error("加载失败: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [user]);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="flex items-center px-4 h-14 border-b sticky top-0 z-40 bg-background">
        <button onClick={() => navigate(-1)}><ArrowLeft /></button>
        <h1 className="flex-1 text-center text-base font-semibold">页面标题</h1>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {loading ? <LoadingState /> :
         items.length === 0 ? <EmptyState text="暂无数据" /> :
         items.map(item => <ItemCard key={item.id} {...item} />)}
      </div>
    </div>
  );
}
```

### Admin 管理后台模式

```tsx
// AdminPage.tsx 核心结构
type AdminTab = "overview" | "content" | "verifications" | "users" | "settings";

const tabs: TabConfig[] = [
  { key: "overview", label: "概览", icon: <LayoutDashboard /> },
  { key: "content", label: "内容", icon: <Newspaper /> },
  // ...
];

// 每个 tab 对应一个 render 函数
const renderOverview = () => (/* 统计卡片 + 图表 */);
const renderContent = () => (/* 列表 + 搜索 + 审核按钮 */);
const renderVerifications = () => (/* 认证列表 + 统计 + 筛选 */);

// 底部导航
<div className="fixed bottom-0 left-0 right-0 bg-background border-t z-50">
  {tabs.map(tab => (
    <button key={tab.key} onClick={() => setActiveTab(tab.key)}>
      {tab.icon} <span>{tab.label}</span>
    </button>
  ))}
</div>
```

## 通用组件模式

### SectionHeader — 区块标题

```tsx
function SectionHeader({ icon, title, count, action }: {
  icon: React.ReactNode;
  title: string;
  count?: number;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-semibold">{title}</h3>
        {count !== undefined && <span className="text-xs text-muted-foreground">({count})</span>}
      </div>
      {action}
    </div>
  );
}
```

### SearchInput — 搜索框

```tsx
function SearchInput({ value, onChange, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  );
}
```

### 状态标签 Badge

```tsx
// 根据状态自动配色
const statusConfig = {
  pending:  { label: '待审核', class: 'bg-yellow-100 text-yellow-700' },
  approved: { label: '已通过', class: 'bg-green-100 text-green-700' },
  rejected: { label: '已拒绝', class: 'bg-red-100 text-red-700' },
};

<span className={`text-[10px] px-1.5 py-0.5 rounded-full ${statusConfig[status].class}`}>
  {statusConfig[status].label}
</span>
```

## 列表与筛选模式

### 筛选 + 搜索 + 列表组合

```tsx
const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
const [search, setSearch] = useState('');

// 在 render 中组合筛选逻辑
const filtered = items.filter(item => {
  if (filter === 'pending' && item.status !== 'pending') return false;
  if (search) {
    const term = search.toLowerCase();
    return item.name.toLowerCase().includes(term);
  }
  return true;
});
```

### 分页加载

```tsx
const [page, setPage] = useState(0);
const PAGE_SIZE = 20;

// Supabase 分页
const { data } = await supabase
  .from('posts')
  .select('*')
  .order('created_at', { ascending: false })
  .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
```

## Dialog / Modal 模式

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// 详情弹窗
<Dialog open={showModal} onOpenChange={setShowModal}>
  <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg max-h-[85dvh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>详情标题</DialogTitle>
      <DialogDescription>描述文字</DialogDescription>
    </DialogHeader>
    {/* 内容 */}
  </DialogContent>
</Dialog>
```

## 图片上传模式

```tsx
const [uploading, setUploading] = useState(false);

const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  setUploading(true);
  try {
    const url = await uploadImage(file, 'avatars');  // bucket 名称
    setAvatarUrl(url);
    toast.success('上传成功');
  } catch (err) {
    toast.error('上传失败');
  } finally {
    setUploading(false);
  }
};
```

## 路由配置模式

```tsx
export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  public?: boolean;   // 无需登录
  admin?: boolean;    // 需管理员
}

export const routes: RouteConfig[] = [
  { name: '首页', path: '/', element: <HomePage />, public: true },
  { name: '个人中心', path: '/profile', element: <ProfilePage /> },
  { name: '管理后台', path: '/admin', element: <AdminPage />, admin: true },
  // ...
];
```

## 认证路由守卫

```tsx
// App.tsx 中统一处理
function App() {
  const { user, isAdmin } = useAuth();

  return (
    <Routes>
      {routes.map(route => {
        if (route.admin && !isAdmin) return null;
        if (!route.public && !user) return <Route key={route.path} path={route.path} element={<Navigate to="/login" />} />;
        return <Route key={route.path} path={route.path} element={route.element} />;
      })}
    </Routes>
  );
}
```
