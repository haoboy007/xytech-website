import { motion } from "motion/react";
import { useInView } from "@/hooks/use-in-view";
import { Users, Lightbulb, Globe } from "lucide-react";

// 三大智库平台
const THINKTANKS = [
  {
    icon: Users,
    title: "雄企汇 / 雄企群英荟",
    features: ["私董会", "云访谈", "思享荟", "专题研讨会"],
    desc: "汇聚行业精英，打造高端企业家交流平台",
  },
  {
    icon: Lightbulb,
    title: "雄启汇 / 雄启汇科创智库 / 雄启汇商学院",
    features: ["产业研究", "科技孵化", "技术研发", "成果转化"],
    desc: "聚焦科技创新，推动产学研深度融合",
  },
  {
    icon: Globe,
    title: "雄起汇 / 云上万里行 / 雄起东方",
    features: ["产业集群创新", "补强补全产业链", "区域协同发展"],
    desc: "推动产业集群创新，构建区域协同发展新格局",
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

// 智库平台组件
export default function ThinkTank() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="thinktank" className="py-24 md:py-32 relative bg-secondary/30">
      <div className="absolute top-0 left-0 right-0 h-px bg-border/20" />

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs text-primary/60 tracking-[0.3em] font-mono uppercase">Think Tank</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3">智库平台</h2>
          <div className="w-16 h-px bg-primary/40 mx-auto mt-6" />
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {THINKTANKS.map((tank, index) => {
            const Icon = tank.icon;
            return (
              <motion.div
                key={tank.title}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="p-6 border border-border/40 rounded-2xl bg-white hover:border-primary/30 transition-colors h-full flex flex-col shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <Icon size={24} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{tank.title}</h3>
                <p className="text-sm text-foreground/50 mb-4">{tank.desc}</p>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {tank.features.map((f) => (
                    <span
                      key={f}
                      className="px-3 py-1 text-xs border border-border/30 rounded-lg text-foreground/60 bg-secondary/50"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}