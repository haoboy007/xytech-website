# Logo 粒子环绕动效设计文档

## 一、设计概念

**「粒子塑形 — Logo 的呼吸与脉动」**

以抽象几何 Logo 为核心，粒子作为"光的尘埃"，沿 Logo 轮廓流动、在 Logo 区域内涌现与飘散、从远方汇聚而来。Logo 始终保持清晰稳定，粒子赋予其生命感与科技氛围。

## 二、视觉架构

```
┌─────────────────────────────────────────┐
│                                         │
│    ○  ○      ○ 汇聚粒子（从外向内）      │
│       ○    ○                            │
│                                         │
│         ╭──────────╮                   │
│        ╱   ╲    ╱   ╲                  │
│       │  ╲  │  │  ╱  │  ← 边缘勾勒粒子 │
│       │    ╲│  │╱    │    （沿XY流动）  │
│        ╲    ╲╱╱    ╱                   │
│         ╰──────────╯                   │
│              ↑                          │
│         六边形外框                      │
│                                         │
│       ·  ·  ·  ·  ·                   │
│     ·  ·  ·  ·  ·  ·  ← 内部氛围粒子   │
│       ·  ·  ★  ·  ·      （涌现/飘散）  │
│                                         │
│    ○      ○      ○                     │
└─────────────────────────────────────────┘
```

## 三、粒子系统构成

### 3.1 边缘勾勒粒子（Edge Tracers）

| 属性 | 值 |
|------|-----|
| 数量 | 40-60 |
| 形状 | 圆形光点 + 拖尾 |
| 颜色 | 青色 `#00E5FF` → 白色核心 |
| 运动 | 沿 Logo 几何路径匀速循环 |
| 速度 | 1.5-2.5 px/frame |
| 拖尾长度 | 8-12 个历史点 |

**路径定义**：
- 外框：正六边形（6条边）
- 内部：X 形交叉线 + Y 形竖线（构成 "XY" 字母）

### 3.2 内部氛围粒子（Ambient Particles）

| 属性 | 值 |
|------|-----|
| 数量 | 30-50 |
| 形状 | 微小圆点（0.8-1.5px） |
| 颜色 | 紫色 `#7B61FF` 或青色 `#00E5FF`，随机交替 |
| 诞生 | 从 Logo 中心点随机位置涌现 |
| 运动 | 向外飘散，带轻微随机偏移 |
| 生命周期 | 2-4 秒，渐隐消失 |
| 速度 | 0.3-0.8 px/frame |

### 3.3 汇聚粒子（Convergence Particles）

| 属性 | 值 |
|------|-----|
| 数量 | 20-30 |
| 形状 | 微小星形或圆点 |
| 颜色 | 白色 `#FFFFFF` 半透明 |
| 诞生 | 屏幕边缘随机位置 |
| 运动 | 向 Logo 中心点缓慢汇聚 |
| 行为 | 到达中心后重置到边缘 |
| 速度 | 0.5-1.2 px/frame |

### 3.4 鼠标交互粒子（Interactive Field）

| 属性 | 值 |
|------|-----|
| 触发 | 鼠标靠近 Logo 区域 |
| 效果 | 边缘粒子速度提升1.5倍，颜色变为高亮 |
| 氛围粒子 | 涌现频率加倍 |
| 涟漪 | 鼠标位置产生青色扩散圆环 |

## 四、Logo 几何定义

```typescript
// Logo 由六边形外框 + XY 内部线条构成
// 所有坐标相对于 Logo 中心 (cx, cy)

interface Point { x: number; y: number; }

// 正六边形顶点（半径 R）
function hexagonPoints(cx: number, cy: number, R: number): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6; // 顶点朝上
    pts.push({
      x: cx + R * Math.cos(angle),
      y: cy + R * Math.sin(angle),
    });
  }
  return pts;
}

// XY 内部线条路径
// X: 左上→右下 + 右上→左下
// Y: 顶部中点→底部中点（穿过X交叉点）
```

## 五、动态行为算法

### 5.1 边缘粒子路径跟随

```typescript
// 沿多段路径平滑移动
function moveAlongPath(path: Point[], progress: number): Point {
  const totalLen = pathLength(path);
  const targetDist = progress * totalLen;
  let dist = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const segLen = distance(path[i], path[i + 1]);
    if (dist + segLen >= targetDist) {
      const t = (targetDist - dist) / segLen;
      return lerpPoint(path[i], path[i + 1], t);
    }
    dist += segLen;
  }
  return path[path.length - 1];
}
```

### 5.2 内部粒子涌现

```typescript
// 每帧以一定概率在中心附近生成新粒子
if (Math.random() < spawnRate) {
  ambientParticles.push({
    x: cx + (Math.random() - 0.5) * 20,
    y: cy + (Math.random() - 0.5) * 20,
    vx: (Math.random() - 0.5) * 0.8,
    vy: (Math.random() - 0.5) * 0.8 - 0.3, // 略微向上飘散
    life: 1.0,
    decay: 0.003 + Math.random() * 0.005,
    color: Math.random() > 0.5 ? "#00E5FF" : "#7B61FF",
  });
}
```

### 5.3 汇聚粒子

```typescript
// 向中心点移动
const dx = cx - particle.x;
const dy = cy - particle.y;
const dist = Math.sqrt(dx * dx + dy * dy);
if (dist < 10) {
  // 到达中心，重置到边缘
  resetToEdge(particle);
} else {
  particle.x += (dx / dist) * speed;
  particle.y += (dy / dist) * speed;
}
```

## 六、可调参数面板

| 参数 | 范围 | 说明 |
|------|------|------|
| `LOGO_RADIUS` | 80-150 | Logo 六边形半径 |
| `EDGE_PARTICLE_COUNT` | 20-80 | 边缘勾勒粒子数 |
| `AMBIENT_PARTICLE_COUNT` | 20-60 | 内部氛围粒子数 |
| `CONVERGE_PARTICLE_COUNT` | 10-40 | 汇聚粒子数 |
| `EDGE_SPEED` | 1.0-4.0 | 边缘粒子运动速度 |
| `AMBIENT_SPAWN_RATE` | 0.01-0.1 | 氛围粒子生成频率 |
| `GLOW_INTENSITY` | 0.5-1.5 | 发光强度倍数 |
| `COLOR_SCHEME` | "cyan-purple" / "blue-green" / "gold-orange" | 配色方案 |

## 七、渲染层级

```
Layer 0: 深色背景（径向渐变 #0c1220 → #030508）
Layer 1: Logo 几何轮廓线（低透明度描边，作为"轨道"参考）
Layer 2: 汇聚粒子（最底层，白色半透明）
Layer 3: 内部氛围粒子（中层，紫/青微小圆点）
Layer 4: Logo 核心图形（清晰六边形 + XY 线条，实色）
Layer 5: 边缘勾勒粒子（顶层，带发光拖尾）
Layer 6: 鼠标涟漪（最高层，扩散圆环）
```

## 八、性能预算

| 指标 | 目标 |
|------|------|
| 总粒子数 | < 200 |
| draw 调用/帧 | < 50 |
| shadowBlur 使用 | 仅边缘粒子（~60个） |
| 目标帧率 | 60fps @ 1920×1080 |
| 内存占用 | < 10MB |

## 九、扩展方向

1. **Logo 替换**：将六边形+XY替换为企业实际Logo的SVG Path
2. **文字模式**：支持将任意文字转为粒子路径（需字体轮廓提取）
3. **3D 透视**：Logo 轻微旋转，粒子带深度感
4. **音效联动**：粒子汇聚时触发轻微音调
