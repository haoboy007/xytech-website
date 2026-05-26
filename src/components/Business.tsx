import { useState } from "react";
import { motion } from "motion/react";
import { useInView } from "@/hooks/use-in-view";
import { ChevronDown, ChevronUp, Leaf, Brain, Dna, Cpu } from "lucide-react";

// 业务领域数据
const BUSINESSES = [
  {
    id: "energy",
    icon: Leaf,
    title: "环保能源科技",
    summary: "绿色低碳循环高质量可持续发展综合解决方案",
    details: [
      "绿色低碳循环高质量可持续发展综合解决方案",
      "软硬结合光伏支架系统",
      "可溯源原料收储运管理系统",
      "AI辅助售电决策系统",
      "成为地方政府绿色发展引擎",
    ],
  },
  {
    id: "ai",
    icon: Brain,
    title: "AI人工智能应用（XYAI）",
    summary: "AI+行业产业智能体SaaS平台，一站式AI赋能服务",
    details: [
      "核心定位：AI+行业产业智能体SaaS、AaaS平台，为中小企业和大型集团提供从诊断到落地的一站式AI赋能服务",
      "四层产品体系：认知层（行业知识图谱智能体）→ 执行层（业务流程自动化引擎）→ 决策层（智能决策辅助系统）→ 进化层（持续优化与自学习机制）",
      "6大行业方案：智能制造、智慧零售、智慧物流、智能碳排放管理、智慧光伏运维、智能售电及虚拟电厂",
      "AI智能体软硬件解决方案：AI智能政务服务、AI智能宠物、AI智能手伴",
      "AI编程开发产品：雄企群英荟、巾帼蜜友荟、我的疗愈坊、公众号文章转PDF等",
      "雄启识慧云上智库系统",
    ],
  },
  {
    id: "bio",
    icon: Dna,
    title: "生命科学",
    summary: "抗衰老机制研究及药物研发，现代生命科学和生物技术产业",
    details: [
      "抗衰老机制研究及药物研发",
      "现代生命科学和生物技术产业",
      "与高等院校科技园所深度合作",
    ],
  },
  {
    id: "tech",
    icon: Cpu,
    title: "高新软硬科技",
    summary: "探索太空智能及太空能源、算电协同，跟踪具身机器人、低空经济等前沿科技",
    details: [
      "探索太空智能及太空能源、算电协同",
      "跟踪具身机器人前沿技术",
      "低空经济领域布局",
      "其他高新软硬科技研发",
    ],
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

// 业务领域组件
export default function Business() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const toggleExpand = (id: string) => {
    setExpanded((prev) => (prev === id ? null : id));
  };

  return (
    <section id="business" className="py-24 md:py-32 relative bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs text-primary/60 tracking-[0.3em] font-mono uppercase">Business Areas</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3">业务领域</h2>
          <div className="w-16 h-px bg-primary/40 mx-auto mt-6" />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {BUSINESSES.map((biz, index) => {
            const Icon = biz.icon;
            const isExpanded = expanded === biz.id;

            return (
              <motion.div
                key={biz.id}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className={`border rounded-2xl transition-all duration-300 cursor-pointer bg-white shadow-sm ${
                  isExpanded
                    ? "border-primary/40 bg-primary/5"
                    : "border-border/40 hover:border-primary/20 hover:shadow-md"
                }`}
                onClick={() => toggleExpand(biz.id)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isExpanded ? "bg-primary/15" : "bg-secondary"
                      }`}>
                        <Icon size={20} className={isExpanded ? "text-primary" : "text-foreground/60"} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{biz.title}</h3>
                        <p className="text-sm text-foreground/50 mt-1">{biz.summary}</p>
                      </div>
                    </div>
                    <div className="shrink-0 ml-4 mt-1">
                      {isExpanded ? (
                        <ChevronUp size={18} className="text-primary" />
                      ) : (
                        <ChevronDown size={18} className="text-foreground/40" />
                      )}
                    </div>
                  </div>

                  {/* 展开详情 */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isExpanded ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="pt-4 border-t border-border/20">
                      <ul className="space-y-2">
                        {biz.details.map((detail, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-foreground/60">
                            <span className="w-1 h-1 rounded-full bg-primary/60 mt-2 shrink-0" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}