import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, UsersRound } from "lucide-react";

// 导航菜单项（含内部锚点和外部路由）
const NAV_ITEMS = [
  { label: "首页", href: "#hero" },
  { label: "关于我们", href: "#about" },
  { label: "合作伙伴", href: "#partners" },
  { label: "业务领域", href: "#business" },
  { label: "XYAI平台", href: "#xyai" },
  { label: "智库平台", href: "#thinktank" },
  { label: "联系我们", href: "#contact" },
];

interface NavbarProps {
  scrolled: boolean;
}

// 平滑滚动工具函数
function scrollTo(href: string) {
  const id = href.replace("#", "");
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
}

export default function Navbar({ scrolled }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  // 导航点击处理：首页锚点滚动，其他路由跳转
  const handleNav = (href: string) => {
    setMobileOpen(false);
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

  const handlePartner = () => {
    setMobileOpen(false);
    navigate("/partner");
  };

  // 根据滚动状态决定颜色模式
  // scrolled=false: 覆盖在暗色Hero上 → 白色文字
  // scrolled=true:  覆盖在亮色正文上 → 深色文字
  const isDark = !scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md border-b border-border/60 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => {
            if (!isHome) navigate("/");
            else scrollTo("#hero");
          }}
          className="flex items-center gap-2.5 group cursor-pointer shrink-0"
        >
          <img
            src="/logo.png"
            alt="雄元科技"
            className="w-9 h-9 rounded-full object-cover shrink-0"
          />
          <div className="leading-none">
            <div className={`font-semibold text-sm tracking-wider ${isDark ? "text-white" : "text-foreground"}`}>
              雄元科技
            </div>
            <div className={`text-[10px] tracking-widest font-mono ${isDark ? "text-white/50" : "text-primary/60"}`}>
              XYTECH
            </div>
          </div>
        </button>

        {/* 桌面端导航 */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.href}
              onClick={() => handleNav(item.href)}
              className={`px-4 py-2 text-sm transition-colors duration-200 tracking-wide cursor-pointer ${
                isDark
                  ? "text-white/60 hover:text-cyan-400"
                  : "text-foreground/60 hover:text-primary"
              }`}
            >
              {item.label}
            </button>
          ))}
          {/* 合伙人招募入口 */}
          <button
            onClick={handlePartner}
            className={`px-4 py-2 text-sm font-medium transition-colors duration-200 tracking-wide cursor-pointer flex items-center gap-1 ${
              isDark
                ? "text-cyan-400 hover:text-cyan-300"
                : "text-primary hover:text-primary/80"
            }`}
          >
            <UsersRound size={14} />
            合伙人招募
          </button>
        </nav>

        {/* CTA 按钮 */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => handleNav("#contact")}
            className={`px-5 py-2 text-sm transition-all duration-200 rounded-full font-medium tracking-wide cursor-pointer shadow-sm ${
              isDark
                ? "bg-cyan-500 text-white hover:bg-cyan-400 shadow-cyan-500/25"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            商务合作
          </button>
        </div>

        {/* 移动端汉堡菜单 */}
        <button
          className={`md:hidden p-2 transition-colors ${
            isDark ? "text-white/60 hover:text-cyan-400" : "text-foreground/60 hover:text-primary"
          }`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="切换导航菜单"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* 移动端下拉菜单 */}
      {mobileOpen && (
        <div className={`md:hidden backdrop-blur-md border-b shadow-lg ${
          isDark ? "bg-[#0c1220]/95 border-white/10" : "bg-white/95 border-border/60"
        }`}>
          <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNav(item.href)}
                className={`text-left px-4 py-3 text-sm transition-colors border-b last:border-0 min-h-12 flex items-center cursor-pointer ${
                  isDark
                    ? "text-white/60 hover:text-cyan-400 border-white/10"
                    : "text-foreground/60 hover:text-primary border-border/20"
                }`}
              >
                {item.label}
              </button>
            ))}
            {/* 移动端合伙人入口 */}
            <button
              onClick={handlePartner}
              className={`text-left px-4 py-3 text-sm font-medium transition-colors border-b min-h-12 flex items-center cursor-pointer ${
                isDark
                  ? "text-cyan-400 hover:text-cyan-300 border-white/10"
                  : "text-primary hover:text-primary/80 border-border/20"
              }`}
            >
              <UsersRound size={16} className="mr-2" />
              合伙人招募
            </button>
            <button
              onClick={() => handleNav("#contact")}
              className={`mt-2 px-5 py-3 text-sm transition-all rounded-full font-medium tracking-wide cursor-pointer ${
                isDark
                  ? "bg-cyan-500 text-white hover:bg-cyan-400"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              商务合作
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
