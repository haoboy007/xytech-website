# 积分系统完整设计

> 基于齐鲁汇积分中心 7 个子模块的闭环实践

## 系统架构

积分系统是圈层平台的核心增长引擎，包含：
- **积分获取**：签到、任务、成就
- **积分消费**：商城兑换
- **积分记录**：流水明细
- **积分排行**：全站排名
- **订单管理**：发货/退款
- **数据统计**：后台运营分析

## 核心流程

### 1. 签到系统

```ts
// api.ts
export async function signIn() {
  const { data, error } = await supabase.rpc('daily_signin', {
    p_user_id: getCurrentUserId()
  });
  if (error) throw error;
  return data; // { points_earned, streak_days, is_new_streak }
}
```

```sql
-- PostgreSQL 函数
CREATE OR REPLACE FUNCTION daily_signin(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_record user_points%ROWTYPE;
  v_points INTEGER := 10;
  v_streak INTEGER;
  v_is_new_streak BOOLEAN := FALSE;
BEGIN
  SELECT * INTO v_record FROM user_points WHERE user_id = p_user_id;
  
  -- 检查今日是否已签到
  IF v_record.last_signin_date = CURRENT_DATE THEN
    RETURN json_build_object('error', '今日已签到');
  END IF;
  
  -- 连续签到逻辑
  IF v_record.last_signin_date = CURRENT_DATE - INTERVAL '1 day' THEN
    v_streak := v_record.streak_days + 1;
    v_is_new_streak := TRUE;
    -- 连续7天额外奖励
    IF v_streak % 7 = 0 THEN
      v_points := v_points + 50;
    END IF;
  ELSE
    v_streak := 1;
  END IF;
  
  -- 更新用户积分
  UPDATE user_points SET
    total_points = total_points + v_points,
    available_points = available_points + v_points,
    total_earned = total_earned + v_points,
    streak_days = v_streak,
    last_signin_date = CURRENT_DATE
  WHERE user_id = p_user_id;
  
  -- 记录流水
  INSERT INTO point_transactions (user_id, type, amount, reason)
  VALUES (p_user_id, 'earn', v_points, '每日签到');
  
  RETURN json_build_object(
    'points_earned', v_points,
    'streak_days', v_streak,
    'is_new_streak', v_is_new_streak
  );
END;
$$ LANGUAGE plpgsql;
```

### 2. 任务系统

#### 任务类型设计

| 类型 | 说明 | 示例 |
|------|------|------|
| daily | 每日可重复 | 发布动态、评论、分享 |
| weekly | 每周可重复 | 连续签到7天 |
| once | 一次性 | 完善资料、首次发布 |
| achievement | 成就类 | 累计获得100赞、发布50条 |

#### 任务完成检测

```sql
-- 触发器：用户发布帖子后自动检测任务
CREATE OR REPLACE FUNCTION check_post_task()
RETURNS TRIGGER AS $$
BEGIN
  -- 每日发布任务
  INSERT INTO point_task_completions (user_id, task_id, completed_at)
  SELECT NEW.user_id, t.id, NOW()
  FROM point_tasks t
  WHERE t.action_type = 'post' AND t.type = 'daily'
    AND NOT EXISTS (
      SELECT 1 FROM point_task_completions c
      WHERE c.task_id = t.id AND c.user_id = NEW.user_id
      AND c.completed_at >= CURRENT_DATE
    );
  
  -- 成就类：累计发帖数
  IF (SELECT COUNT(*) FROM posts WHERE user_id = NEW.user_id) = 50 THEN
    INSERT INTO point_task_completions (user_id, task_id, completed_at)
    SELECT NEW.user_id, t.id, NOW()
    FROM point_tasks t
    WHERE t.action_type = 'post' AND t.type = 'achievement'
    AND t.condition_value = '50';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 3. 积分商城

```tsx
// PointsMallPage.tsx
export default function PointsMallPage() {
  const [products, setProducts] = useState<PointProduct[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<PointProduct | null>(null);

  const handleExchange = async (product: PointProduct, address: string) => {
    if (userPoints < product.points_cost) {
      toast.error('积分不足');
      return;
    }
    try {
      await exchangeProduct(product.id, address);
      toast.success('兑换成功，请等待发货');
      setUserPoints(prev => prev - product.points_cost);
    } catch (err) {
      toast.error('兑换失败: ' + (err as Error).message);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {products.map(p => (
        <div key={p.id} className="bg-card rounded-xl border border-border p-3">
          <img src={p.image_url} className="w-full h-32 object-cover rounded-lg" />
          <h4 className="text-sm font-semibold mt-2">{p.name}</h4>
          <p className="text-xs text-muted-foreground">{p.points_cost} 积分</p>
          <Button 
            size="sm" 
            disabled={userPoints < p.points_cost || p.stock === 0}
            onClick={() => setSelectedProduct(p)}
          >
            {userPoints < p.points_cost ? '积分不足' : '立即兑换'}
          </Button>
        </div>
      ))}
    </div>
  );
}
```

### 4. 积分排行榜

```sql
-- 全站积分排行
SELECT 
  p.id, p.nickname, p.avatar_url, up.total_points, up.total_earned,
  RANK() OVER (ORDER BY up.total_points DESC) as rank
FROM profiles p
JOIN user_points up ON up.user_id = p.id
ORDER BY up.total_points DESC
LIMIT 100;
```

```tsx
// 排行榜展示
const getRankStyle = (rank: number) => {
  if (rank === 1) return 'bg-yellow-100 text-yellow-700';   // 金牌
  if (rank === 2) return 'bg-gray-100 text-gray-700';       // 银牌
  if (rank === 3) return 'bg-amber-100 text-amber-700';     // 铜牌
  return 'bg-muted text-muted-foreground';
};
```

### 5. 订单管理

```tsx
// 订单状态流转
const orderActions = {
  pending: [
    { label: '发货', action: 'ship', requires: 'tracking_number' },
    { label: '退款', action: 'refund' }
  ],
  shipped: [
    { label: '完成', action: 'complete' },
    { label: '退款', action: 'refund' }
  ],
  completed: [],
  refunded: []
};

// 发货时积分不退还，退款时积分返还
export async function refundPointOrder(orderId: string) {
  const { data: order } = await supabase.from("point_orders").select("*, product:product_id(points_cost)").eq("id", orderId).single();
  if (!order) throw new Error("订单不存在");
  
  // 返还积分
  await supabase.rpc('adjust_user_points', {
    p_user_id: order.user_id,
    p_delta: order.points_used,
    p_reason: '积分商城退款返还'
  });
  
  // 更新订单状态
  await supabase.from("point_orders").update({ status: 'refunded' }).eq("id", orderId);
}
```

## 前端页面清单

| 页面 | 路径 | 功能 |
|------|------|------|
| 积分中心 | /points | 总览、快速入口 |
| 每日签到 | /points/signin | 日历签到、连续天数展示 |
| 任务中心 | /points/tasks | 任务列表、进度、领奖 |
| 积分商城 | /points/mall | 商品浏览、兑换 |
| 排行榜 | /points/leaderboard | 全站排名 |
| 积分流水 | /points/history | 收支明细 |
| 我的订单 | /points/orders | 兑换记录、物流 |

## 积分防刷机制

1. **频率限制**：同一动作每日最多 N 次
2. **内容审核**：帖子需审核通过才计积分
3. **行为检测**：异常快速连续操作标记可疑
4. **扣除机制**：删除帖子/评论时扣除对应积分
