import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useInView } from "@/hooks/use-in-view";
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Shield,
  BookOpen,
  BadgeDollarSign,
  Globe,
  Building2,
  MapPin,
  Phone,
  Mail,
  Star,
  Rocket,
  Target,
  ChevronRight,
  Send,
  CheckCircle2,
  Menu,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/db/supabase";
import Footer from "@/components/Footer";
import SeoHelmet from "@/components/seo/SeoHelmet";
import JsonLd, { breadcrumbLd, faqLd } from "@/components/seo/JsonLd";

// 动画变体
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

// ─────────────────────────────────────────────────
// 顶部导航（合伙人页面专属，点击首页导航项回首页）
// ─────────────────────────────────────────────────
function PartnerNavbar({ scrolled }: { scrolled: boolean }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NAV_ITEMS = [
    { label: "首页", href: "/" },
    { label: "关于我们", href: "/#about" },
    { label: "业务领域", href: "/#business" },
    { label: "XYAI平台", href: "/#xyai" },
    { label: "智库平台", href: "/#thinktank" },
    { label: "联系我们", href: "/#contact" },
  ];

  const handleNav = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith("/#")) {
      const anchor = href.replace("/#", "");
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(anchor);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } else {
      navigate(href);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md border-b border-border/60 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <img src="/logo.png" alt="雄元科技" className="w-9 h-9 rounded-full object-cover shrink-0" />
          <div className="leading-none">
            <div className="text-foreground font-semibold text-sm tracking-wider">雄元科技</div>
            <div className="text-primary/60 text-[10px] tracking-widest font-mono">XYTECH</div>
          </div>
        </button>

        {/* 桌面端导航 */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.href}
              onClick={() => handleNav(item.href)}
              className="px-4 py-2 text-sm text-foreground/60 hover:text-primary transition-colors duration-200 tracking-wide cursor-pointer"
            >
              {item.label}
            </button>
          ))}
          {/* 当前页高亮 */}
          <span className="px-4 py-2 text-sm text-primary font-medium tracking-wide">
            合伙人招募
          </span>
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center">
          <a
            href="#apply"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-5 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 rounded-full font-medium tracking-wide cursor-pointer shadow-sm"
          >
            立即申请
          </a>
        </div>

        {/* 移动端汉堡 */}
        <button
          className="md:hidden text-foreground/60 hover:text-primary p-2 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="切换导航菜单"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* 移动端菜单 */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-border/60 shadow-lg">
          <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNav(item.href)}
                className="text-left px-4 py-3 text-sm text-foreground/60 hover:text-primary transition-colors border-b border-border/20 last:border-0 min-h-12 flex items-center cursor-pointer"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => {
                setMobileOpen(false);
                document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="mt-2 px-5 py-3 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-full font-medium tracking-wide cursor-pointer"
            >
              立即申请
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}

// ─────────────────────────────────────────────────
// Hero 区域
// ─────────────────────────────────────────────────
function PartnerHero() {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
      {/* 渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-purple-50/60" />
      {/* 装饰网格 */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* 装饰圆 */}
      <div className="absolute top-1/4 right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-[-10%] w-[400px] h-[400px] rounded-full bg-purple-300/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 text-center pt-16">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 border border-primary/20 text-primary text-xs font-medium tracking-widest mb-8"
        >
          <Star size={12} className="fill-primary" />
          诚邀各行业渠道合伙人
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance mb-6"
        >
          共拓
          <span className="relative inline-block mx-2">
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              AI 智能体
            </span>
          </span>
          蓝海市场
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-base md:text-xl text-foreground/55 leading-relaxed max-w-3xl mx-auto mb-12 text-pretty"
        >
          XYAI 是雄元集团旗下 AI 智能体 SaaS 平台，致力于为各行各业量身定制产业智能体。
          现诚邀各行业渠道合伙人，共享 AI 蓝海红利，携手开拓千亿级智能体市场。
        </motion.p>

        {/* 核心数据 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto mb-12"
        >
          {[
            { value: "6大", label: "行业解决方案" },
            { value: "40%+", label: "降低运营成本" },
            { value: "3×", label: "人效提升" },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white/70 backdrop-blur-sm border border-border/40 rounded-2xl p-4 md:p-6 shadow-sm"
            >
              <div className="text-2xl md:text-3xl font-bold text-primary mb-1">{item.value}</div>
              <div className="text-xs text-foreground/50 leading-tight">{item.label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex flex-col md:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={() => document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" })}
            className="px-8 py-4 bg-primary text-primary-foreground font-semibold text-sm rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 cursor-pointer flex items-center gap-2"
          >
            立即申请合伙人 <ChevronRight size={16} />
          </button>
          <button
            onClick={() => document.getElementById("benefits")?.scrollIntoView({ behavior: "smooth" })}
            className="px-8 py-4 bg-white border border-border/50 text-foreground/70 font-medium text-sm rounded-full hover:border-primary/30 hover:text-primary transition-all cursor-pointer"
          >
            了解权益详情
          </button>
        </motion.div>
      </div>

      {/* 向下指示 */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-foreground/30"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity }}
      >
        <div className="w-px h-8 bg-foreground/20" />
        <div className="w-1.5 h-1.5 rounded-full bg-foreground/20" />
      </motion.div>
    </section>
  );
}

// ─────────────────────────────────────────────────
// 市场机遇
// ─────────────────────────────────────────────────
function MarketSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const stats = [
    {
      icon: TrendingUp,
      value: "万亿",
      unit: "元",
      label: "2026年中国AI市场规模预测",
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      icon: Rocket,
      value: "300%",
      unit: "+",
      label: "AI智能体应用三年复合增长率",
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
    {
      icon: Building2,
      value: "4000",
      unit: "万+",
      label: "中国中小企业亟待AI赋能",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: Globe,
      value: "6大",
      unit: "",
      label: "行业场景深度覆盖",
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-white relative" id="market">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs text-primary/60 tracking-[0.3em] font-mono uppercase">Market Opportunity</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 text-balance">千亿蓝海，正当其时</h2>
          <p className="text-foreground/50 mt-4 max-w-2xl mx-auto text-pretty">
            AI 智能体正在重塑每一个行业，先行入局的合伙人将获得最大红利窗口
          </p>
          <div className="w-16 h-px bg-primary/40 mx-auto mt-6" />
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={fadeInUp}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white border border-border/40 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col"
            >
              <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center mb-4`}>
                <s.icon size={22} className={s.color} />
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className={`text-3xl font-bold ${s.color}`}>{s.value}</span>
                <span className="text-foreground/50 text-sm">{s.unit}</span>
              </div>
              <p className="text-sm text-foreground/50 mt-auto text-pretty">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* 产业背景描述 */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeIn}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="bg-gradient-to-br from-primary/5 to-purple-50/60 border border-primary/15 rounded-3xl p-8 md:p-12"
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4 text-balance">
                为什么现在是最佳入局时机？
              </h3>
              <div className="space-y-3">
                {[
                  "AI技术成本大幅下降，落地门槛已到行业级普惠阶段",
                  "中小企业数字化升级需求爆发，AI Agent市场渗透率尚低",
                  "XYAI已打磨成熟的行业交付能力，合伙人无需技术积累",
                  "早期合伙人将获得最优厚的区域/行业独家资源授权",
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground/65 text-pretty">{text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "智能制造", icon: "⚙️" },
                { label: "智慧零售", icon: "🛒" },
                { label: "智慧物流", icon: "🚚" },
                { label: "智能碳管", icon: "🌿" },
                { label: "智慧光伏", icon: "☀️" },
                { label: "智能售电", icon: "⚡" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-white/70 border border-border/30 rounded-xl p-3 flex items-center gap-2 text-sm text-foreground/70"
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────
// 合伙人权益
// ─────────────────────────────────────────────────
function BenefitsSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const benefits = [
    {
      icon: Shield,
      title: "产品支持",
      color: "text-blue-500",
      bg: "bg-blue-50",
      items: [
        "完整的 XYAI 产品使用授权",
        "定制化行业解决方案支持",
        "专属技术实施团队协助",
        "持续迭代的产品版本更新",
      ],
    },
    {
      icon: BookOpen,
      title: "培训赋能",
      color: "text-purple-500",
      bg: "bg-purple-50",
      items: [
        "系统性产品销售培训课程",
        "行业解决方案专项培训",
        "线上+线下双轨学习体系",
        "专属合伙人社群运营支持",
      ],
    },
    {
      icon: Target,
      title: "市场资源",
      color: "text-primary",
      bg: "bg-primary/10",
      items: [
        "区域 / 行业市场独家授权",
        "品牌联合营销推广资源",
        "官方认证合伙人资质背书",
        "展会与行业活动联合参展",
      ],
    },
    {
      icon: BadgeDollarSign,
      title: "收益分成",
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      items: [
        "行业领先的销售提成比例",
        "可续签的年度服务分成",
        "项目成功交付奖励机制",
        "阶梯式等级晋升收益提升",
      ],
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-secondary/20 relative" id="benefits">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs text-primary/60 tracking-[0.3em] font-mono uppercase">Partner Benefits</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 text-balance">合伙人核心权益</h2>
          <p className="text-foreground/50 mt-4 max-w-2xl mx-auto text-pretty">
            我们提供全方位的支持体系，助力合伙人快速拓展业务，实现可持续增长
          </p>
          <div className="w-16 h-px bg-primary/40 mx-auto mt-6" />
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={fadeInUp}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white border border-border/40 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 h-full flex flex-col"
            >
              <div className={`w-12 h-12 rounded-xl ${b.bg} flex items-center justify-center mb-5`}>
                <b.icon size={22} className={b.color} />
              </div>
              <h3 className="text-base font-bold text-foreground mb-4">{b.title}</h3>
              <ul className="space-y-2.5 flex-1">
                {b.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-foreground/55">
                    <span className={`mt-1 shrink-0 w-1.5 h-1.5 rounded-full ${b.bg} border border-current ${b.color}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────
// 合作模式
// ─────────────────────────────────────────────────
function CoopModesSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const modes = [
    {
      tier: "渠道代理",
      tag: "入门级",
      tagColor: "bg-border/60 text-foreground/60",
      icon: Users,
      color: "text-foreground/70",
      border: "border-border/40",
      highlight: false,
      desc: "适合个人从业者、销售精英，以轻资产方式切入AI赋能市场",
      requirements: "有销售经验或行业资源，具备客户拜访能力",
      perks: ["产品销售授权", "基础销售培训", "标准提成方案", "线上运营支持"],
    },
    {
      tier: "行业合伙人",
      tag: "推荐",
      tagColor: "bg-primary/15 text-primary",
      icon: Target,
      color: "text-primary",
      border: "border-primary/40",
      highlight: true,
      desc: "深耕特定行业的专业机构，与 XYAI 共同开发垂类行业智能体市场",
      requirements: "在特定行业拥有客户资源或渠道，具备行业Know-how",
      perks: ["行业市场优先资源", "联合方案设计权", "更高提成比例", "联合营销资源"],
    },
    {
      tier: "城市合伙人",
      tag: "战略级",
      tagColor: "bg-amber-50 text-amber-600",
      icon: MapPin,
      color: "text-amber-500",
      border: "border-amber-200",
      highlight: false,
      desc: "具备区域运营实力的机构，在指定城市独家代理 XYAI 全系列产品",
      requirements: "有成熟的本地商业团队，具备项目交付或服务能力",
      perks: ["区域市场独家授权", "联合品牌运营", "最高等级分成", "总部专属驻场支持"],
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-white relative" id="modes">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs text-primary/60 tracking-[0.3em] font-mono uppercase">Partnership Models</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 text-balance">三种合作模式</h2>
          <p className="text-foreground/50 mt-4 max-w-2xl mx-auto text-pretty">
            根据您的资源禀赋和发展诉求，选择最适合您的合作方式
          </p>
          <div className="w-16 h-px bg-primary/40 mx-auto mt-6" />
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {modes.map((m, i) => (
            <motion.div
              key={m.tier}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={fadeInUp}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className={`relative border-2 ${m.border} rounded-2xl p-6 md:p-8 ${m.highlight ? "bg-primary/[0.03] shadow-lg shadow-primary/10" : "bg-white"} h-full flex flex-col`}
            >
              {m.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">
                  最受欢迎
                </div>
              )}
              <div className="flex items-center justify-between mb-5">
                <div className={`w-11 h-11 rounded-xl ${m.highlight ? "bg-primary/10" : "bg-secondary"} flex items-center justify-center`}>
                  <m.icon size={20} className={m.color} />
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${m.tagColor}`}>
                  {m.tag}
                </span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{m.tier}</h3>
              <p className="text-sm text-foreground/55 mb-5 leading-relaxed text-pretty flex-1">{m.desc}</p>
              <div className="bg-secondary/50 rounded-xl p-4 mb-5 text-xs text-foreground/60 leading-relaxed">
                <span className="font-medium text-foreground/80">招募要求：</span>{m.requirements}
              </div>
              <ul className="space-y-2">
                {m.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-2 text-sm text-foreground/65">
                    <CheckCircle2 size={15} className={m.highlight ? "text-primary" : "text-foreground/40"} />
                    {perk}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────
// 招募要求
// ─────────────────────────────────────────────────
function RequirementsSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const items = [
    { emoji: "🤝", title: "认同XYAI价值观", desc: "认可 AI 赋能产业的理念，愿意与我们携手长期共建" },
    { emoji: "🌐", title: "具备行业/区域资源", desc: "在目标行业或区域内拥有客户资源、渠道关系或销售团队" },
    { emoji: "💡", title: "持续学习意愿", desc: "愿意系统学习 AI 产品知识，具备主动获客和售前能力" },
    { emoji: "📋", title: "合法经营主体", desc: "个人或机构均可，工商注册合规，具备签约和开票能力" },
  ];

  return (
    <section className="py-24 md:py-32 bg-secondary/20 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-xs text-primary/60 tracking-[0.3em] font-mono uppercase">Requirements</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 text-balance">我们在寻找谁？</h2>
          <div className="w-16 h-px bg-primary/40 mx-auto mt-6" />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={fadeInUp}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white border border-border/40 rounded-2xl p-6 flex items-start gap-4 shadow-sm h-full"
            >
              <div className="text-3xl shrink-0">{item.emoji}</div>
              <div>
                <h4 className="font-semibold text-foreground mb-1.5">{item.title}</h4>
                <p className="text-sm text-foreground/55 leading-relaxed text-pretty">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────
// 申请表单
// ─────────────────────────────────────────────────
function ApplySection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 });
  const [form, setForm] = useState({
    name: "",
    company: "",
    phone: "",
    city: "",
    intention: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.city.trim()) {
      toast.error("请填写姓名、电话和所在城市");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("partner_applications").insert({
        name: form.name.trim(),
        company: form.company.trim() || null,
        phone: form.phone.trim(),
        city: form.city.trim(),
        intention: form.intention.trim() || null,
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("申请已提交，我们会尽快与您联系！");
    } catch {
      toast.error("提交失败，请稍后重试或直接致电联系");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-24 md:py-32 bg-white relative" id="apply">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent pointer-events-none" />
      <div className="relative z-10 max-w-3xl mx-auto px-4 md:px-8">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-xs text-primary/60 tracking-[0.3em] font-mono uppercase">Apply Now</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 text-balance">立即申请合伙人</h2>
          <p className="text-foreground/50 mt-4 max-w-xl mx-auto text-pretty">
            填写以下信息，商务团队将在 1 个工作日内与您联系，详细介绍合作方案
          </p>
          <div className="w-16 h-px bg-primary/40 mx-auto mt-6" />
        </motion.div>

        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeInUp}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="bg-white border border-border/50 rounded-3xl p-6 md:p-10 shadow-md"
        >
          {submitted ? (
            <div className="text-center py-10 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 size={36} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">申请已成功提交！</h3>
              <p className="text-foreground/55 max-w-sm text-pretty">
                感谢您的关注，我们的商务团队将在 <strong>1 个工作日内</strong>与您联系，期待与您携手开拓 AI 蓝海市场。
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-2 text-sm text-primary underline underline-offset-2 cursor-pointer"
              >
                再次提交
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm text-foreground/60 mb-1.5 block">
                    姓名 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-secondary/40 border border-border/40 rounded-xl text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder:text-foreground/30"
                    placeholder="请输入您的姓名"
                  />
                </div>
                <div>
                  <label className="text-sm text-foreground/60 mb-1.5 block">公司 / 机构</label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
                    className="w-full px-4 py-3 bg-secondary/40 border border-border/40 rounded-xl text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder:text-foreground/30"
                    placeholder="公司或机构名称（可选）"
                  />
                </div>
                <div>
                  <label className="text-sm text-foreground/60 mb-1.5 block">
                    联系电话 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full px-4 py-3 bg-secondary/40 border border-border/40 rounded-xl text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder:text-foreground/30"
                    placeholder="请输入手机号"
                  />
                </div>
                <div>
                  <label className="text-sm text-foreground/60 mb-1.5 block">
                    所在城市 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                    className="w-full px-4 py-3 bg-secondary/40 border border-border/40 rounded-xl text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder:text-foreground/30"
                    placeholder="如：北京市、上海市"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-foreground/60 mb-1.5 block">合作意向 / 自我介绍</label>
                <textarea
                  value={form.intention}
                  onChange={(e) => setForm((p) => ({ ...p, intention: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 bg-secondary/40 border border-border/40 rounded-xl text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder:text-foreground/30 resize-none"
                  placeholder="请介绍您的行业背景、现有资源以及您希望的合作方向…"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-4 bg-primary text-primary-foreground font-semibold text-sm rounded-full hover:bg-primary/90 transition-all duration-200 tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-primary/20"
              >
                <Send size={16} />
                {submitting ? "提交中..." : "提交申请"}
              </button>
              <p className="text-center text-xs text-foreground/35">
                提交即代表您同意我们将对您的信息进行保密处理，仅用于商务沟通
              </p>
            </form>
          )}
        </motion.div>

        {/* 直接联系 */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeInUp}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 bg-secondary/30 border border-border/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-center gap-6 text-sm"
        >
          <p className="text-foreground/50 text-center md:text-left">也可直接联系商务团队</p>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <a
              href="tel:18301592576"
              className="flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors"
            >
              <Phone size={15} className="text-primary" /> 18301592576
            </a>
            <div className="hidden md:block w-px h-4 bg-border/40" />
            <a
              href="mailto:hezuo@cnxy.tech"
              className="flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors"
            >
              <Mail size={15} className="text-primary" /> hezuo@cnxy.tech
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────
// 合伙人招募页面主组件
// ─────────────────────────────────────────────────
export default function PartnerPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    // 进入页面滚到顶部
    window.scrollTo(0, 0);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 合伙人页面面包屑
  const partnerBreadcrumb = breadcrumbLd([
    { name: "首页", item: "https://www.cnxy.tech/" },
    { name: "合伙人招募", item: "https://www.cnxy.tech/partner" },
  ]);

  // 合伙人FAQ（GEO优化）
  const partnerFaq = faqLd([
    {
      question: "XYAI合伙人招募的合作模式有哪些？",
      answer: "XYAI提供三种合作模式：渠道合伙人（无需保证金，每单返佣，总部培训与营销支持）、城市合伙人（保证金2万元起，区域独家保护，年度返点+股权激励）、战略合伙人（深度合作，联合品牌运营，最高等级分成，总部专属驻场支持）。",
    },
    {
      question: "成为XYAI合伙人需要什么条件？",
      answer: "需要认同XYAI价值观、具备行业或区域资源、有持续学习AI产品知识的意愿、拥有合法经营主体（个人或机构均可）。工商注册合规，具备签约和开票能力。",
    },
    {
      question: "XYAI智能体平台覆盖哪些行业？",
      answer: "XYAI覆盖智能制造、智慧零售、智慧物流、智能碳排放管理、智慧光伏运维、智能售电及虚拟电厂六大行业场景，为各行各业量身定制产业智能体。",
    },
    {
      question: "如何申请成为XYAI合伙人？",
      answer: "您可以在合伙人招募页面填写申请表单，或拨打商务电话18301592576，也可以发送邮件至hezuo@cnxy.tech。商务团队将在1个工作日内与您联系。",
    },
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SeoHelmet
        title="合伙人招募 | 共拓AI智能体蓝海市场 — 雄元科技 XYAI"
        description="XYAI是雄元集团旗下AI智能体SaaS平台，诚邀各行业渠道合伙人，共享AI蓝海红利。提供渠道合伙人、城市合伙人、战略合伙人三种合作模式。"
        keywords="XYAI合伙人,AI智能体招商,渠道合伙人,城市合伙人,战略合伙人,AI代理招募,智能体合作,雄元科技招商"
        canonical="https://www.cnxy.tech/partner"
        ogTitle="合伙人招募 | 共拓AI智能体蓝海市场 — 雄元科技 XYAI"
        ogDescription="XYAI诚邀各行业渠道合伙人，共享AI蓝海红利。三种合作模式，全方位赋能支持。"
        ogUrl="https://www.cnxy.tech/partner"
      />
      <JsonLd data={partnerBreadcrumb} id="breadcrumb-ld" />
      <JsonLd data={partnerFaq} id="partner-faq-ld" />

      <PartnerNavbar scrolled={scrolled} />
      <main>
        <PartnerHero />
        <MarketSection />
        <BenefitsSection />
        <CoopModesSection />
        <RequirementsSection />
        <ApplySection />
      </main>
      <Footer />
    </div>
  );
}
