// 页脚组件
import { useNavigate, useLocation } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  const navItems = [
    { label: "首页", href: "#hero" },
    { label: "关于我们", href: "#about" },
    { label: "合作伙伴", href: "#partners" },
    { label: "业务领域", href: "#business" },
    { label: "XYAI平台", href: "#xyai" },
    { label: "智库平台", href: "#thinktank" },
    { label: "联系我们", href: "#contact" },
  ];

  const scrollTo = (href: string) => {
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleNav = (href: string) => {
    if (!isHome) {
      navigate("/" + href);
      setTimeout(() => {
        const el = document.getElementById(href.replace("#", ""));
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } else {
      scrollTo(href);
    }
  };

  return (
    <footer className="border-t border-border/20 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Logo & 简介 */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <img
                src="/logo.png"
                alt="雄元科技"
                className="w-9 h-9 rounded-full object-cover shrink-0"
              />
              <div className="leading-none">
                <div className="text-foreground font-semibold text-sm tracking-wider">雄元科技</div>
                <div className="text-primary/60 text-[10px] tracking-widest font-mono">XYTECH</div>
              </div>
            </div>
            <p className="text-foreground/40 text-sm leading-relaxed">
              北京雄元科技有限公司 — 雄元集团旗下科技创新平台，聚焦环保能源、AI智能体、生命科学与高新软硬科技。
            </p>
          </div>

          {/* 导航链接 */}
          <div>
            <h4 className="text-foreground font-medium text-sm mb-4">快速导航</h4>
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNav(item.href)}
                  className="text-left text-sm text-foreground/50 hover:text-primary transition-colors cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => navigate("/partner")}
                className="text-left text-sm text-primary/70 hover:text-primary transition-colors cursor-pointer font-medium"
              >
                合伙人招募
              </button>
            </div>
          </div>

          {/* 联系方式 */}
          <div>
            <h4 className="text-foreground font-medium text-sm mb-4">联系方式</h4>
            <div className="space-y-2 text-sm text-foreground/50">
              <p>北京市西城区广义街4号华星大厦216室</p>
              <p>电话：18301592576</p>
              <p>邮箱：hezuo@cnxy.tech</p>
            </div>
          </div>
        </div>

        {/* 底部版权 */}
        <div className="mt-12 pt-6 border-t border-border/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-foreground/30">
            © 2023~2026 雄元科技 版权所有
          </p>
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-foreground/30 hover:text-foreground/50 transition-colors"
          >
            京ICP备2024080932号-3
          </a>
        </div>
      </div>
    </footer>
  );
}