import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
}

export function useSEO({ title, description, keywords, image }: SEOProps) {
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

    // 4. Update Canonical URL
    const canonicalUrl = `https://bcsithub.lovestoblog.com${window.location.pathname}`;
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    const originalCanonical = linkCanonical?.getAttribute("href") || "";
    if (!linkCanonical) {
      linkCanonical = document.createElement("link");
      linkCanonical.setAttribute("rel", "canonical");
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute("href", canonicalUrl);

    // 5. Update Open Graph & Twitter Social Metadata
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    const twitterImage = document.querySelector('meta[name="twitter:image"]');

    const originalOgTitle = ogTitle?.getAttribute("content") || "";
    const originalOgDesc = ogDesc?.getAttribute("content") || "";
    const originalOgUrl = ogUrl?.getAttribute("content") || "";
    const originalOgImage = ogImage?.getAttribute("content") || "";
    const originalTwitterTitle = twitterTitle?.getAttribute("content") || "";
    const originalTwitterDesc = twitterDesc?.getAttribute("content") || "";
    const originalTwitterImage = twitterImage?.getAttribute("content") || "";

    const previewImage = image || "https://bcsithub.lovestoblog.com/logo.png";

    if (ogTitle) ogTitle.setAttribute("content", `${title} | BCSITHub`);
    if (ogDesc) ogDesc.setAttribute("content", description);
    if (ogUrl) ogUrl.setAttribute("content", canonicalUrl);
    if (ogImage) ogImage.setAttribute("content", previewImage);
    if (twitterTitle) twitterTitle.setAttribute("content", `${title} | BCSITHub`);
    if (twitterDesc) twitterDesc.setAttribute("content", description);
    if (twitterImage) twitterImage.setAttribute("content", previewImage);

    // Cleanup to restore previous meta tags when component unmounts
    return () => {
      document.title = originalTitle;
      if (metaDesc) {
        metaDesc.setAttribute("content", originalDesc);
      }
      if (keywords && metaKeywords) {
        metaKeywords.setAttribute("content", originalKeywords);
      }
      if (linkCanonical) {
        if (originalCanonical) {
          linkCanonical.setAttribute("href", originalCanonical);
        } else {
          linkCanonical.remove();
        }
      }
      if (ogTitle && originalOgTitle) ogTitle.setAttribute("content", originalOgTitle);
      if (ogDesc && originalOgDesc) ogDesc.setAttribute("content", originalOgDesc);
      if (ogUrl && originalOgUrl) ogUrl.setAttribute("content", originalOgUrl);
      if (ogImage && originalOgImage) ogImage.setAttribute("content", originalOgImage);
      if (twitterTitle && originalTwitterTitle) twitterTitle.setAttribute("content", originalTwitterTitle);
      if (twitterDesc && originalTwitterDesc) twitterDesc.setAttribute("content", originalTwitterDesc);
      if (twitterImage && originalTwitterImage) twitterImage.setAttribute("content", originalTwitterImage);
    };
  }, [title, description, keywords, image]);
}
export default useSEO;
