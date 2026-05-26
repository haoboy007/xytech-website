import { motion } from "motion/react";
import { useInView } from "@/hooks/use-in-view";
import { Handshake, ExternalLink } from "lucide-react";

// 合作伙伴数据（独立Logo + 官网链接）
const PARTNERS = [
  {
    name: "清华控股",
    logo: "/partners/qinghua-holdings.png",
    url: "https://www.tsinghua-holdings.com/",
    category: "产业集团",
  },
  {
    name: "中国三峡",
    logo: "/partners/sanxia.jpg",
    url: "https://www.ctg.com.cn/",
    category: "央企集团",
  },
  {
    name: "清华大学",
    logo: "/partners/tsinghua.png",
    url: "https://www.tsinghua.edu.cn/",
    category: "高校",
  },
  {
    name: "华北电力大学",
    logo: "/partners/ncepu.jpg",
    url: "https://www.ncepu.edu.cn/",
    category: "高校",
  },
  {
    name: "天襄资本",
    logo: "/partners/tianxiang.png",
    url: null,
    category: "投资机构",
  },
  {
    name: "弘控生态",
    logo: "/partners/hongkong.png",
    url: null,
    category: "科技平台",
  },
  {
    name: "雄企群英荟",
    logo: "/partners/xy-group.png",
    url: null,
    category: "企业家平台",
  },
  {
    name: "雄元集团",
    logo: "/partners/xy-group.png",
    url: "https://www.cnxiongyuan.com",
    category: "集团总部",
  },
  {
    name: "雄元众盈",
    logo: "/partners/zhongying.png",
    url: null,
    category: "信息服务平台",
  },
  {
    name: "雄元未来",
    logo: "/partners/xy-group.png",
    url: null,
    category: "产业布局",
  },
  {
    name: "PAG太盟投资",
    logo: "/partners/pag.jpg",
    url: "https://www.pag.com/",
    category: "投资机构",
  },
  {
    name: "旺赢咨询",
    logo: "/partners/wangying.png",
    url: null,
    category: "咨询服务",
  },
  {
    name: "诺安基金",
    logo: "/partners/noan.png",
    url: "https://www.lionfund.com.cn/",
    category: "金融机构",
  },
  {
    name: "TusStar启迪之星",
    logo: "/partners/tusstar.jpg",
    url: "https://www.tusstar.com/",
    category: "孵化平台",
  },
  {
    name: "雄元建筑科技",
    logo: "/partners/jianzhu.png",
    url: null,
    category: "建筑科技",
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

// 合作伙伴展示组件
export default function Partners() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="partners" className="py-20 md:py-28 relative bg-white">
      <div className="absolute top-0 left-0 right-0 h-px bg-border/20" />

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* 标题 */}
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-xs text-primary/60 tracking-[0.3em] font-mono uppercase">Partners</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3">合作伙伴</h2>
          <p className="text-foreground/50 mt-3 text-base max-w-xl mx-auto">
            携手行业领军企业、高校与科研机构，共同推动科技创新与产业升级
          </p>
          <div className="w-16 h-px bg-primary/40 mx-auto mt-6" />
        </motion.div>

        {/* 合作伙伴Logo网格 */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeInUp}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5"
        >
          {PARTNERS.map((partner, index) => {
            const isClickable = !!partner.url;
            const Wrapper = isClickable ? "a" : "div";
            const wrapperProps = isClickable
              ? {
                  href: partner.url!,
                  target: "_blank",
                  rel: "noopener noreferrer",
                }
              : {};

            return (
              <motion.div
                key={partner.name}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                variants={fadeInUp}
                transition={{ duration: 0.4, delay: 0.05 * index }}
              >
                <Wrapper
                  {...wrapperProps}
                  className={`group relative flex flex-col items-center p-4 md:p-5 rounded-2xl border border-border/30 bg-secondary/20 transition-all duration-300 h-full ${
                    isClickable
                      ? "hover:border-primary/40 hover:bg-primary/5 hover:shadow-lg hover:scale-[1.03] cursor-pointer"
                      : "opacity-80 cursor-default"
                  }`}
                >
                  {/* Logo图片 */}
                  <div className="w-full aspect-square max-w-[80px] md:max-w-[100px] flex items-center justify-center mb-3">
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>

                  {/* 名称 */}
                  <div className="text-center">
                    <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {partner.name}
                    </div>
                    <div className="text-[10px] text-foreground/40 mt-0.5">{partner.category}</div>
                  </div>

                  {/* 外链图标 */}
                  {isClickable && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink size={12} className="text-primary" />
                    </div>
                  )}
                </Wrapper>
              </motion.div>
            );
          })}
        </motion.div>

        {/* 合作理念 */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeInUp}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 text-center"
        >
          {[
            { num: "100+", label: "合作企业" },
            { num: "20+", label: "高校院所" },
            { num: "15+", label: "投资机构" },
            { num: "50+", label: "行业项目" },
          ].map((item) => (
            <div key={item.label} className="p-4 rounded-xl bg-secondary/30 border border-border/20">
              <div className="text-xl md:text-2xl font-bold text-primary font-mono">{item.num}</div>
              <div className="text-xs text-foreground/50 mt-1">{item.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
