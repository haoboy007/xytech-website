# 商业合作模块设计

> 基于企业名录、商业机会、融资路演、并购投资、招商引才五大子模块实践

## 模块架构

```
商业合作 /
├── 企业名录 (Business)         — 企业信息展示与认领
├── 商业机会 (Opportunity)        — 供需对接
├── 融资路演 (Funding)           — 项目融资展示
├── 并购投资 (M&A)               — 并购需求对接
└── 招商引才 (Investment)        — 政府/园区招商
```

## 1. 企业名录

### 数据模型

```sql
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,               -- 企业名称
  description TEXT,
  industry TEXT,                    -- 行业分类
  location TEXT,
  logo_url TEXT,
  website TEXT,
  contact_info TEXT,
  is_claimed BOOLEAN DEFAULT FALSE, -- 是否已被认领
  claimed_by UUID REFERENCES profiles(id),
  owner_name TEXT,                  -- 法人/负责人
  employee_count TEXT,              -- 规模
  established_year INTEGER,
  images TEXT[],
  view_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 企业认领申请
CREATE TABLE business_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id),
  user_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending',
  proof_document_url TEXT,        -- 营业执照或其他证明
  contact_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 企业认领流程

```tsx
// 用户端：企业详情页
export default function BusinessDetailPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [hasClaimed, setHasClaimed] = useState(false);

  const handleClaim = async () => {
    const proof = await uploadClaimProof();
    await submitClaim({ businessId: id, proofDocumentUrl: proof, contactPhone });
    toast.success('认领申请已提交，等待审核');
  };

  return (
    <div className="p-4 space-y-4">
      {/* 企业头部 */}
      <div className="flex items-center gap-3">
        <img src={business?.logo_url} className="w-16 h-16 rounded-lg object-cover" />
        <div>
          <h1 className="text-lg font-bold">{business?.name}</h1>
          <p className="text-xs text-muted-foreground">{business?.industry}</p>
        </div>
      </div>
      
      {/* 认领状态 */}
      {!business?.is_claimed ? (
        <Button onClick={handleClaim}>认领该企业</Button>
      ) : (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <BadgeCheck className="w-4 h-4" />
          <span>已认证</span>
        </div>
      )}
      
      {/* 联系信息 */}
      {business?.contact_info && (
        <div className="bg-card rounded-xl border border-border p-3">
          <h3 className="text-sm font-semibold">联系方式</h3>
          <p className="text-sm mt-1">{business.contact_info}</p>
        </div>
      )}
    </div>
  );
}
```

## 2. 商业机会

```sql
CREATE TABLE business_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('supply', 'demand', 'cooperation')), -- 供应/需求/合作
  industry TEXT,
  location TEXT,
  budget_range TEXT,               -- 预算范围
  contact_info TEXT,
  images TEXT[],
  is_pinned BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  audit_status TEXT DEFAULT 'pending',
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 商机列表设计

```tsx
// 按类型筛选
const [filter, setFilter] = useState<'all' | 'supply' | 'demand' | 'cooperation'>('all');

// 商机卡片
<div className="bg-card rounded-xl border border-border p-3">
  <div className="flex items-center gap-2">
    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
      opp.type === 'supply' ? 'bg-blue-100 text-blue-700' :
      opp.type === 'demand' ? 'bg-orange-100 text-orange-700' :
      'bg-purple-100 text-purple-700'
    }`}>
      {opp.type === 'supply' ? '供应' : opp.type === 'demand' ? '需求' : '合作'}
    </span>
    <span className="text-xs text-muted-foreground">{opp.industry}</span>
  </div>
  <h4 className="text-sm font-semibold mt-1">{opp.title}</h4>
  <p className="text-xs text-muted-foreground line-clamp-2">{opp.description}</p>
  {opp.budget_range && (
    <p className="text-xs text-primary mt-1">预算: {opp.budget_range}</p>
  )}
</div>
```

## 3. 融资路演

```sql
CREATE TABLE funding_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,               -- 项目名称
  description TEXT,
  industry TEXT,
  stage TEXT,                       -- 种子轮/天使轮/A轮/B轮/Pre-IPO
  funding_amount TEXT,              -- 融资金额
  funding_purpose TEXT,             -- 资金用途
  team_size INTEGER,
  location TEXT,
  company_name TEXT,
  contact_info TEXT,
  images TEXT[],
  source_url TEXT,                  -- 外链详情
  view_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  audit_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 融资项目卡片

```tsx
<div className="bg-card rounded-xl border border-border p-3">
  {/* 项目标签 */}
  <div className="flex items-center gap-2">
    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
      {project.stage}
    </span>
    <span className="text-xs text-muted-foreground">{project.industry}</span>
  </div>
  
  <h4 className="text-sm font-semibold mt-1">{project.name}</h4>
  <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
  
  {/* 关键数据 */}
  <div className="grid grid-cols-2 gap-2 mt-2">
    <div className="bg-muted rounded-lg p-2 text-center">
      <p className="text-xs text-muted-foreground">融资金额</p>
      <p className="text-sm font-bold text-primary">{project.funding_amount}</p>
    </div>
    <div className="bg-muted rounded-lg p-2 text-center">
      <p className="text-xs text-muted-foreground">团队规模</p>
      <p className="text-sm font-bold">{project.team_size}人</p>
    </div>
  </div>
</div>
```

## 4. 并购投资

```sql
CREATE TABLE mna_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('acquisition', 'merger', 'investment')), -- 收购/合并/投资
  industry TEXT,
  target_description TEXT,          -- 标的描述
  deal_size TEXT,                   -- 交易规模
  location TEXT,
  contact_info TEXT,
  images TEXT[],
  view_count INTEGER DEFAULT 0,
  audit_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 5. 招商引才

```sql
CREATE TABLE investment_attraction (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('investment', 'talent')), -- 招商/引才
  description TEXT,
  region TEXT,                      -- 区域
  preferential_policy TEXT,         -- 优惠政策
  target_industry TEXT,             -- 目标产业
  contact_info TEXT,
  images TEXT[],
  view_count INTEGER DEFAULT 0,
  audit_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 商业模块通用前端模式

### 列表 + 筛选 + 发布入口

```tsx
export default function BusinessPage() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  return (
    <div className="p-4 space-y-4">
      {/* 搜索 + 发布 */}
      <div className="flex gap-2">
        <SearchInput value={search} onChange={setSearch} placeholder="搜索..." />
        <Link to="/create">
          <Button><Plus className="w-4 h-4" /></Button>
        </Link>
      </div>
      
      {/* 筛选标签 */}
      <div className="flex gap-1 overflow-x-auto">
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3 py-1 rounded-full text-xs ${filter === f.key ? 'bg-primary text-white' : 'bg-muted'}`}>
            {f.label}
          </button>
        ))}
      </div>
      
      {/* 列表 */}
      {items.map(item => <ItemCard key={item.id} {...item} />)}
    </div>
  );
}
```

### 详情页通用结构

```tsx
// 所有商业详情页共享的通用结构
const BusinessDetailTemplate = ({ item, type }: { item: any; type: string }) => (
  <div className="p-4 space-y-4">
    {/* 头部 */}
    <div className="flex items-start gap-3">
      <img src={item.logo_url || item.images?.[0]} className="w-16 h-16 rounded-lg object-cover" />
      <div>
        <h1 className="text-lg font-bold">{item.name || item.title}</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{item.industry}</span>
          <span className="text-xs text-muted-foreground">{item.location}</span>
        </div>
      </div>
    </div>
    
    {/* 描述 */}
    <div className="bg-card rounded-xl border border-border p-4">
      <h3 className="text-sm font-semibold">详情介绍</h3>
      <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line">{item.description}</p>
    </div>
    
    {/* 关键信息 */}
    <div className="grid grid-cols-2 gap-3">
      {item.funding_amount && (
        <div className="bg-card rounded-xl border border-border p-3">
          <p className="text-xs text-muted-foreground">金额/规模</p>
          <p className="text-sm font-bold">{item.funding_amount}</p>
        </div>
      )}
      {item.contact_info && (
        <div className="bg-card rounded-xl border border-border p-3">
          <p className="text-xs text-muted-foreground">联系方式</p>
          <p className="text-sm">{item.contact_info}</p>
        </div>
      )}
    </div>
    
    {/* 操作 */}
    <div className="flex gap-2">
      <Button className="flex-1">联系发布方</Button>
      <Button variant="outline" onClick={() => shareItem(item)}>分享</Button>
    </div>
  </div>
);
```

## 后台审核管理

```tsx
// AdminPage 商业管理模块
const renderCooperation = () => (
  <div className="space-y-6">
    {/* 企业管理 */}
    <div>
      <SectionHeader icon={<Building2 />} title="企业名录" count={businesses.length} />
      {/* 企业列表 + 审核 */}
    </div>
    
    {/* 商机管理 */}
    <div>
      <SectionHeader icon={<Briefcase />} title="商业机会" count={opportunities.length} />
      {/* 商机列表 + 审核 */}
    </div>
    
    {/* 融资路演 */}
    <div>
      <SectionHeader icon={<TrendingUp />} title="融资路演" count={fundingProjects.length} />
      {/* 融资列表 + 审核 */}
    </div>
    
    {/* 并购投资 */}
    <div>
      <SectionHeader icon={<GitMerge />} title="并购投资" count={mnaProjects.length} />
    </div>
    
    {/* 招商引才 */}
    <div>
      <SectionHeader icon={<MapPin />} title="招商引才" count={investmentAttractions.length} />
    </div>
  </div>
);
```
