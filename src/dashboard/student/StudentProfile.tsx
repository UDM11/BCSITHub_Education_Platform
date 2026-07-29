import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/ProfileContext";
import AvatarInitials from "../../components/common/AvatarInitials";
import ProfileDetails from "../../components/common/ProfileDetails";
import EditProfileForm from "../../components/common/EditProfileForm";
import { Button } from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import Backendless from "backendless";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "../../components/ui/Card";
import { 
  FileText, CheckCircle, Clock, TrendingUp, Sparkles, 
  ArrowLeft, LogOut, Edit3, Settings, HelpCircle, Activity, 
  PlusCircle, BookOpen, AlertCircle
} from "lucide-react";

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
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalPapers: 0,
    approvedPapers: 0,
    pendingPapers: 0,
    recentActivity: 0
  });

  useEffect(() => {
    const fetchUserPapers = async () => {
      if (!user) return;

      const userId = user.id || user.objectId;
      if (!userId) return;

      setPapersLoading(true);
      try {
        const queryBuilder = Backendless.DataQueryBuilder.create()
          .setWhereClause(`ownerId = '${userId}'`)
          .setSortBy(["uploadedAt DESC"]);

        const fetched = await Backendless.Data.of("PastPapers").find(queryBuilder);

        const mapped = fetched.map((paper: any) => ({
          objectId: paper.objectId,
          title: paper.title,
          uploadedAt: paper.uploadedAt,
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
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user && !profileLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50/30">
        <div className="text-center max-w-sm mx-auto p-4">
          <Card hover={false} className="border border-slate-105 shadow-premium bg-white/90 backdrop-blur-md rounded-2xl">
            <CardContent className="p-8">
              <div className="w-14 h-14 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-7 h-7 text-rose-600 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-slate-805 mb-1.5">Authentication Required</h3>
              <p className="text-xs font-semibold text-slate-500 mb-6">Please sign in to access your customized student profile page dashboard.</p>
              <Button onClick={() => navigate('/signin')} className="w-full bg-indigo-600 text-white font-bold border-0">
                Go to Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (profileLoading || papersLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50/30">
        <div className="text-center">
          <div className="relative mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-100 border-t-indigo-650 mx-auto"></div>
          </div>
          <p className="text-xs font-bold text-slate-455 uppercase tracking-widest animate-pulse">Loading Academic Profile Dashboard...</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon, color }: any) => (
    <motion.div
      whileHover={{ y: -3 }}
      className={`bg-gradient-to-br ${color} p-5 rounded-2xl shadow-md border-0 text-white relative overflow-hidden`}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl" />
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-white/80 text-xs font-bold uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-black mt-1.5">{value}</p>
        </div>
        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 text-white">
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
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-lg font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-805 bg-clip-text text-transparent">
                Student Profile Hub
              </h1>
              <p className="text-[10px] font-bold text-slate-455 uppercase tracking-widest mt-0.5">Welcome, {profile?.name || user?.email?.split('@')[0]}</p>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Papers"
            value={stats.totalPapers}
            color="from-indigo-600 via-indigo-650 to-indigo-800"
            icon={<FileText className="w-5 h-5" />}
          />
          <StatCard
            title="Approved"
            value={stats.approvedPapers}
            color="from-emerald-500 to-teal-650"
            icon={<CheckCircle className="w-5 h-5" />}
          />
          <StatCard
            title="Pending Approval"
            value={stats.pendingPapers}
            color="from-amber-500 to-orange-600"
            icon={<Clock className="w-5 h-5" />}
          />
          <StatCard
            title="Recent Submissions"
            value={stats.recentActivity}
            color="from-purple-500 to-pink-600"
            icon={<TrendingUp className="w-5 h-5" />}
          />
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/80 border border-slate-105 shadow-sm backdrop-blur-md rounded-2xl p-1.5 flex flex-wrap gap-2 w-fit mb-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'profile', label: 'Edit Profile' },
            { id: 'papers', label: 'My Submissions' },
            { id: 'activity', label: 'History log' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border-0 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-805 cursor-pointer'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
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
                {/* Profile Summary Card */}
                <div className="lg:col-span-2">
                  <Card hover={false} className="border border-slate-105 shadow-premium bg-white rounded-2xl">
                    <CardContent className="p-8">
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        <div className="flex-shrink-0">
                          <AvatarInitials role={user?.role} />
                        </div>
                        <div className="flex-1 text-center sm:text-left w-full">
                          <h3 className="text-xl font-extrabold text-slate-805 mb-4">{profile?.name || 'Student Contributor'}</h3>
                          <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100/50">
                              <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wider w-20 flex-shrink-0">Email:</span>
                              <span className="text-xs font-bold text-slate-700 break-all">{profile?.email || user?.email}</span>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100/50">
                              <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wider w-20 flex-shrink-0">College:</span>
                              <span className="text-xs font-bold text-slate-700">{profile?.college || 'Not specified'}</span>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100/50">
                              <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wider w-20 flex-shrink-0">Semester:</span>
                              <span className="text-xs font-bold text-slate-700">{profile?.semester ? `Semester ${profile.semester}` : 'Not specified'}</span>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100/50">
                              <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wider w-20 flex-shrink-0">System Role:</span>
                              <span className="text-xs font-bold text-indigo-650 capitalize">{user?.role || 'Student'}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => setActiveTab('profile')}
                            className="mt-6 w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-650 hover:brightness-110 text-white font-bold py-3 px-6 rounded-xl shadow-md border-0 transition-all text-xs flex items-center justify-center gap-1.5"
                          >
                            <Edit3 className="w-4 h-4 text-yellow-350" />
                            <span>Edit Dashboard Profile</span>
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions Panel */}
                <div>
                  <Card hover={false} className="border border-slate-105 shadow-premium bg-white rounded-2xl h-full">
                    <CardContent className="p-6">
                      <h3 className="text-base font-bold text-slate-805 mb-6">Quick Actions</h3>
                      <div className="space-y-4">
                        <button 
                          onClick={() => navigate('/past-papers')}
                          className="w-full bg-gradient-to-r from-indigo-600 to-purple-650 hover:brightness-110 text-white p-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-3 border-0 cursor-pointer font-bold text-xs"
                        >
                          <PlusCircle className="w-4.5 h-4.5 text-yellow-350" />
                          <span>Upload New Past Paper</span>
                        </button>
                        
                        <button 
                          onClick={() => setActiveTab('papers')}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 p-4 rounded-2xl transition-all flex items-center justify-center gap-3 cursor-pointer font-bold text-xs"
                        >
                          <FileText className="w-4.5 h-4.5 text-indigo-600" />
                          <span>View My Uploads</span>
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
              </div>
            )}

            {activeTab === 'profile' && (
              <Card hover={false} className="border border-slate-105 shadow-premium bg-white rounded-2xl">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-8 border-b border-slate-50 pb-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
                      <Settings className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-805">Profile Account Settings</h2>
                      <p className="text-xs font-semibold text-slate-455">Manage your personal Pokhara University student stats</p>
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-1/3 flex flex-col items-center justify-center p-6 bg-slate-50/50 border border-slate-100 rounded-2xl h-fit">
                      <AvatarInitials role={user?.role} />
                      <p className="mt-4 text-xs font-bold text-slate-550 uppercase tracking-widest">Student Avatar</p>
                    </div>
                    
                    <div className="lg:w-2/3">
                      {!isEditing ? (
                        <div className="space-y-6">
                          <ProfileDetails profile={profile} />
                          <button
                            onClick={() => setIsEditing(true)}
                            className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md border-0 transition-all"
                          >
                            Edit Account Details
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <EditProfileForm
                            defaultValues={{
                              name: profile?.name || "",
                              email: profile?.email || "",
                              semester: profile?.semester || "",
                              college: profile?.college || "",
                            }}
                            onSubmit={handleProfileUpdate}
                            isSubmitting={isSubmitting}
                          />
                          <div className="flex gap-3 border-t border-slate-50 pt-4">
                            <button
                              onClick={() => setIsEditing(false)}
                              className="px-6 py-2.5 border border-slate-205 text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl font-bold text-xs transition-all duration-300"
                            >
                              Cancel Edit
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                        <h2 className="text-lg font-bold text-slate-805">My Past Paper Contributions</h2>
                        <p className="text-xs font-semibold text-slate-455">Track and view status of uploaded materials</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate('/past-papers')}
                      className="bg-gradient-to-r from-indigo-600 to-purple-650 hover:brightness-110 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md border-0 transition-all"
                    >
                      Upload New Paper
                    </button>
                  </div>

                  {papers.length > 0 ? (
                    <div className="grid gap-4">
                      {papers.map((paper) => (
                        <div
                          key={paper.objectId}
                          className="border border-slate-105 rounded-2xl p-5 hover:border-slate-200 transition-all bg-gradient-to-r from-white to-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                        >
                          <div className="flex-1">
                            <h3 className="text-sm font-bold text-slate-800 mb-1.5 leading-snug">{paper.title}</h3>
                            <div className="flex items-center gap-3 text-xs font-bold text-slate-455 uppercase tracking-wider">
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {new Date(paper.uploadedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {paper.approved ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 border border-emerald-100/50 text-emerald-700">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Approved
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 border border-amber-100/50 text-amber-700">
                                <Clock className="w-3.5 h-3.5" />
                                Pending Review
                              </span>
                            )}
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
                      <p className="text-xs text-slate-500 mb-6 font-semibold max-w-sm mx-auto leading-relaxed">You haven't contributed any past papers yet. Share your resources with the community.</p>
                      <button 
                        onClick={() => navigate('/past-papers')}
                        className="bg-gradient-to-r from-indigo-600 to-purple-650 hover:brightness-110 text-white font-bold text-xs px-8 py-3 rounded-xl shadow-md border-0 transition-all"
                      >
                        Upload Your First Paper
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'activity' && (
              <Card hover={false} className="border border-slate-105 shadow-premium bg-white rounded-2xl">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-8 border-b border-slate-50 pb-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
                      <Activity className="w-6 h-6 text-indigo-650" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-805">Recent Activity Logs</h2>
                      <p className="text-xs font-semibold text-slate-455">Chronological record of upload actions</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {papers.slice(0, 5).map((paper) => (
                      <div key={paper.objectId} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100/50 hover:border-slate-205 transition-all">
                        <div className="w-9 h-9 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 text-indigo-600">
                          <FileText className="w-4.5 h-4.5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-slate-800 leading-snug">Uploaded "{paper.title}"</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{new Date(paper.uploadedAt).toLocaleDateString()}</p>
                        </div>
                        <div className={`px-2.5 py-0.5 border rounded-full text-[10px] font-bold ${
                          paper.approved 
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                            : 'bg-amber-50 border-amber-100 text-amber-700'
                        }`}>
                          {paper.approved ? 'Approved' : 'Pending'}
                        </div>
                      </div>
                    ))}
                    
                    {papers.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">No recent actions logged</p>
                      </div>
                    )}
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

export default StudentProfile;
