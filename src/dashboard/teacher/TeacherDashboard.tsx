// src/dashboard/teacher/TeacherDashboard.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/ProfileContext";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import AvatarInitials from "../../components/common/AvatarInitials";
import Backendless from "backendless";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "../../components/ui/Card";
import { 
  FileText, CheckCircle, Clock, TrendingUp, Sparkles, 
  ArrowLeft, LogOut, Edit3, Settings, HelpCircle, Activity, 
  PlusCircle, BookOpen, AlertCircle, Users, BarChart3, Download, Eye, Award,
  ChevronRight, Search, Mail, Building, Calendar, GraduationCap
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
  
  // High-fidelity search filter for students list
  const [studentSearchTerm, setStudentSearchTerm] = useState("");

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
      const userId = user.id || user.objectId;
      const queryBuilder = Backendless.DataQueryBuilder.create();
      queryBuilder.setWhereClause(`ownerId = '${userId}'`);
      queryBuilder.setSortBy(["uploadedAt DESC"]);

      const data: Paper[] = await Backendless.Data.of("PastPapers").find(queryBuilder);
      setPapers(data);
    } catch (error: any) {
      console.error("Error fetching papers:", error);
      toast.error("Failed to fetch papers");
    }
  };

  const fetchStudents = async () => {
    try {
      const queryBuilder = Backendless.DataQueryBuilder.create();
      queryBuilder.setWhereClause("role = 'student' OR role IS NULL");
      queryBuilder.setSortBy(["created DESC"]);
      queryBuilder.setPageSize(30);

      const data: Student[] = await Backendless.Data.of("Users").find(queryBuilder);
      setStudents(data);
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

  return (
    <div className="min-h-screen bg-slate-50/30 pb-16 relative">
      
      {/* Background decoration glows */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-24 left-10 w-96 h-96 bg-indigo-200/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Floating Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 shadow-sm relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-lg font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent flex items-center gap-2 justify-center sm:justify-start">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                Teacher Dashboard Portal
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Welcome back, {teacherName}
              </p>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 font-bold text-xs px-4 py-2.5 rounded-xl transition-all duration-300 shadow-sm cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        
        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Identity & Quick Actions */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Identity Card */}
            <Card className="border border-slate-200/60 shadow-premium bg-white rounded-3xl p-1">
              <CardContent className="p-6 text-center space-y-5">
                
                {/* Circular Gradient Avatar */}
                <div className="relative w-24 h-24 mx-auto flex items-center justify-center rounded-full p-1 bg-gradient-to-tr from-emerald-500 via-indigo-600 to-purple-650 shadow-lg">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center border-2 border-white shadow-inner">
                    <span className="text-2xl font-black text-white tracking-tight">
                      {getInitials(teacherName)}
                    </span>
                  </div>
                  <div className="absolute bottom-0 right-0 w-7 h-7 bg-indigo-650 rounded-full border-4 border-white flex items-center justify-center" title="Verified Instructor">
                    <CheckCircle className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>

                {/* Identity Name & Badges */}
                <div className="space-y-1.5">
                  <h3 className="text-lg font-extrabold text-slate-800 leading-tight">
                    {profileLoading ? (
                      <div className="h-5 bg-slate-200 rounded w-1/2 mx-auto animate-pulse" />
                    ) : (
                      teacherName
                    )}
                  </h3>
                  <span className="px-3 py-1 rounded-full border border-indigo-100 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider inline-block">
                    Syllabus Instructor 🏫
                  </span>
                </div>

                {/* Metadata list */}
                <div className="border-t border-slate-100 pt-4 space-y-3 text-left">
                  <div className="flex items-center gap-3 p-3 bg-slate-50/70 border border-slate-100 rounded-2xl">
                    <Mail className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest">Email</span>
                      <span className="text-xs font-bold text-slate-700 break-all block">{profile?.email || user?.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50/70 border border-slate-100 rounded-2xl">
                    <Building className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest">Institution</span>
                      {profileLoading ? (
                        <div className="h-4 w-28 bg-slate-200 animate-pulse rounded-md mt-1" />
                      ) : (
                        <span className="text-xs font-bold text-slate-700 truncate block">{profile?.college || "Not specified"}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50/70 border border-slate-100 rounded-2xl">
                    <GraduationCap className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest">Contributions</span>
                      <span className="text-xs font-bold text-indigo-600 block">
                        {loading ? (
                          <div className="h-4 w-12 bg-slate-200 animate-pulse rounded mt-1" />
                        ) : (
                          `${stats.totalPapers} Shared Papers`
                        )}
                      </span>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Quick Actions sidebar panel */}
            <Card className="border border-slate-200/60 shadow-premium bg-white rounded-3xl p-1">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest border-b border-slate-50 pb-2">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => navigate("/upload-paper")}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 text-white p-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-3 border-0 cursor-pointer font-bold text-xs group"
                  >
                    <PlusCircle className="w-4 h-4 text-yellow-350 transition-transform group-hover:scale-110" />
                    <span>Upload New Paper</span>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab("papers")}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 p-4 rounded-2xl transition-all flex items-center justify-center gap-3 cursor-pointer font-bold text-xs group"
                  >
                    <FileText className="w-4 h-4 text-indigo-600 transition-transform group-hover:scale-110" />
                    <span>Review Contributed Papers</span>
                  </button>

                  <button 
                    onClick={() => navigate("/past-papers")}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 p-4 rounded-2xl transition-all flex items-center justify-center gap-3 cursor-pointer font-bold text-xs group"
                  >
                    <BookOpen className="w-4 h-4 text-purple-650 transition-transform group-hover:scale-110" />
                    <span>Browse Resource Bank</span>
                  </button>
                </div>
              </CardContent>
            </Card>

          </aside>

          {/* RIGHT COLUMN: Stats Row, Tabs, Tab Contents */}
          <main className="lg:col-span-8 space-y-6">
            
            {/* Greeting Banner */}
            <div className="bg-gradient-to-r from-[#1e1b4b] via-indigo-900 to-violet-950 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="absolute right-0 top-0 w-44 h-44 bg-white/5 rounded-full blur-2xl pointer-events-none" />
              <div>
                <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-yellow-300 text-[9px] font-extrabold uppercase tracking-widest inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Academic Portal
                </span>
                <h2 className="text-2xl sm:text-3xl font-black mt-2">Instructor Workspace</h2>
                <p className="text-xs text-indigo-200/80 font-medium mt-1 leading-relaxed max-w-md">
                  Contribute exam questionnaires, track student review downloads, and manage syllabus assets for your institution.
                </p>
              </div>
              <button
                onClick={() => navigate("/upload-paper")}
                className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:brightness-110 text-slate-900 font-extrabold text-xs px-5 py-3 rounded-xl shadow-md border-0 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap self-start sm:self-center"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Upload Paper</span>
              </button>
            </div>

            {/* Stats Cards grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { title: "Total Papers", value: stats.totalPapers, icon: FileText, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
                { title: "Approved", value: stats.approvedPapers, icon: CheckCircle, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
                { title: "Pending", value: stats.pendingPapers, icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-100" },
                { title: "Downloads", value: stats.totalDownloads, icon: Download, color: "text-blue-600 bg-blue-50 border-blue-100" },
                { title: "Weekly Uploads", value: stats.thisWeekUploads, icon: TrendingUp, color: "text-purple-600 bg-purple-50 border-purple-100" }
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

            {/* Navigation Tabs Bar */}
            <div className="bg-white/80 border border-slate-200/50 shadow-sm backdrop-blur-md rounded-2xl p-1.5 flex flex-wrap gap-2 w-fit">
              {[
                { id: "overview", label: "Overview", icon: Activity },
                { id: "papers", label: "My Papers", icon: FileText },
                { id: "students", label: "Students List", icon: Users },
                { id: "analytics", label: "Analytics Panel", icon: BarChart3 },
                { id: "profile", label: "Institution Info", icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border-0 flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab content panel wrapper */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                
                {/* Tab: Overview (Summary widgets) */}
                {activeTab === "overview" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Academic Actions links */}
                    <Card className="border border-slate-200/60 shadow-premium bg-white rounded-3xl p-1">
                      <CardContent className="p-6 space-y-4">
                        <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-50 pb-2">Academic Actions</h3>
                        <div className="space-y-3">
                          <button
                            onClick={() => navigate("/upload-paper")}
                            className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 p-3.5 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-700 transition-all cursor-pointer group"
                          >
                            <span className="flex items-center gap-2">
                              <PlusCircle className="w-4 h-4 text-indigo-650" />
                              Submit a Past Paper
                            </span>
                            <ChevronRight className="w-4 h-4 opacity-50 group-hover:translate-x-0.5 transition-transform" />
                          </button>

                          <button
                            onClick={() => setActiveTab("papers")}
                            className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 p-3.5 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-700 transition-all cursor-pointer group"
                          >
                            <span className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-purple-600" />
                              View Your Upload History
                            </span>
                            <ChevronRight className="w-4 h-4 opacity-50 group-hover:translate-x-0.5 transition-transform" />
                          </button>

                          <button
                            onClick={() => navigate("/past-papers")}
                            className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 p-3.5 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-700 transition-all cursor-pointer group"
                          >
                            <span className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-emerald-600" />
                              Access past questions library
                            </span>
                            <ChevronRight className="w-4 h-4 opacity-50 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recent Uploads Queue card */}
                    <Card className="border border-slate-200/60 shadow-premium bg-white rounded-3xl p-1">
                      <CardContent className="p-6 space-y-4">
                        <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-50 pb-2">Recent Contributions</h3>
                        <div className="space-y-3.5 max-h-[170px] overflow-y-auto pr-1">
                          {loading ? (
                            [1, 2, 3].map((i) => (
                              <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse">
                                <div className="w-8 h-8 bg-slate-200 rounded-lg flex-shrink-0" />
                                <div className="flex-1 space-y-1.5">
                                  <div className="h-3 bg-slate-200 rounded w-2/3" />
                                  <div className="h-2 bg-slate-150 rounded w-1/3" />
                                </div>
                                <div className="h-5 bg-slate-200 rounded-full w-12" />
                              </div>
                            ))
                          ) : papers.length > 0 ? (
                            papers.slice(0, 4).map((paper) => (
                              <div key={paper.objectId} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="w-8 h-8 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-black text-xs flex-shrink-0">
                                  {paper.title.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-bold text-slate-800 text-xs truncate leading-snug">{paper.title}</p>
                                  <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">{new Date(paper.uploadedAt).toLocaleDateString()}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold flex-shrink-0 border ${
                                  paper.approved 
                                    ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                                    : "bg-amber-50 border-amber-100 text-amber-700"
                                }`}>
                                  {paper.approved ? "Live" : "Review"}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8">
                              <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <FileText className="w-5 h-5 text-slate-400" />
                              </div>
                              <p className="text-xs text-slate-500 font-bold">No papers uploaded yet.</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                  </div>
                )}

                {/* Tab: My Papers Uploaded grid */}
                {activeTab === "papers" && (
                  <Card className="border border-slate-200/60 shadow-premium bg-white rounded-3xl p-1">
                    <CardContent className="p-6 sm:p-8">
                      <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4 flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 bg-purple-50 rounded-2xl flex items-center justify-center border border-purple-100">
                            <FileText className="w-5.5 h-5.5 text-purple-650" />
                          </div>
                          <div>
                            <h2 className="text-base font-extrabold text-slate-805">My Uploaded Papers</h2>
                            <p className="text-xs font-semibold text-slate-400 mt-0.5">Manage course resources shared by your account</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => navigate("/upload-paper")}
                          className="bg-gradient-to-r from-indigo-600 to-purple-650 hover:brightness-110 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md border-0 transition-all cursor-pointer"
                        >
                          Upload New
                        </button>
                      </div>

                      {loading ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="border border-slate-150 rounded-2xl p-5 bg-white animate-pulse space-y-4">
                              <div className="h-4 bg-slate-200 rounded w-2/3" />
                              <div className="h-3 bg-slate-150 rounded w-1/3" />
                              <div className="h-4 bg-slate-200 rounded w-1/2" />
                            </div>
                          ))}
                        </div>
                      ) : papers.length > 0 ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                          {papers.map((paper) => (
                            <div
                              key={paper.objectId}
                              className="border border-slate-100 rounded-2xl p-5 hover:border-indigo-300 transition-all bg-gradient-to-br from-white to-slate-50 flex flex-col justify-between hover:shadow-sm"
                            >
                              <div>
                                <h3 className="text-sm font-bold text-slate-800 mb-2 line-clamp-2 leading-relaxed">{paper.title}</h3>
                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-4">
                                  <Download className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{paper.downloads || 0} downloads logged</span>
                                </div>
                                
                                <div className="space-y-1.5 text-xs font-semibold text-slate-655 border-t border-slate-50 pt-3 mb-4">
                                  <div className="flex justify-between">
                                    <span className="opacity-70">Subject:</span>
                                    <span className="font-bold text-slate-800 truncate max-w-[120px]">{paper.subject}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="opacity-70">Semester:</span>
                                    <span className="font-bold text-slate-800">Sem {paper.semester}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="opacity-70">Exam Type:</span>
                                    <span className="font-bold text-slate-800">{paper.examType}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                  paper.approved 
                                    ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                                    : "bg-amber-50 border-amber-100 text-amber-700"
                                }`}>
                                  {paper.approved ? "Live/Approved" : "Pending Review"}
                                </span>
                                <button 
                                  onClick={() => window.open(paper.fileUrl, "_blank")}
                                  className="text-indigo-600 hover:text-indigo-800 font-bold text-xs flex items-center gap-1 bg-transparent border-0 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View file</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-slate-400" />
                          </div>
                          <h3 className="text-sm font-bold text-slate-805 mb-1.5">No uploads discovered</h3>
                          <p className="text-xs text-slate-500 mb-6 font-semibold max-w-sm mx-auto leading-relaxed">No past papers uploaded yet under this account.</p>
                          <button 
                            onClick={() => navigate("/upload-paper")}
                            className="bg-gradient-to-r from-indigo-600 to-purple-650 hover:brightness-110 text-white font-bold text-xs px-8 py-3 rounded-xl shadow-md border-0 transition-all cursor-pointer"
                          >
                            Upload Your First Paper
                          </button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Tab: Registered Students List (With filter search input) */}
                {activeTab === "students" && (
                  <Card className="border border-slate-200/60 shadow-premium bg-white rounded-3xl p-1">
                    <CardContent className="p-6 sm:p-8">
                      
                      {/* Title and search header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-50 pb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
                            <Users className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div>
                            <h2 className="text-lg font-bold text-slate-805">Syllabus Registered Students</h2>
                            <p className="text-xs font-semibold text-slate-455">Overview of active student community profiles</p>
                          </div>
                        </div>

                        {/* Interactive search filter */}
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400" />
                          </span>
                          <input
                            type="text"
                            placeholder="Search students..."
                            value={studentSearchTerm}
                            onChange={(e) => setStudentSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-60 focus:bg-white transition-all shadow-inner"
                          />
                        </div>

                      </div>

                      {/* Students grid */}
                      {loading ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse flex items-center gap-3.5">
                              <div className="w-11 h-11 bg-slate-200 rounded-full flex-shrink-0" />
                              <div className="flex-1 space-y-1.5">
                                <div className="h-3.5 bg-slate-200 rounded w-2/3" />
                                <div className="h-2.5 bg-slate-150 rounded w-1/2" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : filteredStudents.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {filteredStudents.map((student) => (
                            <div key={student.objectId} className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50 hover:border-slate-200 transition-all flex items-center gap-3.5">
                              <div className="w-11 h-11 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-extrabold text-sm shadow-sm flex-shrink-0">
                                {(student.name || student.email).charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-slate-800 text-sm truncate">{student.name || "Student Contributor"}</p>
                                <p className="text-xs text-slate-500 truncate font-semibold">{student.email}</p>
                                {student.semester && (
                                  <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide mt-0.5">Semester {student.semester}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10 text-slate-400 font-bold text-xs uppercase tracking-wider">
                          No student profiles match filter
                        </div>
                      )}

                    </CardContent>
                  </Card>
                )}

                {/* Tab: Analytics Progress */}
                {activeTab === "analytics" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Progress bars metrics */}
                    <Card className="border border-slate-200/60 shadow-premium bg-white rounded-3xl p-1">
                      <CardContent className="p-6">
                        <h3 className="text-base font-bold text-slate-805 mb-6 flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-indigo-600" />
                          Approval Progress Metrics
                        </h3>
                        <div className="space-y-6">
                          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold">
                            <p className="text-slate-500 mb-2 font-bold uppercase tracking-wider">Approval Acceptance Rate</p>
                            <div className="flex items-center gap-4">
                              <div className="flex-1 bg-slate-200 rounded-full h-2.5">
                                <div 
                                  className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2.5 rounded-full transition-all"
                                  style={{ width: `${stats.totalPapers > 0 ? (stats.approvedPapers / stats.totalPapers) * 100 : 0}%` }}
                                ></div>
                              </div>
                              <span className="font-extrabold text-slate-800 text-sm">
                                {loading ? (
                                  <div className="h-4 w-8 bg-slate-200 animate-pulse rounded" />
                                ) : (
                                  `${stats.totalPapers > 0 ? Math.round((stats.approvedPapers / stats.totalPapers) * 100) : 0}%`
                                )}
                              </span>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold">
                            <p className="text-slate-500 mb-1 font-bold uppercase tracking-wider">Average Downloads per paper</p>
                            {loading ? (
                              <div className="h-6 w-12 bg-slate-200 animate-pulse rounded mt-1.5" />
                            ) : (
                              <p className="text-2xl font-black text-slate-800 mt-1">
                                {stats.approvedPapers > 0 ? Math.round(stats.totalDownloads / stats.approvedPapers) : 0}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Impact Stats widget */}
                    <Card className="border border-slate-200/60 shadow-premium bg-white rounded-3xl p-1">
                      <CardContent className="p-6">
                        <h3 className="text-base font-bold text-slate-855 mb-6 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-indigo-600" />
                          Impact Statistics Overview
                        </h3>
                        <div className="space-y-4 text-xs font-semibold text-slate-700">
                          <div className="flex items-center justify-between p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                            <span>Total Papers Contributed</span>
                            <span className="text-emerald-700 font-extrabold text-lg">
                              {loading ? <div className="h-6 w-8 bg-slate-200 animate-pulse rounded" /> : stats.totalPapers}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                            <span>Total Student Downloads</span>
                            <span className="text-indigo-800 font-extrabold text-lg">
                              {loading ? <div className="h-6 w-12 bg-slate-200 animate-pulse rounded" /> : stats.totalDownloads}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-purple-50/50 border border-purple-100 rounded-2xl">
                            <span>Weekly Upload Activity</span>
                            <span className="text-purple-700 font-extrabold text-lg">
                              {loading ? <div className="h-6 w-8 bg-slate-200 animate-pulse rounded" /> : stats.thisWeekUploads}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                  </div>
                )}

                {/* Tab: Institution Account Info Settings */}
                {activeTab === "profile" && (
                  <Card className="border border-slate-200/60 shadow-premium bg-white rounded-3xl p-1">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-4 mb-8 border-b border-slate-50 pb-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
                          <Settings className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-slate-805">Teacher Account Settings</h2>
                          <p className="text-xs font-semibold text-slate-455">Manage teacher profile affiliation records</p>
                        </div>
                      </div>

                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Settings className="w-8 h-8 text-indigo-600 animate-spin-slow" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 mb-1.5">Profile Management</h3>
                        <p className="text-xs text-slate-500 font-semibold mb-6">Interactive profile modifications are administered by institution moderators.</p>
                        <p className="text-xs text-indigo-600 font-bold">Contact support@bcsithub.com for credential changes.</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

              </motion.div>
            </AnimatePresence>
          </main>
        </div>

      </div>
    </div>
  );
};

export default TeacherDashboard;