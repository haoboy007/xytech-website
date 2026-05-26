import { motion } from "motion/react";
import { useInView } from "@/hooks/use-in-view";

// 统计数据
const STATS = [
  { value: "80+", label: "技术研发团队", suffix: "人" },
  { value: "100+", label: "合作企业", suffix: "家" },
  { value: "4", label: "大业务领域", suffix: "" },
  { value: "3+", label: "省份办事处", suffix: "" },
  { value: "40%+", label: "运营成本降低", suffix: "", highlight: true },
  { value: "3×", label: "人效提升", suffix: "", highlight: true },
  { value: "6", label: "大行业AI方案", suffix: "", highlight: true },
];

// 发展历程时间轴
const TIMELINE = [
  { year: "2006", title: "MBA备考联盟成立", desc: "雄元科技发展历程的起点" },
  { year: "2015", title: "中国齐鲁创服集团成立", desc: "正式注册成立，开启创业征程" },
  { year: "2022", title: "更名为中国雄元集团有限公司", desc: "品牌升级，战略转型" },
  { year: "2023", title: "北京雄元科技有限公司成立", desc: "聚焦科技创新，布局AI与环保能源" },
];

// 动画配置
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

// 关于我们组件
export default function About() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="about" className="py-24 md:py-32 relative bg-white">
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
          <span className="text-xs text-primary/60 tracking-[0.3em] font-mono uppercase">About Us</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3">关于雄元科技</h2>
          <div className="w-16 h-px bg-primary/40 mx-auto mt-6" />
        </motion.div>

        {/* 企业介绍 */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeInUp}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto text-center mb-20"
        >
          <p className="text-foreground/60 leading-relaxed text-base md:text-lg">
            <span className="text-foreground font-medium">北京雄元科技有限公司</span>为中国雄元集团有限公司旗下科技创新平台，致力于AI+行业产业赋能。
            集团前身为中国齐鲁创服集团（2015年成立），2022年6月正式更名为中国雄元集团有限公司。
          </p>
        </motion.div>

        {/* 使命与愿景 */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeInUp}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid md:grid-cols-3 gap-6 mb-20"
        >
          <div className="p-6 border border-border/40 rounded-2xl bg-secondary/50 hover:border-primary/30 transition-colors">
            <h3 className="text-primary text-sm font-medium mb-3 tracking-wider">使命</h3>
            <p className="text-foreground/60 text-sm leading-relaxed">
              响应「青年强则国家强」号召，致力做全球青年四创四新综合服务平台；为地方提供绿色低碳循环高质量可持续发展综合解决方案；共建清洁美丽世界，促进人与自然和谐共生。
            </p>
          </div>
          <div className="p-6 border border-border/40 rounded-2xl bg-secondary/50 hover:border-primary/30 transition-colors">
            <h3 className="text-primary text-sm font-medium mb-3 tracking-wider">愿景</h3>
            <p className="text-foreground/60 text-sm leading-relaxed">
              「国之未来，雄元所向」—— 成为全球科技创新引领者，做用户心中最信赖的朋友。
            </p>
          </div>
          <div className="p-6 border border-border/40 rounded-2xl bg-secondary/50 hover:border-primary/30 transition-colors">
            <h3 className="text-primary text-sm font-medium mb-3 tracking-wider">核心理念</h3>
            <p className="text-foreground/60 text-sm leading-relaxed">
              「创新引领 稳健发展」/「稳中求进，行稳致远」
            </p>
          </div>
        </motion.div>

        {/* 发展历程时间轴 */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeInUp}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-20"
        >
          <h3 className="text-xl font-semibold text-foreground text-center mb-10">发展历程</h3>
          <div className="relative max-w-3xl mx-auto">
            {/* 中轴线 */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border/40 md:-translate-x-px" />

            {TIMELINE.map((item, i) => (
              <div
                key={item.year}
                className={`relative flex items-start mb-8 last:mb-0 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* 时间轴节点 */}
                <div className="absolute left-4 md:left-1/2 w-2.5 h-2.5 rounded-full bg-primary/60 border-2 border-white -translate-x-1/2 mt-1.5 z-10" />

                {/* 内容 */}
                <div className={`ml-12 md:ml-0 md:w-[calc(50%-2rem)] ${i % 2 === 0 ? "md:pr-8 md:text-right" : "md:pl-8"}`}>
                  <span className="text-primary font-mono text-sm font-bold">{item.year}</span>
                  <h4 className="text-foreground font-medium mt-1">{item.title}</h4>
                  <p className="text-foreground/50 text-sm mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 数字统计 */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeInUp}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h3 className="text-xl font-semibold text-foreground text-center mb-10">实力数据</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className={`text-center p-4 rounded-xl border transition-colors ${
                  stat.highlight
                    ? "border-primary/30 bg-primary/5"
                    : "border-border/30 bg-secondary/30"
                }`}
              >
                <div className={`text-2xl md:text-3xl font-bold font-mono ${stat.highlight ? "text-primary" : "text-foreground"}`}>
                  {stat.value}
                </div>
                <div className="text-xs text-foreground/50 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}