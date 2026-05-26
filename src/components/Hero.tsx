import { useEffect, useRef } from "react";
import { motion } from "motion/react";

// ============================================================================
// 太极粒子能量场动效（Taiji Energy Field）
// 核心理念：汇聚无限能量、成为连接万物的中心节点
// 图形结构：太极图式动态平衡与循环相生
// 风格定位：中式哲学意境 + 现代科技美学
// ============================================================================

interface Pt { x: number; y: number; }

const dist = (a: Pt, b: Pt) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

// ========== 太极图几何工具 ==========

/** 沿大圆轨道采样 */
function circlePoint(cx: number, cy: number, r: number, angle: number): Pt {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

/** 沿S形路径采样（太极分割线）t: 0~1 */
function sPathPoint(r: number, t: number): Pt {
  if (t <= 0.5) {
    // 上半弧：圆心(0, -r/2)，半径r/2，逆时针从顶部到中心
    const a = -Math.PI / 2 + (t * 2) * Math.PI; // -π/2 → π/2
    return { x: (r / 2) * Math.cos(a), y: -r / 2 + (r / 2) * Math.sin(a) };
  }
  // 下半弧：圆心(0, r/2)，半径r/2，顺时针从中心到底部
  const t2 = (t - 0.5) * 2; // 0 → 1
  const a = Math.PI / 2 - t2 * Math.PI; // π/2 → -π/2
  return { x: (r / 2) * Math.cos(a), y: r / 2 + (r / 2) * Math.sin(a) };
}

/** 绘制太极图核心图形（外圆 + S形分割线 + 双眼脉动） */
function drawTaijiCore(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number, rotation: number, time: number
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);

  const pulse = Math.sin(time * 1.5) * 0.25 + 0.75; // 呼吸脉动 0.5~1.0

  // ---- 1. 外圆描边（玉石白 + 发光） ----
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(200, 210, 230, ${0.12 + pulse * 0.08})`;
  ctx.lineWidth = 1.5;
  ctx.shadowBlur = 10;
  ctx.shadowColor = "rgba(0, 229, 255, 0.2)";
  ctx.stroke();
  ctx.shadowBlur = 0;

  // ---- 2. S形分割线（科技青色发光） ----
  ctx.beginPath();
  // 上半弧
  ctx.arc(0, -r / 2, r / 2, -Math.PI / 2, Math.PI / 2, false);
  // 下半弧（顺时针方向，与前弧自然连接）
  ctx.arc(0, r / 2, r / 2, -Math.PI / 2, Math.PI / 2, true);
  ctx.strokeStyle = `rgba(0, 229, 255, ${0.15 + pulse * 0.1})`;
  ctx.lineWidth = 1.2;
  ctx.shadowBlur = 8;
  ctx.shadowColor = "rgba(0, 229, 255, 0.25)";
  ctx.stroke();
  ctx.shadowBlur = 0;

  // ---- 3. 阳面区域（右侧）- 极淡深空蓝 ----
  ctx.beginPath();
  ctx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2);
  ctx.fillStyle = "rgba(15, 23, 42, 0.25)"; // 深空蓝 tint
  ctx.fill();

  // ---- 4. 阴面区域（左侧）- 极淡科技紫 ----
  ctx.beginPath();
  ctx.arc(0, 0, r, Math.PI / 2, -Math.PI / 2);
  ctx.fillStyle = "rgba(88, 28, 135, 0.15)"; // 科技紫 tint
  ctx.fill();

  // 上半小圆（阳鱼头）
  ctx.beginPath();
  ctx.arc(0, -r / 2, r / 2, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(15, 23, 42, 0.2)";
  ctx.fill();

  // 下半小圆（阴鱼头）
  ctx.beginPath();
  ctx.arc(0, r / 2, r / 2, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(88, 28, 135, 0.12)";
  ctx.fill();

  // ---- 5. 阳眼（阴中之阳 - 能量橙发光） ----
  ctx.beginPath();
  ctx.arc(0, -r / 2, r / 10, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(249, 115, 22, ${pulse})`; // 能量橙
  ctx.shadowBlur = 20 * pulse;
  ctx.shadowColor = "rgba(249, 115, 22, 0.6)";
  ctx.fill();
  ctx.shadowBlur = 0;
  // 眼内核
  ctx.beginPath();
  ctx.arc(0, -r / 2, r / 22, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.fill();

  // ---- 6. 阴眼（阳中之阴 - 科技紫发光） ----
  ctx.beginPath();
  ctx.arc(0, r / 2, r / 10, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(123, 97, 255, ${pulse})`; // 科技紫
  ctx.shadowBlur = 20 * pulse;
  ctx.shadowColor = "rgba(123, 97, 255, 0.6)";
  ctx.fill();
  ctx.shadowBlur = 0;
  // 眼内核
  ctx.beginPath();
  ctx.arc(0, r / 2, r / 22, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.fill();

  ctx.restore();
}

// ========== 粒子类型定义 ==========

interface OrbitParticle {
  angle: number; speed: number;
  rx: number; ry: number; tilt: number;
  color: string; size: number;
  trail: Pt[];
}

interface SPathParticle {
  t: number; speed: number;
  color: string; size: number;
  dir: 1 | -1; // 正向/反向流动
}

interface ConvergeParticle {
  x: number; y: number;
  angle: number; speed: number;
  size: number; alpha: number;
}

interface AmbientParticle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  color: string; size: number;
}

interface EnergyWave {
  radius: number; alpha: number; speed: number;
}

interface CircuitLine {
  angle: number; length: number; pulsePos: number; speed: number;
}

function TaijiEnergyField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: false });
    if (!ctx) return;

    let animId: number;
    let w = 0, h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // 配置
    const CFG = {
      TJ_R: 110,               // 太极半径
      ORBIT_COUNT: 2,
      P_PER_ORBIT: 22,
      S_PATH_COUNT: 16,        // S形流动粒子
      AMBIENT_MAX: 35,
      CONVERGE_COUNT: 28,
      WAVE_COUNT: 3,
      CIRCUIT_COUNT: 12,       // 电路脉络线条
    };

    let cx = 0, cy = 0;
    const mouse = { x: -9999, y: -9999, active: false, near: false };

    // 粒子池
    const orbitP: OrbitParticle[] = [];
    const sPathP: SPathParticle[] = [];
    const convergeP: ConvergeParticle[] = [];
    const ambientP: AmbientParticle[] = [];
    const waves: EnergyWave[] = [];
    const circuits: CircuitLine[] = [];
    const ripples: { x: number; y: number; r: number; alpha: number; born: number }[] = [];

    let taijiRotation = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cx = w / 2;
      cy = h / 2;
      CFG.TJ_R = Math.min(w, h) * 0.18;
    };
    resize();
    window.addEventListener("resize", resize);

    // 初始化轨道粒子
    const initOrbit = () => {
      orbitP.length = 0;
      const colors = ["#00E5FF", "#7B61FF"];
      for (let o = 0; o < CFG.ORBIT_COUNT; o++) {
        const baseR = CFG.TJ_R * (1.15 + o * 0.35);
        for (let i = 0; i < CFG.P_PER_ORBIT; i++) {
          orbitP.push({
            angle: (i / CFG.P_PER_ORBIT) * Math.PI * 2 + Math.random(),
            speed: 0.004 + Math.random() * 0.003,
            rx: baseR + Math.random() * 25,
            ry: baseR * 0.65 + Math.random() * 15,
            tilt: (o * Math.PI) / 5 + Math.random() * 0.2,
            color: colors[(o + i) % 2],
            size: 1.5 + Math.random() * 1.5,
            trail: [],
          });
        }
      }
    };
    initOrbit();

    // 初始化S形路径粒子
    const initSPath = () => {
      sPathP.length = 0;
      for (let i = 0; i < CFG.S_PATH_COUNT; i++) {
        sPathP.push({
          t: Math.random(),
          speed: 0.002 + Math.random() * 0.002,
          color: i % 2 === 0 ? "#00E5FF" : "#F97316", // 青色 / 能量橙
          size: 1.2 + Math.random(),
          dir: i % 2 === 0 ? 1 : -1,
        });
      }
    };
    initSPath();

    // 初始化汇聚粒子
    const initConverge = () => {
      convergeP.length = 0;
      for (let i = 0; i < CFG.CONVERGE_COUNT; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.max(w, h) * 0.5 + Math.random() * 250;
        convergeP.push({
          x: cx + Math.cos(a) * r,
          y: cy + Math.sin(a) * r,
          angle: a,
          speed: 0.3 + Math.random() * 0.5,
          size: 0.7 + Math.random() * 1,
          alpha: 0.2 + Math.random() * 0.3,
        });
      }
    };
    initConverge();

    // 初始化能量波纹
    const initWaves = () => {
      waves.length = 0;
      for (let i = 0; i < CFG.WAVE_COUNT; i++) {
        waves.push({
          radius: CFG.TJ_R * 0.5 + i * 45,
          alpha: 0.12 - i * 0.03,
          speed: 0.25 + i * 0.12,
        });
      }
    };
    initWaves();

    // 初始化电路脉络
    const initCircuits = () => {
      circuits.length = 0;
      for (let i = 0; i < CFG.CIRCUIT_COUNT; i++) {
        circuits.push({
          angle: (i / CFG.CIRCUIT_COUNT) * Math.PI * 2 + Math.random() * 0.2,
          length: CFG.TJ_R * (0.6 + Math.random() * 0.5),
          pulsePos: Math.random(),
          speed: 0.003 + Math.random() * 0.004,
        });
      }
    };
    initCircuits();

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
      const d = dist({ x: mouse.x, y: mouse.y }, { x: cx, y: cy });
      mouse.near = d < CFG.TJ_R * 2.5;

      if (ripples.length === 0 || Date.now() - ripples[ripples.length - 1].born > 200) {
        ripples.push({ x: e.clientX, y: e.clientY, r: 0, alpha: 0.3, born: Date.now() });
      }
      if (ripples.length > 6) ripples.shift();
    };
    window.addEventListener("mousemove", onMouseMove);

    const draw = (time: number) => {
      ctx.clearRect(0, 0, w, h);
      const tSec = time * 0.001;
      const speedMult = mouse.near ? 1.7 : 1.0;

      // 太极图缓慢旋转
      taijiRotation += 0.0003 * speedMult;

      // ========== Layer 0: 汇聚粒子（底层白色星尘） ==========
      for (const p of convergeP) {
        const dx = cx - p.x;
        const dy = cy - p.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < CFG.TJ_R * 0.35) {
          const a = Math.random() * Math.PI * 2;
          const r = Math.max(w, h) * 0.55 + Math.random() * 200;
          p.x = cx + Math.cos(a) * r;
          p.y = cy + Math.sin(a) * r;
        } else {
          p.x += (dx / d) * p.speed * speedMult;
          p.y += (dy / d) * p.speed * speedMult;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 230, 255, ${p.alpha})`;
        ctx.fill();
      }

      // ========== Layer 1: 能量波纹（从中心扩散） ==========
      for (const wave of waves) {
        wave.radius += wave.speed * speedMult;
        const maxR = CFG.TJ_R * 2.8;
        if (wave.radius > maxR) wave.radius = CFG.TJ_R * 0.4;
        const prog = wave.radius / maxR;
        const alpha = wave.alpha * (1 - prog);

        ctx.beginPath();
        ctx.arc(cx, cy, wave.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        if (wave.radius > CFG.TJ_R * 1.2) {
          ctx.beginPath();
          ctx.arc(cx, cy, wave.radius - 12, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(249, 115, 22, ${alpha * 0.4})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }

      // ========== Layer 2: 电路脉络（放射状科技感细线） ==========
      for (const circ of circuits) {
        circ.pulsePos += circ.speed * speedMult;
        if (circ.pulsePos > 1) circ.pulsePos = 0;

        const start = circlePoint(cx, cy, circ.length, circ.angle + taijiRotation);
        const end = circlePoint(cx, cy, circ.length * 0.15, circ.angle + taijiRotation);

        // 基础线
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.strokeStyle = "rgba(0, 229, 255, 0.06)";
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // 脉冲光点沿线移动
        const pulseX = start.x + (end.x - start.x) * circ.pulsePos;
        const pulseY = start.y + (end.y - start.y) * circ.pulsePos;
        ctx.beginPath();
        ctx.arc(pulseX, pulseY, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 229, 255, ${0.5 + circ.pulsePos * 0.5})`;
        ctx.fill();
      }

      // ========== Layer 3: 太极图核心图形 ==========
      drawTaijiCore(ctx, cx, cy, CFG.TJ_R, taijiRotation, tSec);

      // ========== Layer 4: 轨道粒子（太极外围光环） ==========
      for (const p of orbitP) {
        p.angle += p.speed * speedMult;
        const cosT = Math.cos(p.tilt);
        const sinT = Math.sin(p.tilt);
        const ox = Math.cos(p.angle) * p.rx;
        const oy = Math.sin(p.angle) * p.ry;
        const pos: Pt = {
          x: cx + ox * cosT - oy * sinT,
          y: cy + ox * sinT + oy * cosT,
        };

        // 拖尾
        p.trail.unshift({ x: pos.x, y: pos.y });
        if (p.trail.length > 7) p.trail.pop();

        for (let i = 0; i < p.trail.length - 1; i++) {
          const alpha = (1 - i / p.trail.length) * 0.35;
          ctx.beginPath();
          ctx.moveTo(p.trail[i].x, p.trail[i].y);
          ctx.lineTo(p.trail[i + 1].x, p.trail[i + 1].y);
          ctx.strokeStyle = p.color === "#00E5FF"
            ? `rgba(0, 229, 255, ${alpha})`
            : `rgba(123, 97, 255, ${alpha})`;
          ctx.lineWidth = p.size * (1 - i / p.trail.length) * 0.5;
          ctx.stroke();
        }

        // 发光头
        ctx.save();
        ctx.shadowBlur = 14;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();

        // 内核
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, p.size * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fill();
      }

      // ========== Layer 5: S形路径粒子（沿太极分割线流动） ==========
      for (const p of sPathP) {
        p.t += p.speed * speedMult * p.dir;
        if (p.t > 1) p.t -= 1;
        if (p.t < 0) p.t += 1;

        const lp = sPathPoint(CFG.TJ_R, p.t);
        const pos: Pt = {
          x: cx + lp.x * Math.cos(taijiRotation) - lp.y * Math.sin(taijiRotation),
          y: cy + lp.x * Math.sin(taijiRotation) + lp.y * Math.cos(taijiRotation),
        };

        // 沿路径向后采样拖尾
        const tailLen = 6;
        for (let ti = 0; ti < tailLen; ti++) {
          const backT = p.t - (ti * 0.015 * speedMult * p.dir);
          const bt = ((backT % 1) + 1) % 1;
          const blp = sPathPoint(CFG.TJ_R, bt);
          const bpos: Pt = {
            x: cx + blp.x * Math.cos(taijiRotation) - blp.y * Math.sin(taijiRotation),
            y: cy + blp.x * Math.sin(taijiRotation) + blp.y * Math.cos(taijiRotation),
          };

          if (ti > 0) {
            const prevT = p.t - ((ti - 1) * 0.015 * speedMult * p.dir);
            const pt = ((prevT % 1) + 1) % 1;
            const plp = sPathPoint(CFG.TJ_R, pt);
            const ppos: Pt = {
              x: cx + plp.x * Math.cos(taijiRotation) - plp.y * Math.sin(taijiRotation),
              y: cy + plp.x * Math.sin(taijiRotation) + plp.y * Math.cos(taijiRotation),
            };

            const alpha = (1 - ti / tailLen) * 0.5;
            ctx.beginPath();
            ctx.moveTo(ppos.x, ppos.y);
            ctx.lineTo(bpos.x, bpos.y);
            ctx.strokeStyle = p.color === "#00E5FF"
              ? `rgba(0, 229, 255, ${alpha})`
              : `rgba(249, 115, 22, ${alpha})`;
            ctx.lineWidth = p.size * (1 - ti / tailLen) * 0.6;
            ctx.stroke();
          }
        }

        // 头
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, p.size * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.fill();
      }

      // ========== Layer 6: 内部氛围粒子（太极区域内涌现飘散） ==========
      if (ambientP.length < CFG.AMBIENT_MAX && Math.random() < 0.06 * speedMult) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * CFG.TJ_R * 0.3;
        ambientP.push({
          x: cx + Math.cos(a) * r,
          y: cy + Math.sin(a) * r,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5 - 0.1,
          life: 1.0,
          maxLife: 1.5 + Math.random() * 2,
          color: Math.random() > 0.5 ? "#00E5FF" : "#F97316",
          size: 0.7 + Math.random() * 0.8,
        });
      }

      for (let i = ambientP.length - 1; i >= 0; i--) {
        const p = ambientP[i];
        p.x += p.vx * speedMult;
        p.y += p.vy * speedMult;
        p.life -= 1 / (p.maxLife * 60);
        const dC = dist({ x: p.x, y: p.y }, { x: cx, y: cy });

        if (p.life <= 0 || dC > CFG.TJ_R * 0.85) {
          ambientP.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color === "#00E5FF"
          ? `rgba(0, 229, 255, ${p.life * 0.5})`
          : `rgba(249, 115, 22, ${p.life * 0.5})`;
        ctx.fill();
      }

      // ========== Layer 7: 鼠标涟漪 ==========
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        const age = (Date.now() - r.born) / 1000;
        if (age > 1.2) { ripples.splice(i, 1); continue; }
        r.r = age * 100;
        r.alpha = 0.25 * (1 - age / 1.2);

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 229, 255, ${r.alpha})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        if (age < 0.8) {
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.r * 0.5, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(249, 115, 22, ${r.alpha * 0.5})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
    />
  );
}

// ============================================================================
// Hero 英雄区组件
// ============================================================================
export default function Hero() {
  const scrollToAbout = () => {
    const el = document.getElementById("about");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 0%, #0c1220 0%, #060a14 50%, #030508 100%)" }}
    >
      {/* 暗色背景下的全局环境光晕 */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(123,97,255,0.04) 0%, transparent 70%)" }}
      />

      {/* 太极粒子能量场动效 */}
      <TaijiEnergyField />

      {/* 内容层 - 暗色背景上使用浅色文字 */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-white/[0.03] mb-8 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs text-cyan-300/80 tracking-wider font-mono">XYTECH · 雄元科技</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
        >
          <span className="text-white">科技创新</span>
          <br />
          <span className="gradient-text-bright">引领未来</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="text-base md:text-lg text-white/55 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          雄元科技 — 雄元集团旗下科技创新平台，聚焦环保能源、AI智能体、生命科学与高新软硬科技，
          以创新驱动产业升级，为全球客户提供前沿科技解决方案。
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={scrollToAbout}
            className="px-8 py-3 bg-cyan-500 text-white font-semibold text-sm rounded-full hover:bg-cyan-400 transition-all duration-200 tracking-wider cursor-pointer shadow-lg shadow-cyan-500/25"
          >
            了解更多
          </button>
          <button
            onClick={() => {
              const el = document.getElementById("xyai");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-8 py-3 border border-white/20 text-white/80 font-medium text-sm rounded-full hover:bg-white/5 hover:text-white transition-all duration-200 tracking-wider cursor-pointer backdrop-blur-sm"
          >
            探索 XYAI 平台
          </button>
        </motion.div>
      </div>
    </section>
  );
}