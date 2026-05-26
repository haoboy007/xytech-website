import { useState } from "react";
import { motion } from "motion/react";
import { useInView } from "@/hooks/use-in-view";
import { MapPin, Phone, Mail, Building2, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/db/supabase";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

// 联系我们组件
export default function Contact() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [form, setForm] = useState({ name: "", contact: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.contact.trim() || !form.message.trim()) {
      toast.error("请填写完整信息");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("messages").insert({
        name: form.name.trim(),
        contact: form.contact.trim(),
        content: form.message.trim(),
      });
      if (error) throw error;
      toast.success("留言已提交，我们会尽快与您联系");
      setForm({ name: "", contact: "", message: "" });
    } catch {
      toast.error("提交失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 md:py-32 relative bg-white">
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
          <span className="text-xs text-primary/60 tracking-[0.3em] font-mono uppercase">Contact Us</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3">联系我们</h2>
          <div className="w-16 h-px bg-primary/40 mx-auto mt-6" />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* 联系信息 */}
          <motion.div
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="text-xl font-semibold text-foreground mb-6">联系方式</h3>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-primary" />
                </div>
                <div>
                  <div className="text-foreground font-medium text-sm">公司地址</div>
                  <div className="text-foreground/50 text-sm mt-1">北京市西城区广义街4号华星大厦216室</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 size={18} className="text-primary" />
                </div>
                <div>
                  <div className="text-foreground font-medium text-sm">办事处</div>
                  <div className="text-foreground/50 text-sm mt-1">北京 · 济南 · 廊坊</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone size={18} className="text-primary" />
                </div>
                <div>
                  <div className="text-foreground font-medium text-sm">联系电话</div>
                  <div className="text-foreground/50 text-sm mt-1">18301592576</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail size={18} className="text-primary" />
                </div>
                <div>
                  <div className="text-foreground font-medium text-sm">商务邮箱</div>
                  <div className="text-foreground/50 text-sm mt-1">hezuo@cnxy.tech</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 留言表单 */}
          <motion.div
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold text-foreground mb-6">在线留言</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-foreground/60 mb-1.5 block">姓名</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-secondary/50 border border-border/40 rounded-xl text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder:text-foreground/30"
                  placeholder="请输入您的姓名"
                />
              </div>
              <div>
                <label className="text-sm text-foreground/60 mb-1.5 block">联系方式</label>
                <input
                  type="text"
                  value={form.contact}
                  onChange={(e) => setForm((p) => ({ ...p, contact: e.target.value }))}
                  className="w-full px-4 py-3 bg-secondary/50 border border-border/40 rounded-xl text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder:text-foreground/30"
                  placeholder="手机号或邮箱"
                />
              </div>
              <div>
                <label className="text-sm text-foreground/60 mb-1.5 block">留言内容</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 bg-secondary/50 border border-border/40 rounded-xl text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder:text-foreground/30 resize-none"
                  placeholder="请输入您的留言内容"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-3 bg-primary text-white font-semibold text-sm rounded-full hover:bg-primary/90 transition-all duration-200 tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-primary/20"
              >
                <Send size={16} />
                {submitting ? "提交中..." : "提交留言"}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}