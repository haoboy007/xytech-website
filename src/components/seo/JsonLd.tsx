import { useEffect } from 'react';

interface JsonLdProps {
  data: object;
  id?: string;
}

export default function JsonLd({ data, id }: JsonLdProps) {
  useEffect(() => {
    const scriptId = id || `jsonld-${Math.random().toString(36).slice(2)}`;
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = scriptId;
      document.head.appendChild(script);
    }

    script.textContent = JSON.stringify(data, null, 2);

    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [data, id]);

  return null;
}

// 预设结构化数据模板

export const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: '雄元科技',
  alternateName: 'XYTech',
  url: 'https://www.cnxy.tech',
  logo: 'https://www.cnxy.tech/logo.png',
  description: '雄元集团旗下科技创新平台，聚焦环保能源、AI智能体、生命科学与高新软硬科技',
  foundingDate: '2006',
  sameAs: ['https://github.com/haoboy007'],
  address: {
    '@type': 'PostalAddress',
    addressLocality: '北京',
    addressRegion: '北京市',
    addressCountry: 'CN',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: '商务咨询',
    email: 'hezuo@cnxy.tech',
    telephone: '+8618610316281',
  },
};

export const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: '雄元科技官网',
  url: 'https://www.cnxy.tech',
  description: '雄元集团旗下科技创新平台，聚焦环保能源、AI智能体、生命科学与高新软硬科技',
  inLanguage: 'zh-CN',
  publisher: {
    '@type': 'Organization',
    name: '北京雄元科技有限公司',
  },
};

export function breadcrumbLd(items: { name: string; item: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };
}

export function articleLd(params: {
  headline: string;
  description: string;
  image: string;
  author: string;
  datePublished: string;
  dateModified?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: params.headline,
    description: params.description,
    image: params.image,
    author: {
      '@type': 'Organization',
      name: params.author,
    },
    publisher: {
      '@type': 'Organization',
      name: '北京雄元科技有限公司',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.cnxy.tech/logo.png',
      },
    },
    datePublished: params.datePublished,
    dateModified: params.dateModified || params.datePublished,
  };
}

export function faqLd(questions: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };
}

export function productLd(params: {
  name: string;
  description: string;
  image: string;
  brand?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: params.name,
    description: params.description,
    image: params.image,
    brand: {
      '@type': 'Brand',
      name: params.brand || '雄元科技',
    },
    manufacturer: {
      '@type': 'Organization',
      name: '北京雄元科技有限公司',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '120',
    },
  };
}
