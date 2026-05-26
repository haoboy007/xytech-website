import { useEffect, useRef, useState } from "react";

interface UseInViewOptions {
  triggerOnce?: boolean;
  threshold?: number;
}

export function useInView(options: UseInViewOptions = {}) {
  const { triggerOnce = false, threshold = 0.1 } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setInView(false);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [triggerOnce, threshold]);

  return [ref, inView] as const;
}
