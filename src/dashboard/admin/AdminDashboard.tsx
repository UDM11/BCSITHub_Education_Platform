import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../../components/ui/Button";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Backendless from "backendless";
import { PaperCard } from "../../components/Notes/PaperCard";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "../../components/ui/Card";
import { 
  FileText, CheckCircle, Clock, TrendingUp, Sparkles, 
  ArrowLeft, LogOut, Settings, HelpCircle, Activity, 
  PlusCircle, BookOpen, AlertCircle, Users, BarChart3, Download, Eye, ShieldAlert,
  Shield, CheckSquare, Trash2, Database, Network
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
  const [activeTab, setActiveTab] = useState('overview');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
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
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnapprovedPapers = async () => {
    try {
      const queryBuilder = Backendless.DataQueryBuilder.create();
      queryBuilder.setWhereClause("approved = false");
      queryBuilder.setSortBy(["uploadedAt DESC"]);

      const data: Paper[] = await Backendless.Data.of("PastPapers").find(queryBuilder);
      setPapers(data);
    } catch (error: any) {
      console.error("Error fetching papers:", error);
      toast.error(error.message || "Failed to fetch papers");
    }
  };

  const fetchUsers = async () => {
    try {
      // First get total count
      const totalCount = await Backendless.Data.of("Users").getObjectCount();
      setTotalUserCount(totalCount);
      
      // Then fetch first 50 users for display
      const queryBuilder = Backendless.DataQueryBuilder.create();
      queryBuilder.setSortBy(["created DESC"]);
      queryBuilder.setPageSize(50);

      const data: User[] = await Backendless.Data.of("Users").find(queryBuilder);
      setUsers(data);
    } catch (error: any) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const [allPapers, totalUsersCount] = await Promise.all([
        Backendless.Data.of("PastPapers").find(),
        Backendless.Data.of("Users").getObjectCount()
      ]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayUploads = allPapers.filter((paper: any) => {
        const uploadDate = new Date(paper.uploadedAt);
        return uploadDate >= today;
      }).length;

      const totalDownloads = allPapers.reduce((sum: number, paper: any) => sum + (paper.downloads || 0), 0);

      setStats({
        totalPapers: allPapers.length,
        pendingApprovals: allPapers.filter((p: any) => !p.approved).length,
        approvedPapers: allPapers.filter((p: any) => p.approved).length,
        totalUsers: totalUsersCount,
        todayUploads,
        totalDownloads
      });
    } catch (error: any) {
      console.error("Error fetching stats:", error);
    }
  };

  const approvePaper = async (id: string) => {
    try {
      await Backendless.Data.of("PastPapers").save({
        objectId: id,
        approved: true,
      });
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
      const url = new URL(selectedPaper.fileUrl);
      const filePath = decodeURIComponent(
        url.pathname.replace(/^\/[^/]+\/[^/]+\/files/, "")
      );

      await Backendless.Files.remove(filePath);
      await Backendless.Data.of("PastPapers").remove(selectedPaper.objectId);

      toast.success("Paper rejected and deleted successfully!");
      await fetchAllData();
    } catch (error: any) {
      console.error("Error rejecting paper:", error);
      toast.error(error.message || "Failed to delete paper");
    } finally {
      setSelectedPaper(null);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50/30 px-4">
        <div className="text-center max-w-sm mx-auto p-4">
          <Card hover={false} className="border border-slate-105 shadow-premium bg-white/90 backdrop-blur-md rounded-2xl">
            <CardContent className="p-8">
              <div className="w-14 h-14 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-7 h-7 text-rose-600 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-slate-805 mb-1.5">Access Denied</h3>
              <p className="text-xs font-semibold text-slate-500 mb-6">Administrator privileges are required to access this control center.</p>
              <Button onClick={() => navigate('/signin')} className="w-full bg-indigo-650 text-white font-bold border-0">
                Go to Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50/30">
        <div className="text-center">
          <div className="relative mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-100 border-t-indigo-650 mx-auto"></div>
          </div>
          <p className="text-xs font-bold text-slate-455 uppercase tracking-widest animate-pulse">Loading Control Center...</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <motion.div
      whileHover={{ y: -3 }}
      className={`bg-gradient-to-br ${color} p-5 rounded-2xl shadow-md border-0 text-white relative overflow-hidden`}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl" />
      <div className="flex items-center justify-between relative z-10">
        <div className="flex-1">
          <p className="text-white/80 text-[10px] font-bold uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-black mt-1.5">{value}</p>
          {subtitle && <p className="text-white/70 text-[10px] font-bold mt-1 truncate">{subtitle}</p>}
        </div>
        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 text-white flex-shrink-0 ml-3">
          {icon}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-slate-50/30">
      {/* Header */}
      <div className="bg-white/85 backdrop-blur-md border-b border-slate-105 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4.5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-lg font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-805 bg-clip-text text-transparent flex items-center gap-2 justify-center sm:justify-start">
                <Shield className="w-5 h-5 text-indigo-600 animate-pulse" />
                Admin Control Center
              </h1>
              <p className="text-[10px] font-bold text-slate-455 uppercase tracking-widest mt-0.5">Pokhara University Core Platform Admin</p>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 font-bold text-xs px-4 py-2 rounded-xl transition-all duration-300 shadow-sm"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <StatCard
            title="Total Papers"
            value={stats.totalPapers}
            color="from-indigo-650 via-indigo-700 to-indigo-850"
            subtitle="All library assets"
            icon={<FileText className="w-5 h-5" />}
          />
          <StatCard
            title="Pending Review"
            value={stats.pendingApprovals}
            color="from-amber-500 to-orange-600"
            subtitle="Awaiting verify"
            icon={<Clock className="w-5 h-5" />}
          />
          <StatCard
            title="Approved Papers"
            value={stats.approvedPapers}
            color="from-emerald-500 to-teal-650"
            subtitle="Live database"
            icon={<CheckCircle className="w-5 h-5" />}
          />
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            color="from-purple-500 to-purple-600"
            subtitle="Profiles registered"
            icon={<Users className="w-5 h-5" />}
          />
          <StatCard
            title="Today's Uploads"
            value={stats.todayUploads}
            color="from-blue-500 to-indigo-600"
            subtitle="Active sessions"
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <StatCard
            title="Total Downloads"
            value={stats.totalDownloads}
            color="from-pink-500 to-rose-600"
            subtitle="Student downloads"
            icon={<Download className="w-5 h-5" />}
          />
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/80 border border-slate-105 shadow-sm backdrop-blur-md rounded-2xl p-1.5 flex flex-wrap gap-2 w-fit mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
            { id: 'approvals', label: 'Paper Approvals', icon: <CheckSquare className="w-4 h-4" /> },
            { id: 'users', label: 'User Management', icon: <Users className="w-4 h-4" /> },
            { id: 'analytics', label: 'Platform Health', icon: <BarChart3 className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border-0 flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-855 cursor-pointer'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Actions Sidebar */}
                <div>
                  <Card hover={false} className="border border-slate-105 shadow-premium bg-white rounded-2xl">
                    <CardContent className="p-6">
                      <h3 className="text-base font-bold text-slate-805 mb-5 flex items-center gap-2">
                        <Sparkles className="w-4.5 h-4.5 text-indigo-600 animate-spin-slow" />
                        Quick Actions
                      </h3>
                      <div className="space-y-4">
                        <button 
                          onClick={() => setActiveTab('approvals')}
                          className="w-full bg-gradient-to-r from-indigo-600 to-purple-650 hover:brightness-110 text-white p-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-3 border-0 cursor-pointer font-bold text-xs"
                        >
                          <CheckSquare className="w-4.5 h-4.5 text-yellow-350" />
                          <span>Review Papers ({stats.pendingApprovals})</span>
                        </button>
                        
                        <button 
                          onClick={() => setActiveTab('users')}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 p-4 rounded-2xl transition-all flex items-center justify-center gap-3 cursor-pointer font-bold text-xs"
                        >
                          <Users className="w-4.5 h-4.5 text-indigo-600" />
                          <span>Manage User Accounts</span>
                        </button>

                        <button 
                          onClick={() => navigate('/past-papers')}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 p-4 rounded-2xl transition-all flex items-center justify-center gap-3 cursor-pointer font-bold text-xs"
                        >
                          <BookOpen className="w-4.5 h-4.5 text-purple-600" />
                          <span>Browse Resource Bank</span>
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity List */}
                <div className="lg:col-span-2">
                  <Card hover={false} className="border border-slate-105 shadow-premium bg-white rounded-2xl">
                    <CardContent className="p-8">
                      <h3 className="text-base font-bold text-slate-850 mb-6 flex items-center gap-2">
                        <Activity className="w-4.5 h-4.5 text-emerald-600" />
                        Awaiting Verification Approvals Queue
                      </h3>

                      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                        {papers.slice(0, 8).map((paper) => (
                          <div key={paper.objectId} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100/50 hover:border-slate-205 transition-all">
                            <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-indigo-605 font-black text-sm flex-shrink-0">
                              {paper.title.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-slate-800 text-xs truncate leading-snug">{paper.title}</p>
                              <p className="text-[10px] text-slate-455 font-bold uppercase mt-0.5">by {paper.uploadedBy} • {new Date(paper.uploadedAt).toLocaleDateString()}</p>
                            </div>
                            <span className="px-2.5 py-0.5 border border-amber-100 bg-amber-50 rounded-full text-[10px] font-bold text-amber-700 flex-shrink-0">
                              Pending Review
                            </span>
                          </div>
                        ))}
                        {papers.length === 0 && (
                          <div className="text-center py-12">
                            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                              <CheckCircle className="w-6 h-6 text-emerald-600" />
                            </div>
                            <p className="text-xs text-slate-500 font-semibold">No pending papers in verification queue.</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'approvals' && (
              <Card hover={false} className="border border-slate-105 shadow-premium bg-white rounded-2xl">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-4 flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100">
                        <Clock className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-805">Review Paper Submissions</h2>
                        <p className="text-xs font-semibold text-slate-455">Verify course curriculum exams and resource links</p>
                      </div>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-2 text-xs font-bold text-amber-700">
                      <span>{papers.length} pending reviews</span>
                    </div>
                  </div>

                  {papers.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {papers.map((paper) => (
                        <div
                          key={paper.objectId}
                          className="border border-slate-105 rounded-2xl p-5 hover:border-indigo-200 transition-all bg-gradient-to-br from-white to-slate-50/50 flex flex-col justify-between"
                        >
                          <div>
                            <div className="mb-4">
                              <PaperCard
                                paper={{
                                  objectId: paper.objectId,
                                  title: paper.title,
                                  fileUrl: paper.fileUrl,
                                  downloads: paper.downloads || 0,
                                }}
                              />
                            </div>
                            
                            <div className="space-y-2 text-xs font-semibold text-slate-655 border-t border-slate-50 pt-3">
                              <div className="flex items-center gap-1.5 p-2 bg-indigo-50/50 border border-indigo-100/50 rounded-xl text-[10px] font-bold text-indigo-805 truncate">
                                <Users className="w-3.5 h-3.5" />
                                <span>Uploaded by: {paper.uploadedBy || "Unknown"}</span>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 text-[10px]">
                                <div className="p-2 bg-slate-50 rounded-xl">
                                  <span className="opacity-70">Subject:</span>
                                  <p className="font-bold text-slate-800 truncate">{paper.subject}</p>
                                </div>
                                <div className="p-2 bg-slate-50 rounded-xl">
                                  <span className="opacity-70">Semester:</span>
                                  <p className="font-bold text-slate-800">Sem {paper.semester}</p>
                                </div>
                              </div>
                              
                              <div className="p-2 bg-slate-50 rounded-xl text-[10px]">
                                <span className="opacity-70">College:</span>
                                <p className="font-bold text-slate-800 truncate">{paper.college}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2.5 mt-5 border-t border-slate-50 pt-4">
                            <button
                              onClick={() => approvePaper(paper.objectId)}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm border-0 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                            >
                              <CheckCircle className="w-4 h-4 text-white" />
                              <span>Approve resource</span>
                            </button>
                            <button
                              onClick={() => handleRejectClick(paper)}
                              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm border-0 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                            >
                              <Trash2 className="w-4 h-4 text-white" />
                              <span>Reject & Delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-emerald-650 animate-bounce" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-805 mb-1.5">All Caught Up!</h3>
                      <p className="text-xs text-slate-500 font-semibold">Verification queue has been completely cleared.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'users' && (
              <Card hover={false} className="border border-slate-105 shadow-premium bg-white rounded-2xl">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-4 flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center border border-purple-100">
                        <Users className="w-6 h-6 text-purple-650" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-805">Active Platform User base</h2>
                        <p className="text-xs font-semibold text-slate-455">Monitor student registrations and system credentials</p>
                      </div>
                    </div>
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 text-xs font-bold text-indigo-700">
                      <span>{totalUserCount} total profiles</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto max-h-[400px] overflow-y-auto pr-1">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="p-4 font-bold text-slate-800 uppercase tracking-wider text-[10px]">User Profile</th>
                          <th className="p-4 font-bold text-slate-800 uppercase tracking-wider text-[10px]">Email Address</th>
                          <th className="p-4 font-bold text-slate-800 uppercase tracking-wider text-[10px]">Access Role</th>
                          <th className="p-4 font-bold text-slate-800 uppercase tracking-wider text-[10px]">Joined Date</th>
                          <th className="p-4 font-bold text-slate-800 uppercase tracking-wider text-[10px]">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.objectId} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-bold text-slate-705">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-extrabold text-xs shadow-inner">
                                  {(user.name || user.email).charAt(0).toUpperCase()}
                                </div>
                                <span className="truncate max-w-[120px]">{user.name || 'User'}</span>
                              </div>
                            </td>
                            <td className="p-4 font-semibold text-slate-600 break-all">{user.email}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 border rounded-full text-[10px] font-bold ${
                                user.role === 'admin' 
                                  ? 'bg-rose-50 border-rose-100 text-rose-700' 
                                  : user.role === 'teacher'
                                  ? 'bg-purple-50 border-purple-100 text-purple-700'
                                  : 'bg-indigo-50 border-indigo-100 text-indigo-700'
                              }`}>
                                {user.role || 'student'}
                              </span>
                            </td>
                            <td className="p-4 font-semibold text-slate-500">{new Date(user.created).toLocaleDateString()}</td>
                            <td className="p-4">
                              <span className="px-2.5 py-0.5 border border-emerald-100 bg-emerald-50 rounded-full text-[10px] font-bold text-emerald-700">
                                Active Profile
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'analytics' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Platform Health Metrics */}
                <Card hover={false} className="border border-slate-105 shadow-premium bg-white rounded-2xl">
                  <CardContent className="p-6">
                    <h3 className="text-base font-bold text-slate-805 mb-6 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-indigo-650" />
                      Platform Metrics & Approvals
                    </h3>

                    <div className="space-y-6">
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold">
                        <p className="text-slate-500 mb-2 font-bold uppercase tracking-wider">Approval Acceptance Rate</p>
                        <div className="flex items-center gap-4">
                          <div className="flex-1 bg-slate-200 rounded-full h-2.5">
                            <div 
                              className="bg-gradient-to-r from-indigo-600 to-purple-650 h-2.5 rounded-full transition-all"
                              style={{ width: `${stats.totalPapers > 0 ? (stats.approvedPapers / stats.totalPapers) * 100 : 0}%` }}
                            ></div>
                          </div>
                          <span className="font-extrabold text-slate-800 text-sm">
                            {stats.totalPapers > 0 ? Math.round((stats.approvedPapers / stats.totalPapers) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold">
                        <p className="text-slate-500 mb-1 font-bold uppercase tracking-wider">Average Downloads per paper</p>
                        <p className="text-2xl font-black text-slate-800 mt-1">
                          {stats.approvedPapers > 0 ? Math.round(stats.totalDownloads / stats.approvedPapers) : 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* System Nodes Health */}
                <Card hover={false} className="border border-slate-105 shadow-premium bg-white rounded-2xl">
                  <CardContent className="p-6">
                    <h3 className="text-base font-bold text-slate-805 mb-6 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-emerald-650" />
                      Network System Health
                    </h3>
                    <div className="space-y-4 text-xs font-semibold text-slate-700">
                      <div className="flex items-center justify-between p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                        <span className="flex items-center gap-2">
                          <Database className="w-4.5 h-4.5 text-emerald-600" />
                          Database connection Status
                        </span>
                        <span className="flex items-center gap-2 text-emerald-705 font-bold uppercase tracking-wide">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                          Online
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                        <span className="flex items-center gap-2">
                          <Network className="w-4.5 h-4.5 text-emerald-600" />
                          File Storage server
                        </span>
                        <span className="flex items-center gap-2 text-emerald-705 font-bold uppercase tracking-wide">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                          Operational
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                        <span className="flex items-center gap-2">
                          <Activity className="w-4.5 h-4.5 text-indigo-650" />
                          API Response times
                        </span>
                        <span className="text-indigo-805 font-bold">~150ms latency</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Reject Paper"
        message="Are you sure you want to reject this paper? This will permanently delete the file and its record."
        onConfirm={handleConfirmReject}
        onCancel={() => {
          setConfirmOpen(false);
          setSelectedPaper(null);
        }}
      />
    </div>
  );
}