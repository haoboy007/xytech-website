import { useEffect } from 'react';

interface SeoHelmetProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: 'website' | 'article';
  canonical?: string;
  noindex?: boolean;
}

const DEFAULT_TITLE = '雄元科技官网 | 环保能源 · AI智能体 · 生命科学 · 高新科技';
const DEFAULT_DESCRIPTION = '雄元科技（XYTech）是雄元集团旗下科技创新平台，聚焦环保能源、AI智能体、生命科学与高新软硬科技，为全球客户提供低碳智能解决方案，与您共创未来。';
const DEFAULT_OG_IMAGE = 'https://www.cnxy.tech/og-image.png';
const DEFAULT_CANONICAL = 'https://www.cnxy.tech/';

export default function SeoHelmet({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  ogType = 'website',
  canonical,
  noindex = false,
}: SeoHelmetProps) {
  useEffect(() => {
    // Title
    document.title = title || DEFAULT_TITLE;

    // Meta description
    updateMeta('name', 'description', description || DEFAULT_DESCRIPTION);

    // Keywords
    if (keywords) {
      updateMeta('name', 'keywords', keywords);
    }

    // Robots
    updateMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

    // Canonical
    updateLink('canonical', canonical || DEFAULT_CANONICAL);

    // OG tags
    updateMeta('property', 'og:type', ogType);
    updateMeta('property', 'og:site_name', '雄元科技官网');
    updateMeta('property', 'og:url', ogUrl || DEFAULT_CANONICAL);
    updateMeta('property', 'og:title', ogTitle || title || DEFAULT_TITLE);
    updateMeta('property', 'og:description', ogDescription || description || DEFAULT_DESCRIPTION);
    updateMeta('property', 'og:image', ogImage || DEFAULT_OG_IMAGE);
    updateMeta('property', 'og:locale', 'zh_CN');

    // Twitter tags
    updateMeta('property', 'twitter:card', 'summary_large_image');
    updateMeta('property', 'twitter:url', ogUrl || DEFAULT_CANONICAL);
    updateMeta('property', 'twitter:title', ogTitle || title || DEFAULT_TITLE);
    updateMeta('property', 'twitter:description', ogDescription || description || DEFAULT_DESCRIPTION);
    updateMeta('property', 'twitter:image', ogImage || DEFAULT_OG_IMAGE);

    return () => {
      // 恢复默认SEO
      document.title = DEFAULT_TITLE;
      updateMeta('name', 'description', DEFAULT_DESCRIPTION);
      updateMeta('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
      updateLink('canonical', DEFAULT_CANONICAL);
    };
  }, [title, description, keywords, ogTitle, ogDescription, ogImage, ogUrl, ogType, canonical, noindex]);

  return null;
}

function updateMeta(attr: 'name' | 'property', key: string, value: string) {
  let meta = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attr, key);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', value);
}

function updateLink(rel: string, href: string) {
  let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', rel);
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}
