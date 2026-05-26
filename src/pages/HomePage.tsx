import { useEffect, useState } from "react";
import About from "@/components/About";
import Business from "@/components/Business";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Partners from "@/components/Partners";
import JsonLd, { faqLd, organizationLd, websiteLd } from "@/components/seo/JsonLd";
import SeoHelmet from "@/components/seo/SeoHelmet";
import ThinkTank from "@/components/ThinkTank";
import XYAIPlatform from "@/components/XYAIPlatform";

// 首页FAQ结构化数据（GEO优化）
const homepageFaq = faqLd([
  {
    question: "雄元科技是做什么的？",
    answer: "雄元科技（XYTech）是雄元集团旗下科技创新平台，聚焦环保能源科技、AI人工智能应用（XYAI）、生命科学与高新软硬科技四大业务领域，为全球客户提供低碳智能解决方案。",
  },
  {
    question: "XYAI智能体平台有什么功能？",
    answer: "XYAI智能体平台采用认知层、执行层、决策层、进化层四层架构，提供智能制造、智慧零售、智慧物流、智能碳排放管理、智慧光伏运维、智能售电及虚拟电厂六大行业解决方案。",
  },
  {
    question: "雄元科技成立于哪一年？",
    answer: "雄元科技发展历程始于2006年MBA备考联盟成立，历经中国齐鲁创服集团（2015）、中国雄元集团有限公司（2022）等阶段，2023年正式成立北京雄元科技有限公司，聚焦科技创新。",
  },
  {
    question: "如何联系雄元科技合作？",
    answer: "您可以通过官网AI智能助手（右下角悬浮窗）进行实时咨询，或在联系页面填写表单，也可以拨打商务电话18610316281或发送邮件至hezuo@cnxy.tech。",
  },
]);

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
      <SeoHelmet
        title="雄元科技官网 | 环保能源 · AI智能体 · 生命科学 · 高新科技"
        description="雄元科技（XYTech）聚焦环保能源、AI智能体应用（XYAI）、生命科学与高新软硬科技，为全球客户提供低碳智能解决方案，与您共创未来。"
        keywords="雄元科技,XYTech,环保能源,AI智能体,XYAI,人工智能,生命科学,高新科技,低碳智能,数字化转型"
        canonical="https://www.cnxy.tech/"
        ogTitle="雄元科技 | 环保能源 · AI智能体 · 生命科学 · 高新科技"
        ogDescription="雄元科技（XYTech）聚焦环保能源、AI智能体应用（XYAI）、生命科学与高新软硬科技，为全球客户提供低碳智能解决方案。"
        ogUrl="https://www.cnxy.tech/"
      />
      <JsonLd data={organizationLd} id="org-ld" />
      <JsonLd data={websiteLd} id="site-ld" />
      <JsonLd data={homepageFaq} id="faq-ld" />

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
