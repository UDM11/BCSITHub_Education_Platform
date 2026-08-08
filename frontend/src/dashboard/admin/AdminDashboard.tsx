// src/dashboard/admin/AdminDashboard.tsx
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../../components/ui/Button";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiClient } from "../../lib/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "../../components/ui/Card";
import { 
  Users, Shield, LogOut, ArrowLeft, Activity, Sparkles, ShieldAlert,
  BarChart3, UserCheck, Menu, X, Clock, FileText, Bell, CheckSquare,
  ChevronLeft, ChevronRight
} from "lucide-react";

// Import modular subcomponents
import { AdminOverview } from "./AdminOverview";
import { AdminUsers } from "./AdminUsers";
import { AdminPapers } from "./AdminPapers";
import { AdminNotices } from "./AdminNotices";
import { AdminAnalytics } from "./AdminAnalytics";
import { AdminTickets } from "./AdminTickets";

interface User {
  objectId: string;
  email: string;
  name?: string;
  role: string;
  created: string;
}

interface AdminStats {
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalAdmins: number;
  todayRegistrations: number;
  totalPapers: number;
  pendingPapers: number;
  totalNotices: number;
}

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<User[]>([]);
  const [totalUserCount, setTotalUserCount] = useState(0);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalAdmins: 0,
    todayRegistrations: 0,
    totalPapers: 0,
    pendingPapers: 0,
    totalNotices: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Mobile sidebar drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
      await fetchUsersAndStats();
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersAndStats = async () => {
    try {
      const [usersData, papersData, noticesData] = await Promise.all([
        apiClient.get("/auth/users") as Promise<any[]>,
        apiClient.get("/papers?approved_only=false") as Promise<any[]>,
        apiClient.get("/notices") as Promise<any[]>
      ]);

      setTotalUserCount(usersData.length);
      const mappedUsers = usersData.map((item) => ({
        objectId: item.id,
        email: item.email,
        name: item.name,
        role: item.role,
        created: item.created_at,
      }));
      setUsers(mappedUsers);

      // Compute statistics
      const totalUsers = usersData.length;
      const totalTeachers = usersData.filter((u: any) => u.role === "teacher").length;
      const totalStudents = usersData.filter((u: any) => u.role === "student" || !u.role || u.role === "").length;
      const totalAdmins = usersData.filter((u: any) => u.role === "admin").length;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayRegistrations = usersData.filter((u: any) => {
        const createdDate = new Date(u.created_at || u.created);
        return createdDate >= today;
      }).length;

      const totalPapers = papersData.length;
      const pendingPapers = papersData.filter((p: any) => !p.approved).length;
      const totalNotices = noticesData.length;

      setStats({
        totalUsers,
        totalTeachers,
        totalStudents,
        totalAdmins,
        todayRegistrations,
        totalPapers,
        pendingPapers,
        totalNotices
      });
    } catch (error: any) {
      console.error("Error fetching users & stats:", error);
      toast.error(error.message || "Failed to load dashboard statistics");
    }
  };

  const getInitials = (nameString?: string) => {
    if (!nameString) return "A";
    const parts = nameString.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50/30 px-4 relative text-left">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-10 left-10 w-72 h-72 bg-rose-400/10 rounded-full blur-3xl" />
        </div>
        
        <div className="text-center max-w-sm mx-auto z-10 w-full">
          <Card className="border border-slate-205 shadow-premium bg-white rounded-3xl p-1.5">
            <CardContent className="p-8">
              <div className="w-14 h-14 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-7 h-7 text-rose-605 animate-pulse" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-800 mb-1.5">Access Denied</h3>
              <p className="text-xs font-semibold text-slate-505 mb-6 leading-relaxed">
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
    { id: "users", label: "User Management", icon: Users },
    { id: "papers", label: "Manage Papers", icon: FileText },
    { id: "notices", label: "Manage Notices", icon: Bell },
    { id: "tickets", label: "Support Tickets", icon: CheckSquare },
    { id: "analytics", label: "Platform Health", icon: BarChart3 },
  ];

  const sidebarContent = (isCollapsed: boolean) => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 text-left">
      
      <div className={`p-4 border-b border-slate-800 flex items-center flex-shrink-0 ${isCollapsed ? "justify-center" : "justify-between"}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md flex-shrink-0 border border-slate-700">
            <img src="/logo.png" alt="BCSITHub Logo" className="w-full h-full object-cover" />
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="min-w-0"
            >
              <h2 className="text-sm font-black text-white leading-tight">BCSITHub</h2>
              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block mt-0.5">Control Terminal</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Nav Link Items */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
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
              className={`w-full px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-3 cursor-pointer border-0 relative group ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/35"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              } ${isCollapsed ? "justify-center" : ""}`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
              {!isCollapsed && <span>{item.label}</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-950 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Identity Badge, Website Link & Sign Out */}
      <div className="p-4 border-t border-slate-800 flex-shrink-0 bg-slate-955/45 space-y-3">
        
        {/* Identity row */}
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-805 flex items-center justify-center text-white border border-slate-700 font-extrabold shadow-inner flex-shrink-0">
              {getInitials(adminName)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold text-white truncate leading-snug">{adminName}</p>
              <p className="text-[9px] font-extrabold text-rose-500 uppercase tracking-wider mt-0.5">System Admin</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-white border border-slate-700 font-extrabold shadow-inner">
              {getInitials(adminName)}
            </div>
          </div>
        )}

        {/* Back to Website */}
        <Link
          to="/"
          onClick={() => setMobileMenuOpen(false)}
          className={`w-full px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-3 text-slate-400 hover:bg-slate-800/60 hover:text-white border-0 relative group ${
            isCollapsed ? "justify-center" : ""
          }`}
          title={isCollapsed ? "Back to Home" : undefined}
        >
          <ArrowLeft className="w-4.5 h-4.5 text-slate-400 flex-shrink-0" />
          {!isCollapsed && <span>Back to Home</span>}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-slate-950 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
              Back to Home
            </div>
          )}
        </Link>

        {/* Sign Out Button */}
        <button
          onClick={() => signOut()}
          className={`w-full bg-slate-800/80 hover:bg-rose-900/40 text-slate-300 hover:text-rose-205 border border-slate-700 hover:border-rose-900/50 font-bold text-xs py-2.5 rounded-xl transition-all duration-300 flex items-center gap-1.5 cursor-pointer relative group ${
            isCollapsed ? "justify-center" : "px-4"
          }`}
          title={isCollapsed ? "Sign Out Session" : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>Sign Out Session</span>}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-rose-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
              Sign Out Session
            </div>
          )}
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
      <aside className={`hidden lg:block z-30 flex-shrink-0 border-r border-slate-800/40 shadow-xl shadow-slate-900/30 transition-all duration-300 relative ${
        isSidebarCollapsed ? "w-20" : "w-64"
      }`}>
        {sidebarContent(isSidebarCollapsed)}
        
        {/* Floating border collapse toggle */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden lg:flex absolute top-6 -right-3.5 w-7 h-7 bg-slate-900 border border-slate-800 rounded-full items-center justify-center cursor-pointer shadow-md z-50 text-slate-400 hover:bg-slate-800"
          aria-label="Toggle Sidebar"
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
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
          <span className="text-sm font-black text-white tracking-tight flex items-center gap-2">
            <img src="/logo.png" alt="BCSITHub Logo" className="w-6 h-6 rounded-lg object-cover border border-slate-700" />
            Admin Console
          </span>
        </div>

        <button
          onClick={() => signOut()}
          className="p-2 bg-slate-800/80 rounded-lg border border-slate-700 hover:bg-rose-950/50 hover:border-rose-900/40 text-rose-405 flex items-center justify-center cursor-pointer transition-colors"
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
              className="fixed inset-0 bg-slate-955/70 backdrop-blur-sm"
            />
            {/* Sliding navigation pane */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-64 max-w-[80vw] h-full shadow-2xl flex flex-col z-10"
            >
              {sidebarContent(false)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. MAIN WORKSPACE CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 z-10 transition-all duration-300">
        {/* Desktop Header */}
        <header className="hidden lg:flex bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-8 py-5 items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-805 tracking-tight flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              {activeTab === "overview" && "Dashboard Overview"}
              {activeTab === "users" && "User Accounts & Role Administration"}
              {activeTab === "papers" && "Past Papers & Files Index"}
              {activeTab === "notices" && "PU Announcements & Notices"}
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
            <div className="h-2 w-2 bg-emerald-505 rounded-full animate-pulse" title="System Connected" />
          </div>
        </header>

        {/* Scrollable Panel Workspace */}
        <main className="flex-1 px-4 sm:px-8 py-8 overflow-y-auto space-y-6">
          
          {/* Greeting Banner */}
          <div className="bg-gradient-to-r from-indigo-900 via-[#1e1b4b] to-purple-950 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="absolute right-0 top-0 w-44 h-44 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div className="text-left">
              <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-yellow-300 text-[9px] font-extrabold uppercase tracking-widest inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Root Terminal Console
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-2">Console Operations</h2>
              <p className="text-xs text-indigo-200/80 font-medium mt-1 leading-relaxed max-w-md">
                Edit and delete syllabus resources, moderate registered profiles, and audit notice boards instantly.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2.5">
              {stats.pendingPapers > 0 && (
                <button
                  onClick={() => setActiveTab("papers")}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md border-0 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Review Submissions ({stats.pendingPapers})</span>
                </button>
              )}
              <button
                onClick={() => setActiveTab("users")}
                className="bg-white/10 hover:bg-white/15 text-white border border-white/10 font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Manage Users ({stats.totalUsers})</span>
              </button>
            </div>
          </div>

          {/* Stats Cards grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { title: "Total Profiles", value: stats.totalUsers, icon: Users, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
              { title: "Syllabus Papers", value: stats.totalPapers, icon: FileText, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
              { title: "Pending Papers", value: stats.pendingPapers, icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-100" },
              { title: "PU Notices", value: stats.totalNotices, icon: Bell, color: "text-purple-600 bg-purple-50 border-purple-100" },
              { title: "Today Signups", value: stats.todayRegistrations, icon: Clock, color: "text-pink-600 bg-pink-50 border-pink-100" }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white border border-slate-200/60 p-5 rounded-2xl flex flex-col justify-between gap-2.5 shadow-sm hover:shadow-md transition-shadow text-left">
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
                  users={users} 
                  loading={loading} 
                  setActiveTab={setActiveTab} 
                  navigate={navigate} 
                />
              )}

              {activeTab === "users" && (
                <AdminUsers 
                  users={users} 
                  totalUserCount={totalUserCount} 
                  loading={loading} 
                  onUserUpdate={fetchUsersAndStats}
                />
              )}

              {activeTab === "papers" && (
                <AdminPapers 
                  onPaperUpdate={fetchUsersAndStats}
                />
              )}

              {activeTab === "notices" && (
                <AdminNotices 
                  onNoticeUpdate={fetchUsersAndStats}
                />
              )}

              {activeTab === "tickets" && (
                <AdminTickets />
              )}

              {activeTab === "analytics" && (
                <AdminAnalytics 
                  stats={{
                    totalPapers: stats.totalPapers,
                    pendingApprovals: stats.pendingPapers,
                    approvedPapers: stats.totalPapers - stats.pendingPapers,
                    totalUsers: stats.totalUsers,
                    todayUploads: stats.todayRegistrations,
                    totalDownloads: 0
                  }} 
                  loading={loading} 
                />
              )}
            </motion.div>
          </AnimatePresence>

        </main>
      </div>
    </div>
  );
}