import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Partners from "@/components/Partners";
import Business from "@/components/Business";
import XYAIPlatform from "@/components/XYAIPlatform";
import ThinkTank from "@/components/ThinkTank";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

// 首页 - 雄元科技官网主页
export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground grid-bg">
      <Navbar scrolled={scrolled} />
      <main>
        <Hero />
        <About />
        <Partners />
        <Business />
        <XYAIPlatform />
        <ThinkTank />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
