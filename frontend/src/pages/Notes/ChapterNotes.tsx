// src/pages/notes/ChapterNotes.tsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  BookOpen,
  Clock,
  Eye,
  Share2,
  Bookmark,
  Menu,
  X,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Printer,
  FileText,
  Star,
  Users,
  Calendar,
  Tag,
  Moon,
  Sun,
  Sliders,
  Check,
  Maximize2,
  Minimize2,
  ArrowUp,
  Book
} from "lucide-react";
import html2pdf from "html2pdf.js";
import { watermarkFile } from "../../lib/watermark";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import AuthRequiredModal from "../../components/common/AuthRequiredModal";
import { chapterData } from "../../data/chapterData";
import { toast } from "react-hot-toast";
import { useSEO } from "../../hooks/useSEO";
import { NOTES_VERSION, semestersData } from "../../data/notesData";

export default function ChapterNotes() {
  const { semesterId, subjectId, chapterId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // React states
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  
  // Custom reading preferences
  const [theme, setTheme] = useState<"light" | "sepia" | "dark">(
    (localStorage.getItem("notes-theme") as "light" | "sepia" | "dark") || "light"
  );
  const [fontFamily, setFontFamily] = useState<"sans" | "serif" | "mono">(
    (localStorage.getItem("notes-font") as "sans" | "serif" | "mono") || "sans"
  );
  const [fontSize, setFontSize] = useState<number>(
    parseInt(localStorage.getItem("notes-fontsize") || "16")
  );
  const [focusMode, setFocusMode] = useState<boolean>(false);
  
  // Table of Contents & Navigation
  const [headings, setHeadings] = useState<{ id: string; text: string }[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState<string>("");
  const [readingTime, setReadingTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Mobile navigation tab: "outline" | "toc" | "settings"
  const [mobileTab, setMobileTab] = useState<"outline" | "toc" | "settings">("outline");

  // Sync preferences to localStorage
  useEffect(() => {
    localStorage.setItem("notes-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("notes-font", fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    localStorage.setItem("notes-fontsize", fontSize.toString());
  }, [fontSize]);

  // Block scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = (showModal || sidebarOpen || tocOpen) ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal, sidebarOpen, tocOpen]);

  // Calculate reading time and progress
  useEffect(() => {
    if (htmlContent) {
      const text = htmlContent.replace(/<[^>]*>/g, "");
      const words = text.split(/\s+/).length;
      setReadingTime(Math.ceil(words / 200)); // 200 words per minute
    }
  }, [htmlContent]);

  // Bind try-in-sandbox redirection hook to window scope
  useEffect(() => {
    (window as any).handleTryInSandbox = (encodedCode: string, lang: string) => {
      try {
        const decoded = decodeURIComponent(escape(atob(encodedCode)));
        localStorage.setItem(
          "bcsithub_sandbox_preset",
          JSON.stringify({ language: lang, code: decoded })
        );
        navigate("/code-compiler");
      } catch (err) {
        console.error("Sandbox preset failed:", err);
      }
    };
    return () => {
      delete (window as any).handleTryInSandbox;
    };
  }, [navigate]);

  // Track scroll progress & back-to-top visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setProgress(Math.min(100, Math.max(0, scrollPercent)));
      setShowScrollTop(scrollTop > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Get subject chapters
  const subjectChapters = useMemo(() => {
    if (!subjectId) return null;
    return chapterData.find((s) => s.courseCode === decodeURIComponent(subjectId)) || null;
  }, [subjectId]);

  const chapters = subjectChapters?.chapters || [];
  const currentIndex = chapters.findIndex((c) => c.id === chapterId);
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  // Re-render MathJax when note content changes (for LaTeX formulas in STT 220 etc.)
  useEffect(() => {
    if (!htmlContent || !contentRef.current) return;
    const el = contentRef.current;
    const run = () => {
      if (
        typeof (window as unknown as {
          MathJax?: { typesetPromise?: (nodes?: unknown[]) => Promise<unknown> };
        }).MathJax?.typesetPromise === "function"
      ) {
        (window as unknown as {
          MathJax: { typesetPromise: (nodes: HTMLElement[]) => Promise<unknown> };
        }).MathJax.typesetPromise([el]).catch(() => {});
      }
    };
    const t = setTimeout(run, 100);
    return () => clearTimeout(t);
  }, [htmlContent]);

  // Clean-up and scope style blocks + extract headings
  const processHtmlContent = (rawHtml: string) => {
    if (!rawHtml) return { html: "", headings: [] };

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(rawHtml, "text/html");

      // Scope custom styles to avoid global leaks
      let scopedStyles = "";
      const styles = doc.querySelectorAll("style");
      styles.forEach((style) => {
        let cssText = style.textContent || "";

        // Scope body to .notes-reader-content container
        cssText = cssText.replace(/body\s*{([^}]*)}/g, ".notes-reader-content {$1}");

        // Scope common HTML tags
        const tags = ["h1", "h2", "h3", "h4", "table", "th", "td", "pre", "code", "ul", "ol", "li", "p"];
        tags.forEach((tag) => {
          const regex = new RegExp(`(^|[^a-zA-Z0-9_-])${tag}(\\s*,|\\s*{)`, "g");
          cssText = cssText.replace(regex, `$1.notes-reader-content ${tag}$2`);
        });

        scopedStyles += `<style>${cssText}</style>`;
        style.remove();
      });

      // Extract headings for Table of Contents & inject anchor IDs
      const headingList: { id: string; text: string }[] = [];
      const h2s = doc.querySelectorAll("h2");
      h2s.forEach((h2, idx) => {
        const id = `chapter-heading-${idx}`;
        h2.setAttribute("id", id);
        // Clean out raw numbers or dashes at the start for a cleaner TOC text
        const text = (h2.textContent || `Section ${idx + 1}`)
          .replace(/^\d+(\.\d+)*\s*/, "") // Remove section numbering if already present
          .trim();
        headingList.push({ id, text });
      });

      // Wrap tables for responsive horizontal scrolling
      const tables = doc.querySelectorAll("table");
      tables.forEach((table) => {
        const wrapper = doc.createElement("div");
        wrapper.className =
          "overflow-x-auto my-6 rounded-xl border border-slate-200/80 shadow-sm max-w-full";
        table.parentNode?.insertBefore(wrapper, table);
        wrapper.appendChild(table);
      });

      // Language detection based on course code or code class
      const detectLanguage = (course: string, clsName: string) => {
        const c = (course || "").toUpperCase();
        const cls = (clsName || "").toLowerCase();
        if (cls.includes("language-c") || cls.includes("lang-c")) return "c";
        if (cls.includes("language-cpp") || cls.includes("lang-cpp") || cls.includes("language-c++")) return "cpp";
        if (cls.includes("language-java") || cls.includes("lang-java")) return "java";
        if (cls.includes("language-python") || cls.includes("lang-python") || cls.includes("language-py")) return "python";
        if (cls.includes("language-javascript") || cls.includes("lang-javascript") || cls.includes("language-js")) return "javascript";
        if (cls.includes("language-html") || cls.includes("lang-html")) return "html";
        if (cls.includes("language-css") || cls.includes("lang-css")) return "html";
        if (cls.includes("language-sql") || cls.includes("lang-sql") || cls.includes("language-mysql")) return "mysql";
        
        if (c.includes("172")) return "c";
        if (c.includes("175")) return "java";
        if (c.includes("176")) return "cpp";
        if (c.includes("273")) return "javascript";
        if (c.includes("271")) return "mysql";
        if (c.includes("384")) return "cpp";
        if (c.includes("471")) return "python";
        if (c.includes("381")) return "c";
        return "c";
      };



      return {
        html: scopedStyles + doc.body.innerHTML,
        headings: headingList,
      };
    } catch (e) {
      console.error("HTML Note formatting error:", e);
      return { html: rawHtml, headings: [] };
    }
  };

  // Fetch HTML notes
  useEffect(() => {
    if (!semesterId || !subjectId || !chapterId) {
      setError("Missing URL parameters.");
      setLoading(false);
      return;
    }

    const encodedSemester = encodeURIComponent(`Semester ${semesterId}`);
    const encodedSubject = encodeURIComponent(decodeURIComponent(subjectId));
    const encodedChapter = encodeURIComponent(decodeURIComponent(chapterId));
    const filePath = `/notes/${encodedSemester}/${encodedSubject}/${encodedChapter}.html`;

    setLoading(true);
    setError(null);
    window.scrollTo(0, 0);

    const delay = new Promise((res) => setTimeout(res, 1200)); // Smooth transitions
    const notesCacheName = "bcsithub-notes-fallback-cache";

    const loadNoteContent = async () => {
      try {
        const res = await fetch(`${filePath}?v=${NOTES_VERSION}`);
        if (!res.ok) throw new Error("Note not found.");

        const text = await res.text();
        if (text.includes('id="root"') || text.includes("id='root'")) {
          throw new Error("Note not found.");
        }

        if ("caches" in window) {
          const cache = await caches.open(notesCacheName);
          await cache.put(
            filePath,
            new Response(text, {
              headers: { "Content-Type": "text/html" },
            })
          );
        }
        return text;
      } catch (err) {
        if ("caches" in window) {
          const cached =
            (await caches.match(filePath)) ||
            (await (await caches.open(notesCacheName)).match(filePath));
          if (cached) {
            const cachedText = await cached.text();
            if (!cachedText.includes('id="root"') && !cachedText.includes("id='root'")) {
              return cachedText;
            }
          }
        }
        throw err instanceof Error ? err : new Error("Note not found.");
      }
    };

    Promise.all([loadNoteContent(), delay])
      .then(([data]) => {
        const processed = processHtmlContent(data);
        setHtmlContent(processed.html);
        setHeadings(processed.headings);
      })
      .catch(() => setError("This chapter note does not exist or failed to load."))
      .finally(() => setLoading(false));
  }, [semesterId, subjectId, chapterId]);

  // Sync scroll spy for active heading in TOC
  useEffect(() => {
    if (headings.length === 0) return;

    const handleScrollSpy = () => {
      const scrollPosition = window.scrollY + 120; // offset header height

      let currentActive = headings[0].id;
      for (const heading of headings) {
        const element = document.getElementById(heading.id);
        if (element) {
          if (scrollPosition >= element.offsetTop) {
            currentActive = heading.id;
          } else {
            break;
          }
        }
      }
      setActiveHeadingId(currentActive);
    };

    window.addEventListener("scroll", handleScrollSpy);
    handleScrollSpy(); // Initial run

    return () => window.removeEventListener("scroll", handleScrollSpy);
  }, [headings, htmlContent]);

  // Find current active chapter details
  const currentChapter = useMemo(() => {
    return chapters.find((c) => c.id === chapterId);
  }, [chapters, chapterId]);

  // Lookup the actual course name from semestersData
  const subjectName = useMemo(() => {
    if (!subjectId) return "";
    const decoded = decodeURIComponent(subjectId);
    for (const sem of semestersData) {
      const found = sem.subjects.find((s) => s.courseCode === decoded);
      if (found) return found.courseName;
    }
    return "";
  }, [subjectId]);

  const seoTitle = useMemo(() => {
    if (currentChapter && subjectChapters) {
      return `${currentChapter.title} (${subjectChapters.courseCode || 'PU'}) - ${subjectName || subjectChapters.courseCode} | BCSIT Hub`;
    }
    return chapterId ? `${chapterId.toUpperCase()} Lecture Notes | BCSIT Hub` : "Chapter Notes | BCSIT Hub";
  }, [currentChapter, subjectChapters, chapterId, subjectName]);

  const seoDescription = useMemo(() => {
    if (currentChapter && subjectChapters) {
      return `Read online chapter lecture notes for "${currentChapter.title}" under ${subjectName || subjectChapters.courseCode} (${subjectChapters.courseCode || 'Core'}) of Pokhara University BCSIT.`;
    }
    return `Read the lecture notes, study references, and key guidelines for ${chapterId} under subject ${subjectId} of Pokhara University BCSIT.`;
  }, [currentChapter, subjectChapters, chapterId, subjectId, subjectName]);

  const seoKeywords = useMemo(() => {
    if (currentChapter && subjectChapters) {
      return `${currentChapter.title} notes, ${subjectName || subjectChapters.courseCode} chapters, download bcsit study guides, pu computer science`;
    }
    return `${chapterId} notes, ${subjectId} lecture notes, pu computer science`;
  }, [currentChapter, subjectChapters, chapterId, subjectId, subjectName]);

  useSEO({
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords,
    image: "https://bcsithub.lovestoblog.com/logo.png"
  });

  const downloadAsPDF = () => {
    if (!isAuthenticated) {
      setShowModal(true);
      return;
    }
    if (!htmlContent) return;

    setIsDownloading(true);
    toast.loading("Opening print dialog...", { id: "pdf-toast" });

    const rawFilename = `BCSIT ${semesterId}sem ${subjectId || ""} ${currentChapter ? currentChapter.title : chapterId}`;
    const cleanFilename = rawFilename
      .replace(/:/g, "")
      .replace(/[^a-zA-Z0-9\s-_]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    const noteTitle = currentChapter?.title || chapterId || "Note";
    const courseCode = subjectId ? decodeURIComponent(subjectId) : "";
    const semLabel = semesterId ? `Semester ${semesterId}` : "";
    const fullSubjectLabel = subjectName ? `${courseCode}: ${subjectName}` : courseCode;

    // Extract raw body content from the processedHtml (strip any remaining style tags)
    const bodyContent = htmlContent
      .replace(/<style[\s\S]*?<\/style>/gi, "") // strip scoped styles (we apply our own)
      .replace(/<script[\s\S]*?<\/script>/gi, "") // strip scripts
      .replace(/<h1[\s\S]*?<\/h1>/i, ""); // strip first h1 — we show the title in our own doc-title block

    const printHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${cleanFilename}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman&display=swap');

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.8;
      color: #000;
      background: #fff;
      padding: 1.2in 1.1in 1.2in 1.4in;
    }

    /* Header / Title block */
    .doc-title {
      text-align: center;
      margin-bottom: 6px;
      font-size: 15pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .doc-subtitle {
      text-align: center;
      font-size: 11pt;
      color: #444;
      margin-bottom: 28px;
      border-bottom: 1px solid #bbb;
      padding-bottom: 12px;
    }

    /* Headings */
    h1 {
      font-size: 15pt;
      font-weight: bold;
      text-align: center;
      text-transform: uppercase;
      margin: 30px 0 10px 0;
      color: #000;
    }

    h2 {
      font-size: 13pt;
      font-weight: bold;
      margin: 28px 0 10px 0;
      color: #000;
      border-bottom: 1px solid #ccc;
      padding-bottom: 4px;
    }

    h2::before { content: ""; }

    h3 {
      font-size: 12pt;
      font-weight: bold;
      margin: 18px 0 8px 0;
      color: #000;
    }

    h4 {
      font-size: 11.5pt;
      font-weight: bold;
      margin: 14px 0 6px 0;
      color: #000;
    }

    /* Paragraphs */
    p {
      font-size: 12pt;
      text-align: justify;
      margin: 0 0 12px 0;
      color: #000;
    }

    /* Lists */
    ul, ol {
      padding-left: 28px;
      margin: 10px 0 14px 0;
    }

    li {
      font-size: 12pt;
      text-align: justify;
      margin-bottom: 5px;
      color: #000;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 18px 0;
      font-size: 11pt;
    }

    th {
      background: #f0f0f0;
      font-weight: bold;
      border: 1px solid #888;
      padding: 8px 10px;
      text-align: left;
      color: #000;
    }

    td {
      border: 1px solid #aaa;
      padding: 7px 10px;
      color: #000;
    }

    /* Code blocks */
    pre, code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 10pt;
      background: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 10px 14px;
      margin: 12px 0;
      white-space: pre-wrap;
      word-break: break-all;
      color: #111;
    }

    code { padding: 2px 5px; font-size: 10.5pt; display: inline; }

    /* Note / callout boxes */
    .note-box, .note, .callout {
      background: #f9f9f9;
      border-left: 4px solid #555;
      padding: 12px 16px;
      margin: 16px 0;
      color: #000;
    }

    .section {
      background: transparent;
      padding: 0;
      margin-bottom: 22px;
      border: none;
      box-shadow: none;
    }

    /* Decorative elements from note templates */
    .card, .grid-2col {
      background: transparent;
      border: 1px solid #ccc;
      padding: 10px;
      margin: 6px 0;
      page-break-inside: avoid;
    }

    .grid-2col {
      display: block;
    }

    .badge {
      font-weight: bold;
      font-size: 10pt;
      border: 1px solid #777;
      border-radius: 3px;
      padding: 1px 6px;
      display: inline;
    }

    .subhead {
      text-align: center;
      font-style: italic;
      color: #444;
      margin: 0 0 18px 0;
      font-size: 11pt;
    }

    /* Watermark */
    @page {
      size: A4;
      margin: 0;
    }

    .watermark-overlay {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 72pt;
      font-weight: bold;
      color: rgba(0, 0, 0, 0.12); /* Darkened opacity from 0.045 to 0.12 */
      font-family: 'Times New Roman', serif;
      z-index: 0;
      pointer-events: none;
      user-select: none;
      white-space: nowrap;
    }

    /* Page numbers via CSS */
    @page {
      size: A4 portrait;
      margin: 1in 1in 1in 1.25in;
      @bottom-right {
        content: counter(page);
        font-family: 'Times New Roman', serif;
        font-size: 10pt;
      }
    }

    /* Print-specific */
    @media print {
      body {
        padding: 0;
      }

      .no-print { display: none !important; }

      h1, h2, h3, h4 { page-break-after: avoid; }
      table, pre, .card { page-break-inside: avoid; }

      a { color: #000; text-decoration: none; }
    }
  </style>
</head>
<body>
  <div class="watermark-overlay">BCSITHub</div>

  <div class="doc-title">${noteTitle}</div>
  <div class="doc-subtitle">${fullSubjectLabel}${semLabel ? ` &nbsp;·&nbsp; ${semLabel}` : ""} &nbsp;·&nbsp; BCSITHub</div>

  ${bodyContent}
</body>
</html>`;

    try {
      const printWindow = window.open("", "_blank", "width=900,height=700");
      if (!printWindow) {
        toast.error("Popup blocked. Please allow popups and try again.", { id: "pdf-toast" });
        setIsDownloading(false);
        return;
      }

      printWindow.document.open();
      printWindow.document.write(printHtml);
      printWindow.document.close();

      // Wait for resources to load before triggering print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.document.title = cleanFilename;
          printWindow.focus();
          printWindow.print();
          setIsDownloading(false);
          toast.success("Print dialog opened — save as PDF!", { id: "pdf-toast" });
        }, 600);
      };

      // Fallback in case onload doesn't fire
      setTimeout(() => {
        if (isDownloading) {
          printWindow.document.title = cleanFilename;
          printWindow.focus();
          printWindow.print();
          setIsDownloading(false);
          toast.success("Print dialog opened — save as PDF!", { id: "pdf-toast" });
        }
      }, 2000);

    } catch (err) {
      console.error("Print window failed:", err);
      setIsDownloading(false);
      toast.error("Failed to open print dialog.", { id: "pdf-toast" });
    }
  };

  const adjustFontSize = (increment: number) => {
    setFontSize((prev) => Math.max(12, Math.min(26, prev + increment)));
  };

  const toggleBookmark = () => {
    const newState = !isBookmarked;
    setIsBookmarked(newState);
    if (newState) {
      toast.success("Bookmark added!", { icon: "🔖" });
    } else {
      toast("Bookmark removed.");
    }
  };

  const shareContent = async () => {
    const getSemSuffix = (sem: string) => {
      if (sem === "1") return "1st";
      if (sem === "2") return "2nd";
      if (sem === "3") return "3rd";
      return `${sem}th`;
    };
    const shareTitle = `BCSIT ${getSemSuffix(semesterId || "")} Sem ${subjectId || ""} ${currentChapter ? currentChapter.title : chapterId} | BCSIT Hub`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!", { icon: "🔗" });
      } catch (err) {
        toast.error("Failed to copy link.");
      }
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getFontFamilyClass = () => {
    switch (fontFamily) {
      case "serif":
        return "font-serif";
      case "mono":
        return "font-mono";
      default:
        return "font-sans";
    }
  };

  // Helper theme classes
  const getThemeBgClass = () => {
    switch (theme) {
      case "sepia":
        return "bg-[#fbf6ec] text-[#433422]";
      case "dark":
        return "bg-slate-950 text-slate-100";
      default:
        return "bg-slate-50/70 text-slate-800";
    }
  };

  const getCardBgClass = () => {
    switch (theme) {
      case "sepia":
        return "bg-[#faf2e8] border-[#e6d3bf] text-[#433422]";
      case "dark":
        return "bg-slate-900 border-slate-800 text-slate-100";
      default:
        return "bg-white border-slate-200/60 text-slate-800 shadow-sm";
    }
  };

  const getSidebarBgClass = () => {
    switch (theme) {
      case "sepia":
        return "bg-[#f4e6d4] border-[#e6d3bf] text-[#433422]";
      case "dark":
        return "bg-slate-900 border-slate-800 text-slate-100";
      default:
        return "bg-white border-slate-200 text-slate-800";
    }
  };

  const getHeaderBgClass = () => {
    switch (theme) {
      case "sepia":
        return "bg-[#faf2e8]/90 border-[#e6d3bf]/50 text-[#433422]";
      case "dark":
        return "bg-slate-900/90 border-slate-800/80 text-slate-100";
      default:
        return "bg-white/90 border-gray-200/50 text-slate-800";
    }
  };

  // Immersive shimmering Skeleton Loader
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 pb-20">
        {/* Skeleton Top Bar */}
        <div className="h-16 border-b border-slate-200/60 bg-white flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-20 bg-slate-200 animate-pulse rounded-xl" />
          </div>
          <div className="h-6 w-36 sm:w-48 bg-slate-200 animate-pulse rounded" />
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 bg-slate-200 animate-pulse rounded-xl" />
            <div className="h-9 w-9 bg-slate-200 animate-pulse rounded-xl" />
            <div className="h-9 w-16 sm:w-20 bg-slate-200 animate-pulse rounded-xl" />
          </div>
        </div>

        <div className="w-full flex px-4 sm:px-6 lg:px-8 xl:px-10 mt-6 gap-6 lg:gap-8">
          {/* Skeleton Sidebar (Left) */}
          <aside className="w-80 bg-white border border-slate-100 rounded-2xl p-6 h-[calc(100vh-8rem)] sticky top-24 hidden lg:block space-y-6 flex-shrink-0">
            <div className="space-y-3">
              <div className="h-5 bg-slate-200 animate-pulse rounded w-1/3" />
              <div className="h-12 bg-slate-100 animate-pulse rounded-xl w-full" />
            </div>
            <div className="space-y-3">
              <div className="h-5 bg-slate-200 animate-pulse rounded w-1/2" />
              <div className="h-9 bg-slate-50 animate-pulse rounded-lg w-full" />
              <div className="h-9 bg-slate-50 animate-pulse rounded-lg w-full" />
              <div className="h-9 bg-slate-50 animate-pulse rounded-lg w-full" />
            </div>
          </aside>

          {/* Skeleton Document Area (Center) */}
          <main className="flex-1 max-w-4xl mx-auto space-y-6">
            <div className="h-4 bg-slate-200 animate-pulse rounded w-2/3" />
            
            <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-12 space-y-8 shadow-sm">
              <div className="space-y-3">
                <div className="h-8 bg-slate-200 animate-pulse rounded-lg w-3/4" />
                <div className="h-4 bg-slate-100 animate-pulse rounded w-1/4" />
              </div>

              <div className="space-y-3">
                <div className="h-4 bg-slate-200/80 animate-pulse rounded w-full" />
                <div className="h-4 bg-slate-200/80 animate-pulse rounded w-11/12" />
                <div className="h-4 bg-slate-200/80 animate-pulse rounded w-4/5" />
              </div>

              <div className="border border-slate-100 rounded-2xl p-6 bg-slate-50/50 space-y-4">
                <div className="h-6 bg-slate-200 animate-pulse rounded w-1/2" />
                <div className="space-y-3">
                  <div className="h-4 bg-slate-200/80 animate-pulse rounded w-full" />
                  <div className="h-4 bg-slate-200/80 animate-pulse rounded w-5/6" />
                  <div className="h-4 bg-slate-200/80 animate-pulse rounded w-4/5" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="h-4 bg-slate-200/80 animate-pulse rounded w-full" />
                <div className="h-4 bg-slate-200/80 animate-pulse rounded w-full" />
                <div className="h-4 bg-slate-200/80 animate-pulse rounded w-3/4" />
              </div>
            </div>
          </main>

          {/* Skeleton Outline (Right) */}
          <aside className="w-64 space-y-4 hidden xl:block sticky top-24 flex-shrink-0">
            <div className="h-5 bg-slate-200 animate-pulse rounded w-2/3" />
            <div className="space-y-3">
              <div className="h-4 bg-slate-100 animate-pulse rounded w-full" />
              <div className="h-4 bg-slate-100 animate-pulse rounded w-5/6" />
              <div className="h-4 bg-slate-100 animate-pulse rounded w-11/12" />
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${getThemeBgClass()}`}>
      
      {/* Scoped style injector to safely sand-box static HTML files' styles inside the reader */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Theme variables for injecting inside raw HTML contents */
        .notes-reader-content.theme-sepia {
          background-color: #faf2e8 !important;
          color: #433422 !important;
        }
        .notes-reader-content.theme-dark {
          background-color: #0f172a !important;
          color: #f1f5f9 !important;
        }

        .theme-sepia .section {
          background-color: #faf2e8 !important;
          color: #433422 !important;
          border-color: #e6d3bf !important;
          box-shadow: 0 4px 15px rgba(67, 52, 34, 0.05) !important;
        }
        .theme-sepia p, .theme-sepia li, .theme-sepia h1, .theme-sepia h2, .theme-sepia h3, .theme-sepia h4, .theme-sepia td, .theme-sepia th {
          color: #433422 !important;
        }
        .theme-sepia pre {
          background-color: #efe7d9 !important;
          color: #78350f !important;
        }
        .theme-sepia th {
          background-color: #e4d7c5 !important;
        }
        .theme-sepia td, .theme-sepia th {
          border-color: #e6d3bf !important;
        }
        .theme-sepia .note {
          background-color: #f5edd7 !important;
          border-left-color: #d97706 !important;
        }
        .theme-sepia .warning {
          background-color: #fdf2f2 !important;
          border-left-color: #ef4444 !important;
        }

        .theme-dark .section {
          background-color: #1e293b !important;
          color: #f1f5f9 !important;
          border-color: #334155 !important;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25) !important;
        }
        .theme-dark p, .theme-dark li, .theme-dark h1, .theme-dark h2, .theme-dark h3, .theme-dark h4, .theme-dark td, .theme-dark th {
          color: #f1f5f9 !important;
        }
        .theme-dark pre {
          background-color: #0f172a !important;
          color: #38bdf8 !important;
        }
        .theme-dark th {
          background-color: #334155 !important;
        }
        .theme-dark td, .theme-dark th {
          border-color: #334155 !important;
        }
        .theme-dark .note {
          background-color: #1e293b !important;
          border-left-color: #3b82f6 !important;
        }
        .theme-dark .warning {
          background-color: #1e293b !important;
          border-left-color: #eab308 !important;
        }

        /* Normalization & Responsiveness overrides for Semester 1 & 2 notes */
        .notes-reader-content {
          opacity: 1 !important;
          visibility: visible !important;
          display: block !important;
        }
        .notes-reader-content * {
          opacity: 1 !important;
          visibility: visible !important;
        }
        .notes-reader-content .container {
          max-width: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
          background: transparent !important;
          border-radius: 0 !important;
          box-shadow: none !important;
        }
        
        .notes-reader-content p {
          text-align: justify !important;
        }

        .notes-reader-content .section {
          padding: 25px !important;
          margin-bottom: 35px !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05) !important;
          text-align: justify !important;
        }

        .notes-reader-content .figure-box {
          max-width: 100% !important;
          overflow-x: auto !important;
          -webkit-overflow-scrolling: touch;
        }

        @media (max-width: 768px) {
          .notes-reader-content .section {
            padding: 18px !important;
            margin-bottom: 25px !important;
          }
          .notes-reader-content ul, .notes-reader-content ol {
            padding-left: 1.25rem !important;
          }
          .notes-reader-content ul ul, .notes-reader-content ol ol, .notes-reader-content ul ol, .notes-reader-content ol ul {
            padding-left: 1rem !important;
          }
        }

        @media (max-width: 480px) {
          .notes-reader-content .section {
            padding: 14px !important;
            margin-bottom: 20px !important;
          }
          .notes-reader-content h1 {
            font-size: 1.5rem !important;
          }
          .notes-reader-content h2 {
            font-size: 1.25rem !important;
          }
          .notes-reader-content ul, .notes-reader-content ol {
            padding-left: 1rem !important;
          }
          .notes-reader-content ul ul, .notes-reader-content ol ol, .notes-reader-content ul ol, .notes-reader-content ol ul {
            padding-left: 0.75rem !important;
          }
        }
      ` }} />

      {/* Top Floating Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 z-50"
        style={{ width: `${progress}%` }}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.1 }}
      />

      {/* Main Glassmorphic Navigation Header */}
      {!focusMode && (
        <motion.header
          className={`sticky top-0 z-40 backdrop-blur-md border-b shadow-sm transition-all duration-300 ${getHeaderBgClass()}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10">
            <div className="flex items-center justify-between h-16">
              {/* Back & Mobile Drawer Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/notes/semester/${semesterId}/subject/${subjectId}`)}
                  className="flex items-center gap-1.5 hover:bg-indigo-50/50 hover:text-indigo-600 rounded-xl px-3 py-2 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline font-bold text-xs">Back</span>
                </Button>

                {/* Left Drawer Menu Toggle (Mobile) */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSidebarOpen(true);
                    setMobileTab("outline");
                  }}
                  className="lg:hidden hover:bg-indigo-50/50 p-2 rounded-xl"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </div>

              {/* Title Header */}
              <div className="flex-1 text-center px-4 min-w-0">
                <h1 className="text-sm sm:text-base font-extrabold tracking-tight truncate max-w-lg mx-auto">
                  {currentChapter ? currentChapter.title : chapterId?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </h1>
                <p className="text-[10px] sm:text-xs font-semibold opacity-60 tracking-wider hidden md:block">
                  {decodeURIComponent(subjectId || "")} • Semester {semesterId}
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1.5">
                {/* Focus Mode button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFocusMode(true)}
                  className="hidden md:flex items-center gap-1.5 hover:bg-indigo-50/50 rounded-xl px-2.5 py-1.5"
                  title="Focus Mode"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleBookmark}
                  className={`hover:bg-indigo-50/50 p-2.5 rounded-xl ${isBookmarked ? "text-yellow-500" : "opacity-60"}`}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={shareContent}
                  className="hover:bg-indigo-50/50 p-2.5 rounded-xl opacity-60 flex"
                  title="Share Note"
                >
                  <Share2 className="w-4 h-4" />
                </Button>

                {/* Download PDF */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadAsPDF}
                  disabled={isDownloading}
                  className="flex items-center gap-2 hover:bg-gradient-primary hover:text-white border-slate-200 shadow-sm rounded-xl px-3.5"
                  title="Download PDF"
                >
                  {isDownloading ? (
                    <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline font-bold text-xs">PDF</span>
                </Button>
              </div>
            </div>
          </div>
        </motion.header>
      )}

      {/* Immersive Reading Workspace */}
      <div className="w-full flex px-4 sm:px-6 lg:px-8 xl:px-10 py-6 gap-6 lg:gap-8">
        
        {/* LEFT SIDEBAR (Desktop: persistent outline & preferences) */}
        {!focusMode && (
          <aside className="w-80 h-[calc(100vh-7rem)] sticky top-24 hidden lg:block overflow-y-auto pr-2 flex-shrink-0 space-y-6">
            
            {/* Preferences widget */}
            <div className={`p-5 rounded-2xl border transition-all duration-300 ${getCardBgClass()}`}>
              <h3 className="text-xs font-extrabold uppercase tracking-wider opacity-60 mb-4 flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                Reading Settings
              </h3>

              {/* Theme Settings */}
              <div className="space-y-3.5">
                <div>
                  <span className="text-xs font-bold opacity-75">Theme</span>
                  <div className="grid grid-cols-3 gap-2 mt-2 bg-slate-100/50 dark:bg-slate-950/40 rounded-xl p-1 border dark:border-slate-800">
                    {(["light", "sepia", "dark"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                          theme === t
                            ? "bg-white dark:bg-slate-800 text-indigo-650 dark:text-white shadow-sm border border-slate-200/50 dark:border-slate-700"
                            : "opacity-60 hover:opacity-100"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Typography font style */}
                <div>
                  <span className="text-xs font-bold opacity-75">Font Family</span>
                  <div className="grid grid-cols-3 gap-2 mt-2 bg-slate-100/50 dark:bg-slate-950/40 rounded-xl p-1 border dark:border-slate-800">
                    {(["sans", "serif", "mono"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFontFamily(f)}
                        className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                          fontFamily === f
                            ? "bg-white dark:bg-slate-800 text-indigo-650 dark:text-white shadow-sm border border-slate-200/50 dark:border-slate-700"
                            : "opacity-60 hover:opacity-100"
                        }`}
                      >
                        {f === "sans" ? "Sans" : f === "serif" ? "Serif" : "Mono"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size controls */}
                <div className="flex items-center justify-between pt-1 border-t dark:border-slate-800">
                  <span className="text-xs font-bold opacity-75">Font Size</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => adjustFontSize(-2)}
                      className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </Button>
                    <span className="text-xs font-extrabold w-8 text-center">{fontSize}px</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => adjustFontSize(2)}
                      className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Chapters list playlist */}
            <div className={`p-5 rounded-2xl border transition-all duration-300 ${getCardBgClass()}`}>
              <h3 className="text-xs font-extrabold uppercase tracking-wider opacity-60 mb-4 flex items-center gap-2">
                <Book className="w-4 h-4" />
                Chapters Playlist
              </h3>
              
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                {chapters.map((ch, idx) => {
                  const isActive = ch.id === chapterId;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => {
                        if (!isActive) {
                          navigate(`/notes/semester/${semesterId}/subject/${subjectId}/chapter/${ch.id}`);
                        }
                      }}
                      className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-l-4 border-l-indigo-600 text-indigo-650 dark:text-indigo-400"
                          : "hover:bg-slate-100/50 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <span className="opacity-50 mt-0.5">{idx + 1}.</span>
                      <span className="line-clamp-2">{ch.title.replace(/^Unit \d+:\s*/i, "")}</span>
                      {isActive && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 ml-auto flex-shrink-0 self-center" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        )}

        {/* MAIN DOCUMENT VIEW SHEET */}
        <main className="flex-1 max-w-4xl mx-auto min-w-0">
          
          {/* Focus Mode exit banner */}
          {focusMode && (
            <motion.div
              className="sticky top-4 z-40 flex justify-between items-center gap-4 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-800 p-2.5 mb-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <span className="text-xs font-extrabold tracking-wide flex items-center gap-2 pl-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                Focus Mode Active
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadAsPDF}
                  className="bg-slate-800 hover:bg-indigo-650 hover:text-white border-0 text-white font-bold text-xs rounded-lg h-8"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" /> PDF
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFocusMode(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg h-8 px-3"
                >
                  <Minimize2 className="w-3.5 h-3.5 mr-1.5" /> Exit
                </Button>
              </div>
            </motion.div>
          )}

          {/* Breadcrumbs (non-focus mode) */}
          {!focusMode && (
            <motion.div
              className="flex items-center gap-2 text-xs font-semibold opacity-60 mb-5 overflow-x-auto pb-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="whitespace-nowrap hover:text-indigo-600 cursor-pointer" onClick={() => navigate("/notes")}>
                Notes
              </span>
              <ChevronRight className="w-3 h-3 flex-shrink-0" />
              <span className="whitespace-nowrap hover:text-indigo-600 cursor-pointer" onClick={() => navigate(`/notes/semester/${semesterId}`)}>
                Semester {semesterId}
              </span>
              <ChevronRight className="w-3 h-3 flex-shrink-0" />
              <span className="truncate hover:text-indigo-600 cursor-pointer" onClick={() => navigate(`/notes/semester/${semesterId}/subject/${subjectId}`)}>
                {decodeURIComponent(subjectId || "")}
              </span>
              <ChevronRight className="w-3 h-3 flex-shrink-0" />
              <span className="text-indigo-600 dark:text-indigo-400 font-bold whitespace-nowrap">
                {chapterId}
              </span>
            </motion.div>
          )}



          {/* Render the document with Framer Motion slide-in animations */}
          <AnimatePresence mode="wait">
            <motion.article
              key={chapterId}
              ref={contentRef}
              className={`prose prose-slate max-w-none rounded-3xl border p-6 sm:p-12 xl:p-14 overflow-x-auto transition-all duration-300 shadow-sm notes-reader-content ${getFontFamilyClass()} ${
                theme === "sepia"
                  ? "bg-[#faf2e8] border-[#e6d3bf] theme-sepia"
                  : theme === "dark"
                  ? "bg-slate-900 border-slate-800 theme-dark"
                  : "bg-white border-slate-200/60"
              }`}
              style={{ fontSize: `${fontSize}px`, lineHeight: "1.75" }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.35 }}
            >
              {error ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-600">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Content Not Available</h3>
                  <p className="opacity-75 text-xs mb-6 max-w-xs mx-auto">{error}</p>
                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="hover:bg-indigo-50 hover:text-indigo-700 font-bold border-slate-200 shadow-sm rounded-xl px-5"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Retry Load
                  </Button>
                </div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
              )}
            </motion.article>
          </AnimatePresence>

          {/* Navigation Footer */}
          <motion.div
            className={`mt-8 p-5 sm:p-6 rounded-3xl border flex flex-col gap-5 transition-all duration-300 ${getCardBgClass()}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* Progress indicator */}
            <div className="text-center">
              <span className="text-xs font-bold opacity-60 uppercase tracking-wider">
                Unit {currentIndex + 1} of {chapters.length} Completed
              </span>
              <div className="w-full bg-slate-100 dark:bg-slate-950/60 border dark:border-slate-800 rounded-full h-2 mt-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((currentIndex + 1) / chapters.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center gap-3">
              {prevChapter ? (
                <Button
                  variant="outline"
                  onClick={() =>
                    navigate(`/notes/semester/${semesterId}/subject/${subjectId}/chapter/${prevChapter.id}`)
                  }
                  className="flex items-center gap-2.5 hover:bg-indigo-50/50 hover:text-indigo-600 border-slate-200 rounded-2xl flex-1 sm:flex-none py-4 text-left h-auto min-w-0"
                >
                  <ChevronLeft className="w-5 h-5 flex-shrink-0 text-slate-400" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold opacity-50 uppercase tracking-wider">Previous</p>
                    <p className="font-extrabold text-xs sm:text-sm truncate">{prevChapter.title.replace(/^Unit \d+:\s*/i, "")}</p>
                  </div>
                </Button>
              ) : (
                <div className="flex-1 sm:flex-none" />
              )}

              {nextChapter ? (
                <Button
                  variant="outline"
                  onClick={() =>
                    navigate(`/notes/semester/${semesterId}/subject/${subjectId}/chapter/${nextChapter.id}`)
                  }
                  className="flex items-center gap-2.5 hover:bg-indigo-50/50 hover:text-indigo-600 border-slate-200 rounded-2xl flex-1 sm:flex-none py-4 text-right h-auto min-w-0"
                >
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold opacity-50 uppercase tracking-wider">Next</p>
                    <p className="font-extrabold text-xs sm:text-sm truncate">{nextChapter.title.replace(/^Unit \d+:\s*/i, "")}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 flex-shrink-0 text-slate-400" />
                </Button>
              ) : (
                <div className="flex-1 sm:flex-none" />
              )}
            </div>
          </motion.div>
        </main>

        {/* RIGHT SIDEBAR (Desktop: dynamic scrollspy Table of Contents) */}
        {!focusMode && headings.length > 0 && (
          <aside className="w-64 h-[calc(100vh-7rem)] sticky top-24 hidden xl:block overflow-y-auto pr-1 flex-shrink-0">
            <h3 className="text-xs font-extrabold uppercase tracking-wider opacity-60 mb-4 flex items-center gap-2 pl-2">
              <Sliders className="w-4 h-4" />
              Table of Contents
            </h3>
            <div className="space-y-1 border-l-2 border-slate-100 dark:border-slate-800 ml-2.5">
              {headings.map((h) => {
                const isActive = h.id === activeHeadingId;
                return (
                  <button
                    key={h.id}
                    onClick={() => {
                      document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className={`w-full text-left py-2 pl-4 text-xs font-semibold border-l-2 -ml-[2px] transition-all line-clamp-2 ${
                      isActive
                        ? "border-l-indigo-600 text-indigo-650 dark:text-indigo-400 font-extrabold"
                        : "border-l-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    {h.text}
                  </button>
                );
              })}
            </div>
          </aside>
        )}
      </div>

      {/* FLOAT ACTIONS (Back to top, Focus Mode exit triggers) */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.div
            className="fixed bottom-6 right-6 z-40 flex flex-col gap-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            {focusMode && (
              <Button
                onClick={() => setFocusMode(false)}
                className="h-11 w-11 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-xl flex items-center justify-center p-0 border border-slate-800"
                title="Exit Focus Mode"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
            )}
            
            <Button
              onClick={scrollToTop}
              className="h-11 w-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-xl flex items-center justify-center p-0"
              title="Scroll to Top"
            >
              <ArrowUp className="w-5 h-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE COMBINED DRAWER (Outline + TOC + Settings) */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />

            {/* Slide-out Drawer Panel */}
            <motion.aside
              className={`fixed top-0 left-0 h-full w-[85vw] max-w-[360px] z-50 lg:hidden shadow-2xl flex flex-col transition-all duration-300 ${getSidebarBgClass()}`}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
            >
              {/* Drawer header */}
              <div className="p-4 border-b dark:border-slate-800 flex items-center justify-between">
                <span className="font-extrabold text-sm tracking-tight">Study Tools Menu</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Navigation Pill Tabs inside Mobile Drawer */}
              <div className="flex border-b dark:border-slate-800 p-2 gap-1.5 bg-slate-50/40 dark:bg-slate-950/20">
                {[
                  { id: "outline", label: "Playlist" },
                  { id: "toc", label: "Chapters" },
                  { id: "settings", label: "Settings" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setMobileTab(t.id as any)}
                    className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${
                      mobileTab === t.id
                        ? "bg-white dark:bg-slate-800 text-indigo-650 dark:text-white shadow-sm border border-slate-200/50 dark:border-slate-700"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Drawer Content Body based on Active Tab */}
              <div className="flex-1 overflow-y-auto p-4">
                
                {/* 1. PLAYLIST / CHAPTERS TAB */}
                {mobileTab === "outline" && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold uppercase opacity-55 pl-1 mb-2">Units in Course</h4>
                    <div className="space-y-1.5">
                      {chapters.map((ch, idx) => {
                        const isActive = ch.id === chapterId;
                        return (
                          <button
                            key={ch.id}
                            onClick={() => {
                              setSidebarOpen(false);
                              if (!isActive) {
                                navigate(`/notes/semester/${semesterId}/subject/${subjectId}/chapter/${ch.id}`);
                              }
                            }}
                            className={`w-full flex items-start gap-2.5 p-3 rounded-xl text-left text-xs font-semibold transition-all ${
                              isActive
                                ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-l-4 border-l-indigo-600 text-indigo-650 dark:text-indigo-400"
                                : "hover:bg-slate-100/50 dark:hover:bg-slate-800/40"
                            }`}
                          >
                            <span className="opacity-50 mt-0.5">{idx + 1}.</span>
                            <span className="line-clamp-2">{ch.title.replace(/^Unit \d+:\s*/i, "")}</span>
                            {isActive && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 ml-auto flex-shrink-0 self-center" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. TABLE OF CONTENTS TAB */}
                {mobileTab === "toc" && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold uppercase opacity-55 pl-1 mb-2">Document Headings</h4>
                    {headings.length > 0 ? (
                      <div className="space-y-1 border-l-2 border-slate-150 dark:border-slate-800 ml-1.5">
                        {headings.map((h) => {
                          const isActive = h.id === activeHeadingId;
                          return (
                            <button
                              key={h.id}
                              onClick={() => {
                                setSidebarOpen(false);
                                document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                              }}
                              className={`w-full text-left py-2.5 pl-4 text-xs font-semibold border-l-2 -ml-[2px] transition-all ${
                                isActive
                                  ? "border-l-indigo-600 text-indigo-650 dark:text-indigo-400 font-extrabold"
                                  : "border-l-transparent opacity-60 hover:opacity-100"
                              }`}
                            >
                              {h.text}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-10 opacity-50 text-xs font-semibold">No subdivisions in note document.</div>
                    )}
                  </div>
                )}

                {/* 3. SETTINGS / READ PREFERENCES TAB */}
                {mobileTab === "settings" && (
                  <div className="space-y-5">
                    
                    {/* Themes option */}
                    <div>
                      <span className="text-xs font-extrabold opacity-75">Visual Palette Theme</span>
                      <div className="grid grid-cols-3 gap-2 mt-2 bg-slate-100/50 dark:bg-slate-950/40 rounded-xl p-1 border dark:border-slate-800">
                        {(["light", "sepia", "dark"] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => setTheme(t)}
                            className={`py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                              theme === t
                                ? "bg-white dark:bg-slate-800 text-indigo-650 dark:text-white shadow-sm border border-slate-200/50"
                                : "opacity-60"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Font Typeface selector */}
                    <div>
                      <span className="text-xs font-extrabold opacity-75">Document Typography</span>
                      <div className="grid grid-cols-3 gap-2 mt-2 bg-slate-100/50 dark:bg-slate-950/40 rounded-xl p-1 border dark:border-slate-800">
                        {(["sans", "serif", "mono"] as const).map((f) => (
                          <button
                            key={f}
                            onClick={() => setFontFamily(f)}
                            className={`py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                              fontFamily === f
                                ? "bg-white dark:bg-slate-800 text-indigo-650 dark:text-white shadow-sm border border-slate-200/50"
                                : "opacity-60"
                            }`}
                          >
                            {f === "sans" ? "Sans" : f === "serif" ? "Serif" : "Mono"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Font Scale sizing */}
                    <div className="flex items-center justify-between pt-2 border-t dark:border-slate-850">
                      <span className="text-xs font-extrabold opacity-75">Reading Text Scale</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => adjustFontSize(-2)}
                          className="h-9 w-9 p-0 hover:bg-slate-100 rounded-xl"
                        >
                          <ZoomOut className="w-4 h-4" />
                        </Button>
                        <span className="text-xs font-black w-8 text-center">{fontSize}px</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => adjustFontSize(2)}
                          className="h-9 w-9 p-0 hover:bg-slate-100 rounded-xl"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* PDF Export trigger */}
                    <div className="pt-4 border-t dark:border-slate-850">
                      <Button
                        onClick={() => {
                          setSidebarOpen(false);
                          downloadAsPDF();
                        }}
                        disabled={isDownloading}
                        className="w-full bg-slate-100 dark:bg-slate-850 hover:bg-indigo-650 hover:text-white border-0 text-slate-700 dark:text-slate-300 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" /> Download PDF (Offline Ready)
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Auth Modals */}
      <AnimatePresence>
        {showModal && <AuthRequiredModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
