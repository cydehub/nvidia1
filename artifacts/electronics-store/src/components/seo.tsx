import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
}

export function SEO({ title, description = "Cydestore - Trustworthy neighborhood electronics store with flagship-grade polish." }: SEOProps) {
  useEffect(() => {
    document.title = `${title} | Cydestore`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", description);
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = description;
      document.head.appendChild(meta);
    }
  }, [title, description]);

  return null;
}
