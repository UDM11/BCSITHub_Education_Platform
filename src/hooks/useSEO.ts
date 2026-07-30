import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
}

export function useSEO({ title, description, keywords }: SEOProps) {
  useEffect(() => {
    // 1. Update Title
    const originalTitle = document.title;
    document.title = `${title} | BCSITHub`;

    // 2. Update Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    const originalDesc = metaDesc?.getAttribute("content") || "";
    if (metaDesc) {
      metaDesc.setAttribute("content", description);
    } else {
      const newMeta = document.createElement("meta");
      newMeta.name = "description";
      newMeta.content = description;
      document.head.appendChild(newMeta);
    }

    // 3. Update Meta Keywords if specified
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    const originalKeywords = metaKeywords?.getAttribute("content") || "";
    if (keywords) {
      if (metaKeywords) {
        metaKeywords.setAttribute("content", keywords);
      } else {
        const newMeta = document.createElement("meta");
        newMeta.name = "keywords";
        newMeta.content = keywords;
        document.head.appendChild(newMeta);
      }
    }

    // Cleanup to restore previous meta tags when component unmounts
    return () => {
      document.title = originalTitle;
      if (metaDesc) {
        metaDesc.setAttribute("content", originalDesc);
      }
      if (keywords && metaKeywords) {
        metaKeywords.setAttribute("content", originalKeywords);
      }
    };
  }, [title, description, keywords]);
}
export default useSEO;
