import { motion } from "motion/react";
import { useInView } from "@/hooks/use-in-view";
import { Brain, Zap, Target, RefreshCw, Factory, ShoppingCart, Truck, Leaf, Sun, Battery } from "lucide-react";

// 四层架构
const LAYERS = [
  {
    icon: Brain,
    title: "认知层",
    subtitle: "行业知识图谱智能体",
    desc: "基于企业私有数据构建行业知识图谱，训练专属行业大模型，让智能体真正理解行业术语、业务规则与决策逻辑。",
  },
  {
    icon: Zap,
    title: "执行层",
    subtitle: "业务流程自动化引擎",
    desc: "将AI智能体嵌入企业既有业务流程，实现审批、排程、质检、对账等高频重复环节的自动化执行与异常处理。",
  },
  {
    icon: Target,
    title: "决策层",
    subtitle: "智能决策辅助系统",
    desc: "结合实时数据与历史经验，为企业管理层提供预测性分析、风险评估与决策建议，从经验驱动转向数据驱动。",
  },
  {
    icon: RefreshCw,
    title: "进化层",
    subtitle: "持续优化与自学习机制",
    desc: "智能体在真实业务中不断积累反馈，自动优化模型参数与决策策略，越用越聪明，持续创造增量价值。",
  },
];

// 六大行业方案
const INDUSTRIES = [
  {
    icon: Factory,
    title: "智能制造",
    features: ["智能排产优化", "质量缺陷自动检测", "设备预测性维护", "供应链动态协同"],
  },
  {
    icon: ShoppingCart,
    title: "智慧零售",
    features: ["智能选品与库存预测", "客户行为深度画像", "精准营销自动化", "门店运营智能分析"],
  },
  {
    icon: Truck,
    title: "智慧物流",
    features: ["运力智能调度", "路径动态优化", "仓储自动管理", "异常实时预警"],
  },
  {
    icon: Leaf,
    title: "智能碳排放管理",
    features: ["多源数据自动采集", "GHG标准智能核算", "减排路径优化", "ESG报告一键生成"],
  },
  {
    icon: Sun,
    title: "智慧光伏运维",
    features: ["实时监控电站运行", "智能预测设备故障", "优化发电效率", "自动调度运维工单"],
  },
  {
    icon: Battery,
    title: "智能售电及虚拟电厂",
    features: ["精准电力交易决策", "聚合分布式能源", "智能负荷调节", "收益最大化分析"],
  },
];

// 核心优势数据
const ADVANTAGES = [
  { value: "40%+", label: "平均运营成本降低" },
  { value: "3×", label: "人效提升幅度" },
  { value: "0", label: "需要自建AI技术团队" },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

// XYAI平台组件
export default function XYAIPlatform() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="xyai" className="py-24 md:py-32 relative bg-white">
      {/* 背景装饰 */}
      <div className="absolute top-0 left-0 right-0 h-px bg-border/20" />
      <div className="absolute top-1/3 right-0 w-72 h-72 bg-primary/5 rounded-full blur-[100px]" />

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* 标题 */}
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs text-primary/60 tracking-[0.3em] font-mono uppercase">XYAI Platform</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3">XYAI 智能体平台</h2>
          <p className="text-foreground/50 mt-4 max-w-2xl mx-auto text-base">
            雄元集团旗下雄元科技孵化的AI+行业产业智能体SaaS（Software-as-a-Service(软件即服务)）、AaaS（Agent-as-a-Service, AaaS（智能体即服务））平台，为中小企业和大型集团提供从诊断到落地的一站式AI赋能服务
          </p>
          <div className="w-16 h-px bg-primary/40 mx-auto mt-6" />
        </motion.div>

        {/* 核心优势 */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeInUp}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20"
        >
          {ADVANTAGES.map((adv) => (
            <div
              key={adv.label}
              className="text-center p-6 border border-primary/20 rounded-2xl bg-primary/5"
            >
              <div className="text-4xl md:text-5xl font-bold text-primary font-mono">{adv.value}</div>
              <div className="text-sm text-foreground/60 mt-2">{adv.label}</div>
            </div>
          ))}
        </motion.div>

        {/* 四层架构 */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeInUp}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-20"
        >
          <h3 className="text-xl font-semibold text-foreground text-center mb-10">四层架构，一个产业智能体</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {LAYERS.map((layer, i) => {
              const Icon = layer.icon;
              return (
                <div
                  key={layer.title}
                  className="p-5 border border-border/40 rounded-2xl bg-secondary/30 hover:border-primary/30 transition-colors group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon size={16} className="text-primary" />
                    </div>
                    <div>
                      <div className="text-xs text-primary/60 font-mono">Layer {i + 1}</div>
                      <div className="text-foreground font-medium text-sm">{layer.title}</div>
                    </div>
                  </div>
                  <h4 className="text-primary text-sm font-medium mb-2">{layer.subtitle}</h4>
                  <p className="text-foreground/50 text-xs leading-relaxed">{layer.desc}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* 六大行业方案 */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeInUp}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="text-xl font-semibold text-foreground text-center mb-10">六大行业方案</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {INDUSTRIES.map((ind) => {
              const Icon = ind.icon;
              return (
                <div
                  key={ind.title}
                  className="p-5 border border-border/40 rounded-2xl bg-secondary/30 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon size={18} className="text-primary" />
                    </div>
                    <h4 className="text-foreground font-medium">{ind.title}</h4>
                  </div>
                  <ul className="space-y-1.5">
                    {ind.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-foreground/50">
                        <span className="w-1 h-1 rounded-full bg-primary/40 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* 平台链接 */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeInUp}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <a
            href="https://ai.cnxy.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm rounded-full hover:bg-primary/90 transition-all font-medium tracking-wide shadow-lg shadow-primary/20"
          >
            访问 XYAI 平台 →
          </a>
        </motion.div>
      </div>
    </section>
  );
}