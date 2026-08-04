import React, { useEffect, useState, useMemo } from "react";
import { useSEO } from "../../hooks/useSEO";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/ProfileContext";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../lib/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "../../components/ui/Card";
import { 
  FileText, CheckCircle, Clock, LogOut, Settings, Activity, Menu, X,
  PlusCircle, AlertCircle, Shield, User, GraduationCap, ArrowLeft, ChevronLeft, ChevronRight,
  Building, Mail
} from "lucide-react";
import { toast } from "react-hot-toast";

// Subcomponents
import StudentOverview from "./StudentOverview";
import StudentSubmissions from "./StudentSubmissions";
import StudentProfileSettings from "./StudentProfileSettings";
import StudentHistoryLog from "./StudentHistoryLog";

interface Paper {
  objectId: string;
  title: string;
  uploadedAt: string;
  approved: boolean;
}

interface DashboardStats {
  totalPapers: number;
  approvedPapers: number;
  pendingPapers: number;
  recentActivity: number;
}

const StudentProfile: React.FC = () => {
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading, updateProfile, refreshProfile } = useProfile();
  const navigate = useNavigate();

  const [papers, setPapers] = useState<Paper[]>([]);
  const [papersLoading, setPapersLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalPapers: 0,
    approvedPapers: 0,
    pendingPapers: 0,
    recentActivity: 0
  });

  // Prevent search indexing for private student dashboards
  useEffect(() => {
    let robotsMeta = document.querySelector('meta[name="robots"]');
    let created = false;
    if (!robotsMeta) {
      robotsMeta = document.createElement("meta");
      robotsMeta.setAttribute("name", "robots");
      document.head.appendChild(robotsMeta);
      created = true;
    }
    robotsMeta.setAttribute("content", "noindex, nofollow");
    
    return () => {
      if (robotsMeta) {
        if (created) {
          document.head.removeChild(robotsMeta);
        } else {
          robotsMeta.setAttribute("content", "index, follow");
        }
      }
    };
  }, []);

  const seoTitle = useMemo(() => {
    switch (activeTab) {
      case "submissions":
        return "My Submissions - Student Dashboard";
      case "profile":
        return "Account Settings - Student Dashboard";
      case "activity":
        return "Activity Logs - Student Dashboard";
      default:
        return "Student Dashboard";
    }
  }, [activeTab]);

  useSEO({
    title: seoTitle,
    description: "Manage your uploaded past papers, review approval statuses, update college preferences, and inspect activity logs on BCSITHub.",
    image: "https://bcsithub.umeshdarlami.com.np/logo.jpg"
  });

  useEffect(() => {
    const fetchUserPapers = async () => {
      if (!user) return;

      const userId = user.id || user.objectId;
      if (!userId) return;

      setPapersLoading(true);
      try {
        const fetched = await apiClient.get("/papers?approved_only=false") as any[];

        const mapped = fetched
          .filter((paper: any) => paper.uploaded_by === userId)
          .map((paper: any) => ({
            objectId: paper.id,
            title: paper.title,
            uploadedAt: paper.created_at,
            approved: paper.approved,
          }));

        mapped.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

        setPapers(mapped);
        
        // Calculate stats
        const approved = mapped.filter(p => p.approved).length;
        const pending = mapped.filter(p => !p.approved).length;
        const recent = mapped.filter(p => {
          const uploadDate = new Date(p.uploadedAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return uploadDate > weekAgo;
        }).length;

        setStats({
          totalPapers: mapped.length,
          approvedPapers: approved,
          pendingPapers: pending,
          recentActivity: recent
        });
      } catch (error) {
        console.error("Error fetching user papers:", error);
        setPapers([]);
      } finally {
        setPapersLoading(false);
      }
    };

    fetchUserPapers();
  }, [user]);

  const handleProfileUpdate = async (data: any) => {
    try {
      setIsSubmitting(true);
      await updateProfile(data);
      await refreshProfile();
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile:", err);
      toast.error("Failed to update profile details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = () => {
    signOut();
    toast.success("Logged out successfully.");
    navigate("/signin");
  };

  const getInitials = (nameString?: string) => {
    if (!nameString) return "S";
    const parts = nameString.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getRankProgress = (count: number) => {
    if (count === 0) {
      return { 
        current: "Novice 🌱", 
        next: "Bronze Contributor 🥉", 
        needed: 1, 
        currentCount: 0, 
        percent: 0,
        class: "bg-slate-100 text-slate-700 border-slate-200" 
      };
    } else if (count < 3) {
      return { 
        current: "Bronze Contributor 🥉", 
        next: "Silver Scholar 🥈", 
        needed: 3, 
        currentCount: count, 
        percent: (count / 3) * 100,
        class: "bg-amber-50 text-amber-800 border-amber-200" 
      };
    } else if (count < 7) {
      return { 
        current: "Silver Scholar 🥈", 
        next: "Gold Academic 🥇", 
        needed: 7, 
        currentCount: count, 
        percent: (count / 7) * 100,
        class: "bg-slate-100 text-slate-800 border-slate-350" 
      };
    } else {
      return { 
        current: "Gold Academic 🥇", 
        next: "Max Rank Reached! 🏆", 
        needed: 7, 
        currentCount: count, 
        percent: 100,
        class: "bg-yellow-50 text-yellow-800 border-yellow-250 animate-pulse" 
      };
    }
  };

  if (!user && !profileLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50/50 relative px-4">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-10 left-10 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl" />
        </div>
        
        <div className="text-center max-w-sm mx-auto z-10 w-full">
          <Card className="border border-white/20 shadow-premium bg-white/75 backdrop-blur-md rounded-3xl p-1.5">
            <CardContent className="p-8">
              <div className="w-14 h-14 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-7 h-7 text-rose-600 animate-pulse" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-800 mb-1.5">Authentication Required</h3>
              <p className="text-xs font-semibold text-slate-505 mb-6 leading-relaxed">
                Please sign in to access your customized student profile page dashboard.
              </p>
              <Button onClick={() => navigate("/signin")} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 text-white font-bold border-0 py-3 rounded-xl shadow-md">
                Go to Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Dashboard", icon: User },
    { id: "papers", label: "My Submissions", icon: FileText },
    { id: "profile", label: "Edit Profile", icon: Settings },
    { id: "activity", label: "History Log", icon: Activity },
  ];

  const studentName = profile?.name || user?.email?.split("@")[0] || "Student";
  const rank = getRankProgress(stats.totalPapers);

  const sidebarContent = (isCollapsed: boolean) => (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-6">
        {/* Sidebar Header */}
        <div className={`flex items-center p-2 ${isCollapsed ? "justify-center" : "justify-between"}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/10 flex-shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="min-w-0"
              >
                <h1 className="text-sm font-black text-slate-800 dark:text-white leading-none">BCSITHub</h1>
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-300 uppercase tracking-widest mt-1 block">Student Portal</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Profile Overview (Inside Sidebar) */}
        {!isCollapsed ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border border-slate-200/50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl p-4 text-center space-y-4 overflow-hidden"
          >
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center rounded-full p-0.5 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-md">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center border-2 border-white overflow-hidden">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={studentName} className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-xl font-black text-white">
                    {getInitials(studentName)}
                  </span>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-800 dark:text-white truncate max-w-[170px] mx-auto">{studentName}</h4>
              <span className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-wider inline-block mt-1 ${rank.class}`}>
                {rank.current.split(" ")[0]}
              </span>
            </div>

            <div className="space-y-1">
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
                  style={{ width: `${rank.percent}%` }}
                />
              </div>
              <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-300 block text-right uppercase tracking-wider">{Math.round(rank.percent)}% Rank Progress</span>
            </div>

            {/* Personal Details Metadata */}
            <div className="border-t border-slate-200/50 dark:border-slate-800 pt-3 text-left space-y-2 text-[10px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2 min-w-0">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                <span className="truncate">{profile?.semester ? `${profile.semester} Semester` : "Semester: N/A"}</span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <Building className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                <span className="truncate" title={profile?.college}>{profile?.college || "College: N/A"}</span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <Mail className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                <span className="truncate" title={profile?.email || user?.email}>{profile?.email || user?.email}</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex justify-center py-2">
            <div className="relative w-10 h-10 flex items-center justify-center rounded-full p-0.5 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-md">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center border border-white overflow-hidden">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={studentName} className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-sm font-black text-white">
                    {getInitials(studentName)}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sidebar Tabs Navigation */}
        <nav className="space-y-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 border-0 flex items-center gap-3 cursor-pointer relative group ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
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

      {/* Sidebar Footer (Back to Website & Sign Out) */}
      <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2">
        <button
          onClick={() => navigate("/")}
          className={`w-full px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 border-0 flex items-center gap-3 cursor-pointer text-slate-400 hover:bg-slate-800/60 hover:text-white relative group ${
            isCollapsed ? "justify-center" : ""
          }`}
          title={isCollapsed ? "Back to Home" : undefined}
        >
          <ArrowLeft className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>Back to Home</span>}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
              Back to Home
            </div>
          )}
        </button>

        <button
          onClick={handleSignOut}
          className={`w-full flex items-center bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 font-extrabold text-xs py-3 rounded-xl transition-all duration-200 border-0 cursor-pointer shadow-sm shadow-rose-100 dark:shadow-none relative group ${
            isCollapsed ? "justify-center" : "px-4"
          }`}
          title={isCollapsed ? "Sign Out" : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span className="ml-3">Sign Out Account</span>}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-rose-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
              Sign Out Account
            </div>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/40 dark:bg-slate-50/40 flex flex-col md:flex-row relative text-slate-800 dark:text-slate-800 transition-all duration-300">
      
      {/* Background gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-24 left-10 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* MOBILE HEADER BAR */}
      <header className="md:hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800 px-4 py-4 flex items-center justify-between sticky top-0 z-40 w-full shadow-sm">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-indigo-600" />
          <span className="font-black text-slate-800 dark:text-white tracking-tight text-sm">BCSITHub</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 1. PERSISTENT SIDEBAR NAVIGATION (Desktop viewports) */}
      <aside className={`hidden md:flex bg-white/95 dark:bg-slate-900/95 border-r border-slate-200/60 dark:border-slate-800 backdrop-blur-md flex-shrink-0 flex flex-col justify-between p-4 z-30 md:sticky md:top-0 md:h-screen transition-all duration-300 relative ${
        isSidebarCollapsed ? "w-20" : "w-64"
      }`}>
        {sidebarContent(isSidebarCollapsed)}
        
        {/* Floating border collapse toggle */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden md:flex absolute top-6 -right-3.5 w-7 h-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full items-center justify-center cursor-pointer shadow-md z-50 text-slate-500 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800"
          aria-label="Toggle Sidebar"
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>

      {/* 2. MOBILE SIDEBAR DRAWER OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop shadow overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            {/* Sliding navigation drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className="relative w-64 max-w-[80vw] h-full shadow-2xl z-50 flex flex-col bg-white dark:bg-slate-900 p-4"
            >
              {/* Close Button Inside Drawer */}
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-805 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {sidebarContent(false)}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 z-10 p-4 sm:p-8 lg:p-10 relative">
        
        {/* Breadcrumb / Section Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4 border-b border-slate-200/50 dark:border-slate-200/50 pb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-800 tracking-tight capitalize">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest mt-1">
              Student Hub Dashboard / {activeTab}
            </p>
          </div>
          
          <button
            onClick={() => navigate("/past-papers")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-md border-0 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Upload Past Paper
          </button>
        </div>

        {/* CONTENT SWITCH BOARD */}
        <main className="space-y-8 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "overview" && (
                <StudentOverview
                  studentName={studentName}
                  stats={stats}
                  papersLoading={papersLoading}
                  profile={profile}
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === "papers" && (
                <StudentSubmissions
                  papers={papers}
                  papersLoading={papersLoading}
                />
              )}

              {activeTab === "profile" && (
                <StudentProfileSettings
                  profile={profile}
                  isEditing={isEditing}
                  setIsEditing={setIsEditing}
                  isSubmitting={isSubmitting}
                  handleProfileUpdate={handleProfileUpdate}
                />
              )}

              {activeTab === "activity" && (
                <StudentHistoryLog
                  papers={papers}
                  papersLoading={papersLoading}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

    </div>
  );
};

export default StudentProfile;
