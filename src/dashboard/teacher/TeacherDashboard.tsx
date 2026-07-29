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
  PlusCircle, BookOpen, AlertCircle, Users, BarChart3, Download, Eye, Award
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
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user?.role !== 'teacher') {
      navigate('/dashboard');
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
      console.error('Error fetching data:', error);
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
      queryBuilder.setPageSize(20);

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

  if (!user || user.role !== 'teacher') {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50/30 px-4">
        <div className="text-center max-w-sm mx-auto p-4">
          <Card hover={false} className="border border-slate-105 shadow-premium bg-white/90 backdrop-blur-md rounded-2xl">
            <CardContent className="p-8">
              <div className="w-14 h-14 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-7 h-7 text-rose-600 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-slate-805 mb-1.5">Access Denied</h3>
              <p className="text-xs font-semibold text-slate-500 mb-6">Teacher privileges are required to view this administrative board.</p>
              <Button onClick={() => navigate('/signin')} className="w-full bg-indigo-650 text-white font-bold border-0">
                Go to Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50/30">
        <div className="text-center">
          <div className="relative mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-100 border-t-indigo-650 mx-auto"></div>
          </div>
          <p className="text-xs font-bold text-slate-455 uppercase tracking-widest animate-pulse">Loading Teacher Workspace...</p>
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
              <h1 className="text-lg font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-805 bg-clip-text text-transparent">
                Teacher Dashboard Portal
              </h1>
              <p className="text-[10px] font-bold text-slate-455 uppercase tracking-widest mt-0.5">Welcome back, {profile?.name || user?.email?.split('@')[0]}</p>
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
        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <StatCard
            title="Total Papers"
            value={stats.totalPapers}
            color="from-indigo-650 via-indigo-700 to-indigo-850"
            subtitle="Uploaded by you"
            icon={<FileText className="w-5 h-5" />}
          />
          <StatCard
            title="Approved"
            value={stats.approvedPapers}
            color="from-emerald-500 to-teal-650"
            subtitle="Live on platform"
            icon={<CheckCircle className="w-5 h-5" />}
          />
          <StatCard
            title="Pending"
            value={stats.pendingPapers}
            color="from-amber-500 to-orange-600"
            subtitle="Awaiting review"
            icon={<Clock className="w-5 h-5" />}
          />
          <StatCard
            title="Downloads"
            value={stats.totalDownloads}
            color="from-blue-500 to-indigo-650"
            subtitle="Student requests"
            icon={<Download className="w-5 h-5" />}
          />
          <StatCard
            title="This Week"
            value={stats.thisWeekUploads}
            color="from-purple-500 to-purple-600"
            subtitle="New contributions"
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <StatCard
            title="Popular"
            value="📄"
            color="from-pink-500 to-rose-600"
            subtitle={stats.popularPaper.length > 15 ? stats.popularPaper.substring(0, 15) + "..." : stats.popularPaper}
            icon={<Award className="w-5 h-5" />}
          />
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/80 border border-slate-105 shadow-sm backdrop-blur-md rounded-2xl p-1.5 flex flex-wrap gap-2 w-fit mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
            { id: 'papers', label: 'My Papers', icon: <FileText className="w-4 h-4" /> },
            { id: 'students', label: 'Students List', icon: <Users className="w-4 h-4" /> },
            { id: 'analytics', label: 'Analytics Panel', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'profile', label: 'Institution Info', icon: <Settings className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border-0 flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-850 cursor-pointer'
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
                        <Sparkles className="w-4.5 h-4.5 text-indigo-600" />
                        Quick Actions
                      </h3>
                      <div className="space-y-4">
                        <button 
                          onClick={() => navigate('/upload-paper')}
                          className="w-full bg-gradient-to-r from-indigo-600 to-purple-650 hover:brightness-110 text-white p-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-3 border-0 cursor-pointer font-bold text-xs"
                        >
                          <PlusCircle className="w-4.5 h-4.5 text-yellow-350 animate-pulse" />
                          <span>Upload New Paper</span>
                        </button>
                        
                        <button 
                          onClick={() => setActiveTab('papers')}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 p-4 rounded-2xl transition-all flex items-center justify-center gap-3 cursor-pointer font-bold text-xs"
                        >
                          <FileText className="w-4.5 h-4.5 text-indigo-600" />
                          <span>Review Contributed Papers</span>
                        </button>

                        <button 
                          onClick={() => navigate('/past-papers')}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 p-4 rounded-2xl transition-all flex items-center justify-center gap-3 cursor-pointer font-bold text-xs"
                        >
                          <BookOpen className="w-4.5 h-4.5 text-purple-600" />
                          <span>View Community Library</span>
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Profile Summary Card */}
                <div className="lg:col-span-2">
                  <Card hover={false} className="border border-slate-105 shadow-premium bg-white rounded-2xl">
                    <CardContent className="p-8">
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        <div className="flex-shrink-0">
                          <AvatarInitials role={user?.role} />
                        </div>
                        <div className="flex-1 text-center sm:text-left w-full">
                          <h3 className="text-xl font-extrabold text-slate-805 mb-4">{profile?.name || 'Academic Instructor'}</h3>
                          <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100/50">
                              <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wider w-24 flex-shrink-0">Email:</span>
                              <span className="text-xs font-bold text-slate-700 break-all">{profile?.email || user?.email}</span>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100/50">
                              <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wider w-24 flex-shrink-0">Institution:</span>
                              <span className="text-xs font-bold text-slate-700">{profile?.college || 'Not specified'}</span>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100/50">
                              <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wider w-24 flex-shrink-0">System Role:</span>
                              <span className="text-xs font-bold text-indigo-650 capitalize">{user?.role || 'Teacher'}</span>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider w-24 flex-shrink-0">Uploads count:</span>
                              <span className="text-xs font-bold text-indigo-805">{stats.totalPapers} Syllabus Papers Shared</span>
                            </div>
                          </div>

                          <button
                            onClick={() => setActiveTab('profile')}
                            className="mt-6 w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-650 hover:brightness-110 text-white font-bold py-3 px-6 rounded-xl shadow-md border-0 transition-all text-xs flex items-center justify-center gap-1.5"
                          >
                            <Settings className="w-4 h-4 text-yellow-350" />
                            <span>Modify Teacher Details</span>
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'papers' && (
              <Card hover={false} className="border border-slate-105 shadow-premium bg-white rounded-2xl">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-4 flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center border border-purple-100">
                        <FileText className="w-6 h-6 text-purple-650" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-805">My Uploaded Papers</h2>
                        <p className="text-xs font-semibold text-slate-455">Manage course resources shared by your account</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate('/upload-paper')}
                      className="bg-gradient-to-r from-indigo-600 to-purple-650 hover:brightness-110 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md border-0 transition-all"
                    >
                      Upload New
                    </button>
                  </div>

                  {papers.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {papers.map((paper) => (
                        <div
                          key={paper.objectId}
                          className="border border-slate-105 rounded-2xl p-5 hover:border-indigo-300 transition-all bg-gradient-to-br from-white to-slate-50/50 flex flex-col justify-between"
                        >
                          <div>
                            <h3 className="text-sm font-bold text-slate-800 mb-2 line-clamp-2 leading-relaxed">{paper.title}</h3>
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-4">
                              <Download className="w-3.5 h-3.5 text-slate-400" />
                              <span>{paper.downloads || 0} downloads logged</span>
                            </div>
                            
                            <div className="space-y-1.5 text-xs font-semibold text-slate-600 border-t border-slate-50 pt-3 mb-4">
                              <div className="flex justify-between">
                                <span className="opacity-70">Subject:</span>
                                <span className="font-bold text-slate-800">{paper.subject}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="opacity-70">Semester:</span>
                                <span className="font-bold text-slate-800">{paper.semester}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="opacity-70">Exam Type:</span>
                                <span className="font-bold text-slate-800">{paper.examType}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              paper.approved 
                                ? 'bg-emerald-50 border border-emerald-100/50 text-emerald-705' 
                                : 'bg-amber-50 border border-amber-100/50 text-amber-705'
                            }`}>
                              {paper.approved ? 'Live/Approved' : 'Pending Review'}
                            </span>
                            <button 
                              onClick={() => window.open(paper.fileUrl, '_blank')}
                              className="text-indigo-650 hover:text-indigo-800 font-bold text-xs flex items-center gap-1 bg-transparent border-0 cursor-pointer"
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
                        onClick={() => navigate('/upload-paper')}
                        className="bg-gradient-to-r from-indigo-600 to-purple-650 hover:brightness-110 text-white font-bold text-xs px-8 py-3 rounded-xl shadow-md border-0 transition-all"
                      >
                        Upload Your First Paper
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'students' && (
              <Card hover={false} className="border border-slate-105 shadow-premium bg-white rounded-2xl">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-8 border-b border-slate-50 pb-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
                      <Users className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-805">Syllabus Registered Students</h2>
                      <p className="text-xs font-semibold text-slate-455">Overview of active student community profiles</p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {students.map((student) => (
                      <div key={student.objectId} className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50 hover:border-slate-205 transition-all flex items-center gap-3.5">
                        <div className="w-11 h-11 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-extrabold text-sm shadow-sm flex-shrink-0">
                          {(student.name || student.email).charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-800 text-sm truncate">{student.name || 'Student Contributor'}</p>
                          <p className="text-xs text-slate-550 truncate font-semibold">{student.email}</p>
                          {student.semester && (
                            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide mt-0.5">Semester {student.semester}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'analytics' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card hover={false} className="border border-slate-105 shadow-premium bg-white rounded-2xl">
                  <CardContent className="p-6">
                    <h3 className="text-base font-bold text-slate-805 mb-6 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-indigo-600 animate-pulse" />
                      Approval Progress metrics
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

                <Card hover={false} className="border border-slate-105 shadow-premium bg-white rounded-2xl">
                  <CardContent className="p-6">
                    <h3 className="text-base font-bold text-slate-805 mb-6 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-indigo-650" />
                      Impact Statistics Overview
                    </h3>
                    <div className="space-y-4 text-xs font-semibold text-slate-700">
                      <div className="flex items-center justify-between p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                        <span>Total Papers Contributed</span>
                        <span className="text-emerald-700 font-extrabold text-lg">{stats.totalPapers}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                        <span>Total Student Downloads</span>
                        <span className="text-indigo-805 font-extrabold text-lg">{stats.totalDownloads}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-purple-50/50 border border-purple-100 rounded-2xl">
                        <span>Weekly Upload Activity</span>
                        <span className="text-purple-700 font-extrabold text-lg">{stats.thisWeekUploads}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'profile' && (
              <Card hover={false} className="border border-slate-105 shadow-premium bg-white rounded-2xl">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-8 border-b border-slate-50 pb-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
                      <Settings className="w-6 h-6 text-indigo-650" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-805">Teacher Account Settings</h2>
                      <p className="text-xs font-semibold text-slate-455">Manage teacher profile affiliation records</p>
                    </div>
                  </div>

                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-55 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Settings className="w-8 h-8 text-indigo-600 animate-spin-slow" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 mb-1.5">Profile Management</h3>
                    <p className="text-xs text-slate-500 font-semibold mb-6">Interactive profile modifications are administered by institution moderators.</p>
                    <p className="text-xs text-indigo-650 font-bold">Contact support@bcsithub.com for credential changes.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TeacherDashboard;