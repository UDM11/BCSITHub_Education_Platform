import React, { useEffect, useState } from "react";
import { useSEO } from "../../hooks/useSEO";
import TeacherOverview from "./TeacherOverview";
import TeacherPapers from "./TeacherPapers";
import TeacherStudents from "./TeacherStudents";
import TeacherAnalytics from "./TeacherAnalytics";
import TeacherSettings from "./TeacherSettings";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/ProfileContext";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import AvatarInitials from "../../components/common/AvatarInitials";
import { apiClient } from "../../lib/apiClient";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "../../components/ui/Card";

import { 
  FileText, CheckCircle, Clock, TrendingUp, Download,
  ArrowLeft, LogOut, Settings, Activity, 
  PlusCircle, Users, BarChart3,
  ChevronLeft, ChevronRight, Mail, Building, GraduationCap, Menu, X, AlertCircle
} from "lucide-react";

interface Paper {
  objectId: string;
  title: string;
  subject: string;
  semester: number;
  examType: string;
  college: string;
  uploadedAt: string | Date;
  uploadedBy: string;
  downloads: number;
  approved: boolean;
  fileUrl: string;
}

interface TeacherStats {
  totalPapers: number;
  approvedPapers: number;
  pendingPapers: number;
  totalDownloads: number;
  thisWeekUploads: number;
  popularPaper: string;
}

interface Student {
  objectId: string;
  email: string;
  name?: string;
  semester?: string;
  college?: string;
  created: string;
}

const TeacherDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const navigate = useNavigate();
  
  const [papers, setPapers] = useState<Paper[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<TeacherStats>({
    totalPapers: 0,
    approvedPapers: 0,
    pendingPapers: 0,
    totalDownloads: 0,
    thisWeekUploads: 0,
    popularPaper: "N/A"
  });
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // High-fidelity search filter for students list
  const [studentSearchTerm, setStudentSearchTerm] = useState("");


  // ── 1. noindex/nofollow – keep private dashboard out of search indexes ──────
  useEffect(() => {
    let robotsMeta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    let created = false;
    if (!robotsMeta) {
      robotsMeta = document.createElement("meta") as HTMLMetaElement;
      robotsMeta.setAttribute("name", "robots");
      document.head.appendChild(robotsMeta);
      created = true;
    }
    robotsMeta.setAttribute("content", "noindex, nofollow, noarchive, nositelinkssearchbox");
    return () => {
      if (robotsMeta) {
        if (created) document.head.removeChild(robotsMeta);
        else robotsMeta.setAttribute("content", "index, follow");
      }
    };
  }, []);

  // ── 2. Per-tab advanced SEO metadata ─────────────────────────────────────
  const SEO_MAP: Record<string, { title: string; description: string; keywords: string }> = {
    overview: {
      title: "Teacher Dashboard — Overview",
      description:
        "Monitor your total uploads, approval status, weekly contributions, and student engagement metrics on your BCSITHub Teacher Console.",
      keywords:
        "teacher dashboard, BCSITHub instructor portal, BCSIT paper uploads, academic resource management, teacher analytics, Pokhara University",
    },
    papers: {
      title: "My Uploaded Papers — Teacher Dashboard",
      description:
        "View, manage, and track all academic papers you have submitted on BCSITHub. Check approval status, download counts, and upload history.",
      keywords:
        "uploaded papers, past paper management, BCSIT academic uploads, paper approval, teacher submissions, BCSITHub",
    },
    students: {
      title: "Student Directory — Teacher Dashboard",
      description:
        "Browse the complete directory of registered BCSIT students on BCSITHub. Search by name, semester, or college affiliation.",
      keywords:
        "student directory, BCSIT students, Pokhara University students, teacher student view, student list, BCSITHub",
    },
    analytics: {
      title: "Performance Analytics — Teacher Dashboard",
      description:
        "Analyse download trends, paper performance metrics, and student engagement data for your academic contributions on BCSITHub.",
      keywords:
        "teacher analytics, paper download statistics, academic performance, BCSIT resource analytics, engagement metrics, BCSITHub",
    },
    settings: {
      title: "Profile & Settings — Teacher Dashboard",
      description:
        "Update your teacher profile, institution affiliation, contact details, and account preferences on the BCSITHub instructor portal.",
      keywords:
        "teacher profile, instructor settings, BCSITHub account, profile update, institution affiliation, teacher preferences",
    },
  };

  const currentSEO = SEO_MAP[activeTab] ?? SEO_MAP.overview;

  const seoTitle = currentSEO.title;

  // ── 3. Core meta tags via useSEO ─────────────────────────────────────────
  useSEO({
    title: seoTitle,
    description: currentSEO.description,
    keywords: currentSEO.keywords,
    image: "https://bcsithub.umeshdarlami.com.np/logo.jpg",
  });

  // ── 4. Extended OG / Twitter tags + JSON-LD injected per tab ─────────────
  useEffect(() => {
    const BASE_URL = "https://bcsithub.umeshdarlami.com.np";
    const PAGE_URL = `${BASE_URL}/teacher-dashboard`;

    // og:type
    const setMeta = (sel: string, attr: string, val: string) => {
      let el = document.querySelector(sel);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr.startsWith("og:") || attr.startsWith("twitter:") ? "property" : "name", attr);
        document.head.appendChild(el);
      }
      el.setAttribute("content", val);
    };

    setMeta('meta[property="og:type"]',          "og:type",          "website");
    setMeta('meta[property="og:site_name"]',      "og:site_name",     "BCSITHub");
    setMeta('meta[property="og:locale"]',         "og:locale",        "en_US");
    setMeta('meta[name="twitter:card"]',          "twitter:card",     "summary_large_image");
    setMeta('meta[name="twitter:site"]',          "twitter:site",     "@BCSITHub");
    setMeta('meta[name="author"]',                "author",           "BCSITHub — Pokhara University BCSIT Portal");
    setMeta('meta[name="theme-color"]',           "theme-color",      "#4338ca");
    setMeta('meta[name="application-name"]',      "application-name", "BCSITHub");

    // JSON-LD structured data
    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": PAGE_URL,
          "url": PAGE_URL,
          "name": `${currentSEO.title} | BCSITHub`,
          "description": currentSEO.description,
          "inLanguage": "en-US",
          "isPartOf": { "@id": `${BASE_URL}/#website` },
          "breadcrumb": { "@id": `${PAGE_URL}/#breadcrumb` },
          "potentialAction": {
            "@type": "ReadAction",
            "target": [PAGE_URL],
          },
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${PAGE_URL}/#breadcrumb`,
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home",             "item": BASE_URL },
            { "@type": "ListItem", "position": 2, "name": "Teacher Dashboard","item": PAGE_URL },
            ...(activeTab !== "overview"
              ? [{ "@type": "ListItem", "position": 3, "name": SEO_MAP[activeTab]?.title ?? activeTab }]
              : []),
          ],
        },
        {
          "@type": "Organization",
          "@id": `${BASE_URL}/#organization`,
          "name": "BCSITHub",
          "url": BASE_URL,
          "logo": `${BASE_URL}/logo.jpg`,
          "description": "Nepal's leading academic resource hub for Pokhara University BCSIT students.",
          "sameAs": [
            "https://bcsithub.umeshdarlami.com.np",
          ],
        },
      ],
    };

    let scriptEl = document.getElementById("teacher-dashboard-jsonld") as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement("script") as HTMLScriptElement;
      scriptEl.id = "teacher-dashboard-jsonld";
      scriptEl.type = "application/ld+json";
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(jsonLd);

    return () => {
      const s = document.getElementById("teacher-dashboard-jsonld");
      if (s) s.remove();
    };
  }, [activeTab, currentSEO]);


  useEffect(() => {
    if (user?.role !== "teacher") {
      navigate("/dashboard");
      return;
    }
    fetchAllData();
  }, [user, navigate]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchTeacherPapers(),
        fetchStudents(),
        fetchStats()
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherPapers = async () => {
    if (!user) return;
    
    try {
      const data = await apiClient.get("/papers?approved_only=false") as any[];
      const mapped = data
        .filter((item) => item.uploaded_by === user.id)
        .map((item) => ({
          objectId: item.id,
          title: item.title,
          subject: item.subject,
          semester: item.semester,
          examType: item.exam_type,
          college: item.college,
          uploadedAt: item.created_at,
          uploadedBy: item.uploaded_by || "",
          downloads: item.downloads,
          approved: item.approved,
          fileUrl: item.file_url,
        }));
      setPapers(mapped);
    } catch (error: any) {
      console.error("Error fetching papers:", error);
      toast.error("Failed to fetch papers");
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await apiClient.get("/auth/students") as any[];
      const mapped = data.map((item) => ({
        objectId: item.id,
        email: item.email,
        name: item.name,
        semester: item.semester?.toString() || "1",
        college: item.college || "",
        created: item.created_at,
      }));
      setStudents(mapped);
    } catch (error: any) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const thisWeekUploads = papers.filter(paper => {
        const uploadDate = new Date(paper.uploadedAt);
        return uploadDate >= weekAgo;
      }).length;

      const totalDownloads = papers.reduce((sum, paper) => sum + (paper.downloads || 0), 0);
      const popularPaper = papers.length > 0 
        ? papers.reduce((prev, current) => (prev.downloads > current.downloads) ? prev : current).title
        : "N/A";

      setStats({
        totalPapers: papers.length,
        approvedPapers: papers.filter(p => p.approved).length,
        pendingPapers: papers.filter(p => !p.approved).length,
        totalDownloads,
        thisWeekUploads,
        popularPaper
      });
    } catch (error: any) {
      console.error("Error fetching stats:", error);
    }
  };

  // Generate initials
  const getInitials = (nameString?: string) => {
    if (!nameString) return "T";
    const parts = nameString.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Filter students by search term
  const filteredStudents = students.filter(s => {
    const term = studentSearchTerm.toLowerCase();
    const emailMatch = s.email.toLowerCase().includes(term);
    const nameMatch = s.name ? s.name.toLowerCase().includes(term) : false;
    return emailMatch || nameMatch;
  });

  if (!user || user.role !== "teacher") {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50/30 px-4 relative">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-10 left-10 w-72 h-72 bg-rose-400/10 rounded-full blur-3xl" />
        </div>
        
        <div className="text-center max-w-sm mx-auto z-10 w-full">
          <Card className="border border-slate-100 shadow-premium bg-white rounded-3xl p-1.5">
            <CardContent className="p-8">
              <div className="w-14 h-14 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-7 h-7 text-rose-600 animate-pulse" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-800 mb-1.5">Access Denied</h3>
              <p className="text-xs font-semibold text-slate-500 mb-6 leading-relaxed">
                Teacher privileges are required to view this administrative workspace.
              </p>
              <Button onClick={() => navigate("/signin")} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold border-0 py-3 rounded-xl shadow-md transition-all">
                Go to Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const teacherName = profile?.name || user.email?.split("@")[0] || "Academic Instructor";

  const tabs = [
    { id: "overview",   label: "Dashboard",       icon: Activity },
    { id: "papers",     label: "My Papers",        icon: FileText },
    { id: "students",   label: "Students",         icon: Users },
    { id: "analytics",  label: "Analytics",        icon: BarChart3 },
    { id: "profile",    label: "Institution Info", icon: Settings },
  ];

  const getInitialsT = (nameString?: string) => {
    if (!nameString) return "T";
    const parts = nameString.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const sidebarContent = (isCollapsed: boolean) => (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-6">
        <div className={`flex items-center p-2 ${isCollapsed ? "justify-center" : "justify-between"}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md flex-shrink-0 border border-slate-200 dark:border-slate-800">
              <img src="/logo.jpg" alt="BCSITHub Logo" className="w-full h-full object-cover" />
            </div>
            {!isCollapsed && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="min-w-0">
                <h1 className="text-sm font-black text-slate-800 dark:text-white leading-none">BCSITHub</h1>
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-300 uppercase tracking-widest mt-1 block">Teacher Portal</span>
              </motion.div>
            )}
          </div>
        </div>

        {!isCollapsed ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="border border-slate-200/50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl p-4 text-center space-y-4 overflow-hidden">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center rounded-full p-0.5 bg-gradient-to-tr from-emerald-500 via-indigo-600 to-purple-600 shadow-md">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center border-2 border-white overflow-hidden">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={teacherName} className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-xl font-black text-white">{getInitialsT(teacherName)}</span>
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-indigo-600 rounded-full border-2 border-white flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-800 dark:text-white truncate max-w-[170px] mx-auto">{teacherName}</h4>
              <span className="px-2 py-0.5 rounded-full border border-indigo-100 bg-indigo-50 text-indigo-700 text-[8px] font-black uppercase tracking-wider inline-block mt-1">Instructor 🏫</span>
            </div>
            <div className="grid grid-cols-3 gap-2 border-t border-slate-200/50 dark:border-slate-800 pt-3">
              {[
                { label: "Papers",    value: stats.totalPapers },
                { label: "Approved",  value: stats.approvedPapers },
                { label: "Downloads", value: stats.totalDownloads },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-sm font-black text-slate-800 dark:text-white">{loading ? "—" : s.value}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200/50 dark:border-slate-800 pt-3 text-left space-y-2 text-[10px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2 min-w-0">
                <Building className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                <span className="truncate">{profile?.college || "Institution: N/A"}</span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <Mail className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                <span className="truncate">{profile?.email || user?.email}</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex justify-center py-2">
            <div className="relative w-10 h-10 flex items-center justify-center rounded-full p-0.5 bg-gradient-to-tr from-emerald-500 via-indigo-600 to-purple-600 shadow-md">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center border border-white overflow-hidden">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={teacherName} className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-sm font-black text-white">{getInitialsT(teacherName)}</span>
                )}
              </div>
            </div>
          </div>
        )}

        <nav className="space-y-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }}
                className={`w-full px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 border-0 flex items-center gap-3 cursor-pointer relative group ${
                  isActive ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                } ${isCollapsed ? "justify-center" : ""}`}
                title={isCollapsed ? tab.label : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!isCollapsed && <span>{tab.label}</span>}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    {tab.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2">
        <button
          onClick={() => navigate("/")}
          className={`w-full px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 border-0 flex items-center gap-3 cursor-pointer text-slate-400 hover:bg-slate-800/60 hover:text-white relative group ${isCollapsed ? "justify-center" : ""}`}
          title={isCollapsed ? "Back to Home" : undefined}
        >
          <ArrowLeft className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>Back to Home</span>}
          {isCollapsed && <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">Back to Home</div>}
        </button>
        <button
          onClick={() => { signOut(); navigate("/signin"); }}
          className={`w-full flex items-center bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 text-rose-600 font-extrabold text-xs py-3 rounded-xl transition-all duration-200 border-0 cursor-pointer shadow-sm relative group ${isCollapsed ? "justify-center" : "px-4"}`}
          title={isCollapsed ? "Sign Out" : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span className="ml-3">Sign Out Account</span>}
          {isCollapsed && <div className="absolute left-full ml-2 px-2 py-1 bg-rose-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">Sign Out</div>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/40 dark:bg-slate-50/40 flex flex-col md:flex-row relative text-slate-800 dark:text-slate-800 transition-all duration-300">

      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-24 left-10 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* MOBILE HEADER BAR */}
      <header className="md:hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800 px-4 py-4 flex items-center justify-between sticky top-0 z-40 w-full shadow-sm">
        <div className="flex items-center gap-2">
          <img src="/logo.jpg" alt="BCSITHub Logo" className="w-6 h-6 rounded-lg object-cover border border-slate-200 dark:border-slate-800" />
          <span className="font-black text-slate-800 dark:text-white tracking-tight text-sm">BCSITHub</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50 cursor-pointer" aria-label="Open Menu">
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* PERSISTENT SIDEBAR (Desktop) */}
      <aside className={`hidden md:flex bg-white/95 dark:bg-slate-900/95 border-r border-slate-200/60 dark:border-slate-800 backdrop-blur-md flex-shrink-0 flex-col justify-between p-4 z-30 md:sticky md:top-0 md:h-screen transition-all duration-300 relative ${isSidebarCollapsed ? "w-20" : "w-64"}`}>
        {sidebarContent(isSidebarCollapsed)}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden md:flex absolute top-6 -right-3.5 w-7 h-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full items-center justify-center cursor-pointer shadow-md z-50 text-slate-500 hover:bg-slate-50"
          aria-label="Toggle Sidebar"
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>

      {/* MOBILE SIDEBAR DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className="relative w-64 max-w-[80vw] h-full shadow-2xl z-50 flex flex-col bg-white dark:bg-slate-900 p-4"
            >
              <div className="flex justify-end mb-4">
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-1.5 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer text-slate-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">{sidebarContent(false)}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 z-10 p-4 sm:p-8 lg:p-10 relative">

        {/* Breadcrumb Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4 border-b border-slate-200/50 pb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight capitalize">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Teacher Hub Dashboard / {activeTab}
            </p>
          </div>
          <button
            onClick={() => navigate("/upload-paper")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-md border-0 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Upload Paper
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {[
            { title: "Total Papers",  value: stats.totalPapers,     icon: FileText,   color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
            { title: "Approved",      value: stats.approvedPapers,  icon: CheckCircle,color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
            { title: "Pending",       value: stats.pendingPapers,   icon: Clock,      color: "text-amber-600 bg-amber-50 border-amber-100" },
            { title: "Downloads",     value: stats.totalDownloads,  icon: Download,   color: "text-blue-600 bg-blue-50 border-blue-100" },
            { title: "This Week",     value: stats.thisWeekUploads, icon: TrendingUp, color: "text-purple-600 bg-purple-50 border-purple-100" },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white border border-slate-200/60 p-4 rounded-2xl flex flex-col justify-between gap-2 shadow-sm hover:shadow-md transition-shadow">
              <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest">{stat.title}</span>
              <div className="flex items-center justify-between gap-2">
                {loading ? <div className="h-6 w-10 bg-slate-100 animate-pulse rounded mt-1" /> : <span className="text-xl font-black text-slate-800">{stat.value}</span>}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${stat.color}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CONTENT SWITCH BOARD */}
        <main className="space-y-8 flex-1">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {activeTab === "overview"  && <TeacherOverview  papers={papers}   loading={loading} setActiveTab={setActiveTab} />}
              {activeTab === "papers"    && <TeacherPapers    papers={papers}   loading={loading} />}
              {activeTab === "students"  && <TeacherStudents  students={students} loading={loading} />}
              {activeTab === "analytics" && <TeacherAnalytics stats={stats}     loading={loading} />}
              {activeTab === "profile"   && <TeacherSettings  profile={profile} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

    </div>
  );
};

export default TeacherDashboard;
