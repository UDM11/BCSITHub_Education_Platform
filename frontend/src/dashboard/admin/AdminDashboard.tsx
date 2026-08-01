// src/dashboard/admin/AdminDashboard.tsx
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../../components/ui/Button";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiClient } from "../../lib/apiClient";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "../../components/ui/Card";
import { 
  FileText, CheckCircle, Clock, TrendingUp, Sparkles, 
  ArrowLeft, LogOut, Settings, HelpCircle, Activity, 
  PlusCircle, BookOpen, AlertCircle, Users, BarChart3, Download, Eye, ShieldAlert,
  Shield, CheckSquare, Trash2, Database, Network, ChevronRight, Menu, X, Server, Cpu
} from "lucide-react";

// Import modular subcomponents
import { AdminOverview } from "./AdminOverview";
import { AdminApprovals } from "./AdminApprovals";
import { AdminUsers } from "./AdminUsers";
import { AdminAnalytics } from "./AdminAnalytics";

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

interface AdminStats {
  totalPapers: number;
  pendingApprovals: number;
  approvedPapers: number;
  totalUsers: number;
  todayUploads: number;
  totalDownloads: number;
}

interface User {
  objectId: string;
  email: string;
  name?: string;
  role: string;
  created: string;
}

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [papers, setPapers] = useState<Paper[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [totalUserCount, setTotalUserCount] = useState(0);
  const [stats, setStats] = useState<AdminStats>({
    totalPapers: 0,
    pendingApprovals: 0,
    approvedPapers: 0,
    totalUsers: 0,
    todayUploads: 0,
    totalDownloads: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [papersLoading, setPapersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  
  // Mobile sidebar drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    fetchAllData();
  }, [user, navigate]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUnapprovedPapers(),
        fetchUsers(),
        fetchStats()
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnapprovedPapers = async () => {
    try {
      setPapersLoading(true);
      const data = await apiClient.get("/papers?approved_only=false") as any[];
      const mapped = data
        .filter((item) => !item.approved)
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
      toast.error(error.message || "Failed to fetch papers");
    } finally {
      setPapersLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await apiClient.get("/auth/users") as any[];
      setTotalUserCount(data.length);
      const mapped = data.map((item) => ({
        objectId: item.id,
        email: item.email,
        name: item.name,
        role: item.role,
        created: item.created_at,
      }));
      setUsers(mapped);
    } catch (error: any) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const [allPapers, allUsers] = await Promise.all([
        apiClient.get("/papers?approved_only=false") as Promise<any[]>,
        apiClient.get("/auth/users") as Promise<any[]>
      ]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayUploads = allPapers.filter((paper: any) => {
        const uploadDate = new Date(paper.created_at);
        return uploadDate >= today;
      }).length;

      const totalDownloads = allPapers.reduce((sum: number, paper: any) => sum + (paper.downloads || 0), 0);

      setStats({
        totalPapers: allPapers.length,
        pendingApprovals: allPapers.filter((p: any) => !p.approved).length,
        approvedPapers: allPapers.filter((p: any) => p.approved).length,
        totalUsers: allUsers.length,
        todayUploads,
        totalDownloads
      });
    } catch (error: any) {
      console.error("Error fetching stats:", error);
    }
  };

  const approvePaper = async (id: string) => {
    try {
      await apiClient.post(`/papers/${id}/approve`, {});
      toast.success("Paper approved successfully!");
      await fetchAllData();
    } catch (error: any) {
      console.error("Error approving paper:", error);
      toast.error(error.message || "Failed to approve paper");
    }
  };

  const handleRejectClick = (paper: Paper) => {
    setSelectedPaper(paper);
    setConfirmOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedPaper) return;
    setConfirmOpen(false);

    try {
      await apiClient.delete(`/papers/${selectedPaper.objectId}`);

      toast.success("Paper rejected and deleted successfully!");
      await fetchAllData();
    } catch (error: any) {
      console.error("Error rejecting paper:", error);
      toast.error(error.message || "Failed to delete paper");
    } finally {
      setSelectedPaper(null);
    }
  };

  // Generate initials
  const getInitials = (nameString?: string) => {
    if (!nameString) return "A";
    const parts = nameString.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50/30 px-4 relative">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-10 left-10 w-72 h-72 bg-rose-400/10 rounded-full blur-3xl" />
        </div>
        
        <div className="text-center max-w-sm mx-auto z-10 w-full">
          <Card className="border border-slate-105 shadow-premium bg-white rounded-3xl p-1.5">
            <CardContent className="p-8">
              <div className="w-14 h-14 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-7 h-7 text-rose-600 animate-pulse" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-800 mb-1.5">Access Denied</h3>
              <p className="text-xs font-semibold text-slate-500 mb-6 leading-relaxed">
                Administrator privileges are required to access this control center.
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

  const adminName = user.name || user.email?.split("@")[0] || "Administrator";

  const navigationItems = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "approvals", label: "Paper Approvals", icon: CheckSquare },
    { id: "users", label: "User Management", icon: Users },
    { id: "analytics", label: "Platform Health", icon: BarChart3 },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200">
      
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md">
          <Shield className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <h2 className="text-sm font-black text-white leading-tight">BCSITHub</h2>
          <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block mt-0.5">Control Terminal</span>
        </div>
      </div>

      {/* Nav Link Items */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-3 cursor-pointer border-0 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/35"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <Icon className={`w-4.5 h-4.5 ${isActive ? "text-white" : "text-slate-455"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="pt-4 mt-4 border-t border-slate-800">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-3 text-slate-400 hover:bg-slate-800/60 hover:text-white"
          >
            <ArrowLeft className="w-4.5 h-4.5 text-slate-400" />
            <span>Back to Website</span>
          </Link>
        </div>
      </nav>

      {/* Identity Badge & Sign Out */}
      <div className="p-4 border-t border-slate-800 flex-shrink-0 bg-slate-950/45 space-y-4">
        
        {/* Identity row */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white border border-slate-700 font-extrabold shadow-inner flex-shrink-0">
            {getInitials(adminName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold text-white truncate leading-snug">{adminName}</p>
            <p className="text-[9px] font-extrabold text-rose-500 uppercase tracking-wider mt-0.5">System Admin</p>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={() => signOut()}
          className="w-full bg-slate-800/80 hover:bg-rose-900/40 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-900/50 font-bold text-xs px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out Session</span>
        </button>

      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/30 flex flex-col lg:flex-row relative">
      
      {/* Background decoration glows */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-24 left-10 w-96 h-96 bg-indigo-200/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 1. PERSISTENT SIDEBAR NAVIGATION (Desktop viewports) */}
      <aside className="hidden lg:block w-64 fixed left-0 top-0 bottom-0 z-30 flex-shrink-0 border-r border-slate-800/40 shadow-xl shadow-slate-900/30">
        {sidebarContent}
      </aside>

      {/* 2. MOBILE TOP NAVIGATION BAR */}
      <header className="lg:hidden sticky top-0 z-40 bg-slate-900 text-white w-full border-b border-slate-800 shadow-sm flex items-center justify-between px-4 py-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 bg-slate-800 rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Toggle Navigation Drawer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="text-sm font-black text-white tracking-tight flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-indigo-400" />
            Admin Console
          </span>
        </div>

        <button
          onClick={() => signOut()}
          className="p-2 bg-slate-800/80 rounded-lg border border-slate-700 hover:bg-rose-950/50 hover:border-rose-900/40 text-rose-400 flex items-center justify-center cursor-pointer transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* 3. MOBILE SIDEBAR DRAWER OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop shadow overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            />
            {/* Sliding navigation pane */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-64 max-w-[80vw] h-full shadow-2xl flex flex-col z-10"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. MAIN WORKSPACE CONTAINER (Desktop offset: lg:pl-64) */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 z-10">
        
        {/* Desktop Header */}
        <header className="hidden lg:flex bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-8 py-5 items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              {activeTab === "overview" && "Dashboard Overview"}
              {activeTab === "approvals" && "Submission Review Approvals"}
              {activeTab === "users" && "User Accounts Database"}
              {activeTab === "analytics" && "Platform Operations & Analytics"}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              Pokhara University Core Platform Admin Console
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 rounded-lg px-2.5 py-1 uppercase tracking-wider">
              Secure Session
            </span>
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" title="System Connected" />
          </div>
        </header>

        {/* Scrollable Panel Workspace */}
        <main className="flex-1 px-4 sm:px-8 py-8 overflow-y-auto space-y-6">
          
          {/* Greeting Banner */}
          <div className="bg-gradient-to-r from-indigo-900 via-[#1e1b4b] to-purple-950 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="absolute right-0 top-0 w-44 h-44 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div>
              <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-yellow-350 text-[9px] font-extrabold uppercase tracking-widest inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Root Terminal Console
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-2">Console Operations</h2>
              <p className="text-xs text-indigo-200/80 font-medium mt-1 leading-relaxed max-w-md">
                Verify submitted exam papers, audit student profiles, and maintain college resource indexes from the master dashboard.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("approvals")}
              className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:brightness-110 text-slate-900 font-extrabold text-xs px-5 py-3 rounded-xl shadow-md border-0 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap self-start sm:self-center group"
            >
              <CheckSquare className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span>Review Papers ({stats.pendingApprovals})</span>
            </button>
          </div>

          {/* Stats Cards grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { title: "Total Papers", value: stats.totalPapers, icon: FileText, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
              { title: "Pending Verify", value: stats.pendingApprovals, icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-100" },
              { title: "Live Assets", value: stats.approvedPapers, icon: CheckCircle, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
              { title: "Total Profiles", value: stats.totalUsers, icon: Users, color: "text-purple-600 bg-purple-50 border-purple-100" },
              { title: "Downloads", value: stats.totalDownloads, icon: Download, color: "text-pink-600 bg-pink-50 border-pink-100" }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white border border-slate-200/60 p-5 rounded-2xl flex flex-col justify-between gap-2.5 shadow-sm hover:shadow-md transition-shadow">
                <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest">{stat.title}</span>
                <div className="flex items-center justify-between gap-2">
                  {loading ? (
                    <div className="h-6 w-10 bg-slate-100 animate-pulse rounded mt-1" />
                  ) : (
                    <span className="text-xl font-black text-slate-800">{stat.value}</span>
                  )}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${stat.color}`}>
                    <stat.icon className="w-4.5 h-4.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tab content panel router */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "overview" && (
                <AdminOverview 
                  stats={stats} 
                  papers={papers} 
                  loading={loading} 
                  setActiveTab={setActiveTab} 
                  navigate={navigate} 
                />
              )}

              {activeTab === "approvals" && (
                <AdminApprovals 
                  papers={papers} 
                  loading={loading} 
                  papersLoading={papersLoading} 
                  approvePaper={approvePaper} 
                  handleRejectClick={handleRejectClick} 
                />
              )}

              {activeTab === "users" && (
                <AdminUsers 
                  users={users} 
                  totalUserCount={totalUserCount} 
                  loading={loading} 
                />
              )}

              {activeTab === "analytics" && (
                <AdminAnalytics 
                  stats={stats} 
                  loading={loading} 
                />
              )}
            </motion.div>
          </AnimatePresence>

        </main>
      </div>

      {/* Confirm Dialog reject/delete popup */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Reject Paper Submission"
        message="Are you sure you want to reject this syllabus paper? This will permanently delete the resource from database indexes and storage servers."
        onConfirm={handleConfirmReject}
        onCancel={() => {
          setConfirmOpen(false);
          setSelectedPaper(null);
        }}
      />
    </div>
  );
}