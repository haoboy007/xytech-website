import { useEffect, useRef } from "react";
import { motion } from "motion/react";

// ============================================================================
// 波浪线光流动效（Wave Flow）
// 设计理念：简洁优雅的正弦波线条横向流动
// 风格定位：极简科技美学 —— 几条发光的波浪线营造深邃流动感
// ============================================================================

function WaveFlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: false });
    if (!ctx) return;

    let animId: number;
    let w = 0, h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: -9999, y: -9999 };

    // 颜色插值：baseColor → gold，t: 0~1
    const interpolateToGold = (baseColor: string, t: number): string => {
      // 解析 hex 颜色
      const r1 = parseInt(baseColor.slice(1, 3), 16);
      const g1 = parseInt(baseColor.slice(3, 5), 16);
      const b1 = parseInt(baseColor.slice(5, 7), 16);
      // 金色 #FFD700
      const r2 = 255, g2 = 215, b2 = 0;
      const r = Math.round(r1 + (r2 - r1) * t);
      const g = Math.round(g1 + (g2 - g1) * t);
      const b = Math.round(b1 + (b2 - b1) * t);
      return `rgb(${r}, ${g}, ${b})`;
    };

    // 波浪配置
    interface WaveLine {
      baseY: number;       // 基准Y位置
      amplitude: number;   // 振幅
      frequency: number;     // 频率
      speed: number;         // 流动速度
      phase: number;         // 相位偏移
      color: string;         // 线条颜色
      width: number;         // 线宽
      glow: number;          // 发光强度
      alpha: number;         // 基础透明度
    }

    const waves: WaveLine[] = [];

    const initWaves = () => {
      waves.length = 0;
      const count = 7;
      const colors = [
        "#00E5FF", // 青色
        "#22D3EE", // 浅青
        "#7DD3FC", // 冰蓝
        "#818CF8", // 靛蓝
        "#A78BFA", // 浅紫
        "#7B61FF", // 科技紫
        "#C084FC", // 淡紫
      ];
      const spacing = h / (count + 2);
      for (let i = 0; i < count; i++) {
        waves.push({
          baseY: spacing * (i + 1.5),
          amplitude: 25 + Math.random() * 35,
          frequency: 0.003 + Math.random() * 0.005,
          speed: 0.3 + Math.random() * 0.4,
          phase: Math.random() * Math.PI * 2,
          color: colors[i % colors.length],
          width: 1.2 + Math.random() * 0.8,
          glow: 8 + Math.random() * 12,
          alpha: 0.12 + Math.random() * 0.15,
        });
      }
    };

    // 背景粒子
    interface BgParticle {
      x: number; y: number;
      vx: number; vy: number;
      size: number; alpha: number;
      color: string;
    }
    const particles: BgParticle[] = [];

    const initParticles = () => {
      particles.length = 0;
      for (let i = 0; i < 40; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          size: 0.5 + Math.random() * 1.2,
          alpha: 0.15 + Math.random() * 0.25,
          color: Math.random() > 0.5 ? "#00E5FF" : "#7B61FF",
        });
      }
    };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initWaves();
      initParticles();
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("mousemove", onMouseMove);

    const draw = (time: number) => {
      const tSec = time * 0.001;
      ctx.clearRect(0, 0, w, h);

      // ========== Layer 0: 背景粒子 ==========
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        const isCyan = p.color === "#00E5FF";
        ctx.fillStyle = isCyan
          ? `rgba(0, 229, 255, ${p.alpha})`
          : `rgba(123, 97, 255, ${p.alpha})`;
        ctx.fill();
      }

      // ========== Layer 1: 波浪线 ==========
      const step = 2; // 采样步长（px），越小越平滑

      for (const wave of waves) {
        // 鼠标附近振幅增大
        let mouseAmpMult = 1;
        let highlight = 0; // 高亮强度 0~1
        const mouseDistY = Math.abs(mouse.y - wave.baseY);
        if (mouseDistY < 120 && mouse.x > 0) {
          const mouseDistX = Math.abs(mouse.x - w / 2);
          mouseAmpMult = 1 + (1 - mouseDistY / 120) * 0.6;
          // 高亮强度：距离越近越亮，使用平方曲线自然衰减
          highlight = (1 - mouseDistY / 120) ** 2;
        }

        const amp = wave.amplitude * mouseAmpMult;
        const activeAlpha = wave.alpha + highlight * 0.55;
        const activeGlow = wave.glow + highlight * 28;
        const activeWidth = wave.width + highlight * 1.8;
        const activeColor = interpolateToGold(wave.color, highlight);

        ctx.save();
        ctx.shadowBlur = activeGlow;
        ctx.shadowColor = activeColor;

        // 主波线
        ctx.beginPath();
        for (let x = 0; x <= w; x += step) {
          const y = wave.baseY + amp * Math.sin(x * wave.frequency + tSec * wave.speed + wave.phase);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = activeColor;
        ctx.globalAlpha = activeAlpha;
        ctx.lineWidth = activeWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();

        // 副波线（相位偏移，更细更淡，同样受高亮影响）
        ctx.beginPath();
        for (let x = 0; x <= w; x += step) {
          const y = wave.baseY + amp * 0.5 * Math.sin(x * wave.frequency * 1.3 + tSec * wave.speed * 0.8 + wave.phase + Math.PI / 3);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = activeColor;
        ctx.globalAlpha = activeAlpha * 0.5;
        ctx.lineWidth = activeWidth * 0.6;
        ctx.stroke();

        ctx.restore();
        ctx.globalAlpha = 1;
      }

      // ========== Layer 2: 光点（沿波浪线游走） ==========
      const dotCount = 12;
      for (let i = 0; i < dotCount; i++) {
        const waveIdx = i % waves.length;
        const wave = waves[waveIdx];
        const progress = (tSec * wave.speed * 0.5 + i / dotCount) % 1;
        const x = progress * w;
        const y = wave.baseY + wave.amplitude * Math.sin(x * wave.frequency + tSec * wave.speed + wave.phase);

        // 计算该波浪的高亮强度
        let dotHighlight = 0;
        const dotDistY = Math.abs(mouse.y - wave.baseY);
        if (dotDistY < 120 && mouse.x > 0) {
          dotHighlight = (1 - dotDistY / 120) ** 2;
        }
        const dotColor = interpolateToGold(wave.color, dotHighlight);

        const pulse = 0.5 + 0.5 * Math.sin(tSec * 2 + i);
        ctx.beginPath();
        ctx.arc(x, y, 2 + pulse, 0, Math.PI * 2);
        ctx.fillStyle = dotColor;
        ctx.globalAlpha = 0.4 * pulse;
        ctx.shadowBlur = 10;
        ctx.shadowColor = dotColor;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
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

      {/* 波浪线光流动效 */}
      <WaveFlow />

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