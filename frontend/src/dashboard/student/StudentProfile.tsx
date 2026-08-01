// src/dashboard/student/StudentProfile.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/ProfileContext";
import EditProfileForm from "../../components/common/EditProfileForm";
import ProfileDetails from "../../components/common/ProfileDetails";
import { Button } from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../lib/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "../../components/ui/Card";
import { 
  FileText, CheckCircle, Clock, TrendingUp, Sparkles, 
  LogOut, Edit3, Settings, Activity, 
  PlusCircle, BookOpen, AlertCircle, Award, Shield, User, GraduationCap, Building, Calendar, Mail, MapPin, ChevronRight
} from "lucide-react";
import { toast } from "react-hot-toast";

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

  // Generate initials from student name
  const getInitials = (nameString?: string) => {
    if (!nameString) return "S";
    const parts = nameString.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Gamified contribution rank & progress calculation
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
              <p className="text-xs font-semibold text-slate-500 mb-6 leading-relaxed">
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
    { id: "overview", label: "Overview", icon: User },
    { id: "profile", label: "Edit Profile", icon: Settings },
    { id: "papers", label: "My Submissions", icon: FileText },
    { id: "activity", label: "History Log", icon: Activity },
  ];

  const studentName = profile?.name || user?.email?.split("@")[0] || "Student";
  const rank = getRankProgress(stats.totalPapers);

  return (
    <div className="min-h-screen bg-slate-50/30 pb-16 relative">
      
      {/* Interactive Background Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-24 left-10 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Floating Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-40 shadow-sm relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-lg font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
                Student Profile Hub
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Dashboard Overview
              </p>
            </div>
            <button
              onClick={handleSignOut}
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
          
          {/* LEFT COLUMN: Student Profile Card & Progress */}
          <aside className="lg:col-span-4 space-y-6">
            <Card className="border border-slate-200/60 shadow-premium bg-white rounded-3xl p-1 overflow-hidden">
              <CardContent className="p-6 text-center space-y-6">
                
                {/* Custom circular gradient avatar */}
                <div className="relative w-28 h-28 mx-auto flex items-center justify-center rounded-full p-1 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-lg">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center border-2 border-white shadow-inner overflow-hidden">
                    {profile?.avatarUrl ? (
                      <img src={profile.avatarUrl} alt={studentName} className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-3xl font-black text-white tracking-tight">
                        {getInitials(studentName)}
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-1 right-1 w-7 h-7 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center" title="Active Contributor">
                    <CheckCircle className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>

                {/* Name & Rank */}
                <div className="space-y-2">
                  <h3 className="text-xl font-extrabold text-slate-800 leading-tight">
                    {studentName}
                  </h3>
                  <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider inline-block ${rank.class}`}>
                    {rank.current}
                  </span>
                </div>

                {/* Gamified Progress Bar */}
                <div className="border-t border-slate-100 pt-4 text-left space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    <span>Rank Progress</span>
                    <span className="text-indigo-600">{Math.round(rank.percent)}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${rank.percent}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 leading-normal">
                    {papersLoading ? (
                      <span className="w-16 h-3 bg-slate-100 animate-pulse rounded block" />
                    ) : (
                      <span>{rank.currentCount} Submissions</span>
                    )}
                    <span>Next: {rank.next}</span>
                  </div>
                </div>

                {/* Personal Academic Metadata Grid */}
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
                      <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest">College</span>
                      {profileLoading ? (
                        <div className="h-4 w-28 bg-slate-200 animate-pulse rounded-md mt-1" />
                      ) : (
                        <span className="text-xs font-bold text-slate-700 truncate block">{profile?.college || "Not specified"}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50/70 border border-slate-100 rounded-2xl">
                    <Calendar className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest">Semester</span>
                      {profileLoading ? (
                        <div className="h-4 w-20 bg-slate-200 animate-pulse rounded-md mt-1" />
                      ) : (
                        <span className="text-xs font-bold text-slate-700 block">{profile?.semester ? `${profile.semester} Semester` : "Not specified"}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50/70 border border-slate-100 rounded-2xl">
                    <GraduationCap className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest">System Role</span>
                      <span className="text-xs font-bold text-indigo-600 capitalize block">{user?.role || "Student"}</span>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </aside>

          {/* RIGHT COLUMN: Greetings, Quick Stats, Navigation & Work Panel */}
          <main className="lg:col-span-8 space-y-6">
            
            {/* Greetings Banner */}
            <div className="bg-gradient-to-r from-indigo-900 to-[#1e1b4b] text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="absolute right-0 top-0 w-44 h-44 bg-white/5 rounded-full blur-2xl pointer-events-none" />
              <div>
                <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-yellow-300 text-[9px] font-extrabold uppercase tracking-widest inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Academic Profile
                </span>
                <h2 className="text-2xl sm:text-3xl font-black mt-2">Welcome back, {studentName.split(" ")[0]}!</h2>
                <p className="text-xs text-indigo-200/80 font-medium mt-1 leading-relaxed max-w-md">
                  Thank you for contributing resources. Keep uploading papers to build the community bank and climb the ranks!
                </p>
              </div>
              <button
                onClick={() => navigate("/past-papers")}
                className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:brightness-110 text-slate-900 font-extrabold text-xs px-5 py-3 rounded-xl shadow-md border-0 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap self-start sm:self-center"
              >
                <PlusCircle className="w-4 h-4" />
                Upload Paper
              </button>
            </div>

            {/* Compact Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { title: "Total Papers", value: stats.totalPapers, icon: FileText, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
                { title: "Approved", value: stats.approvedPapers, icon: CheckCircle, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
                { title: "Pending", value: stats.pendingPapers, icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-100" },
                { title: "Weekly uploads", value: stats.recentActivity, icon: TrendingUp, color: "text-purple-600 bg-purple-50 border-purple-100" }
              ].map((stat, idx) => (
                <div key={idx} className="bg-white border border-slate-200/60 p-5 rounded-2xl flex items-center justify-between gap-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className="space-y-0.5">
                    <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest">{stat.title}</span>
                    {papersLoading ? (
                      <div className="h-6 w-8 bg-slate-100 animate-pulse rounded mt-1" />
                    ) : (
                      <span className="text-xl font-black text-slate-800">{stat.value}</span>
                    )}
                  </div>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Tabs Bar */}
            <div className="bg-white/80 border border-slate-200/50 shadow-sm backdrop-blur-md rounded-2xl p-1.5 flex flex-wrap gap-2 w-fit">
              {tabs.map((tab) => {
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
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Dynamic Content Details Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                
                {/* Tab: Overview (Quick Actions & Submissions Summary) */}
                {activeTab === "overview" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Quick Link Card */}
                    <Card className="border border-slate-200/60 shadow-premium bg-white rounded-3xl p-1">
                      <CardContent className="p-6 space-y-4">
                        <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-50 pb-2">Academic Actions</h3>
                        <div className="space-y-3">
                          <button
                            onClick={() => navigate("/past-papers")}
                            className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 p-3.5 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-700 transition-all cursor-pointer group"
                          >
                            <span className="flex items-center gap-2">
                              <PlusCircle className="w-4 h-4 text-indigo-600" />
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

                    {/* Address details and notes */}
                    <Card className="border border-slate-200/60 shadow-premium bg-white rounded-3xl p-1">
                      <CardContent className="p-6 space-y-4">
                        <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-50 pb-2">College Campus Details</h3>
                        <div className="space-y-3.5">
                          <div>
                            <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest">Assigned Institution</span>
                            <span className="text-xs font-bold text-slate-700 mt-1 block">{profile?.college || "Not specified"}</span>
                          </div>
                          
                          {profile?.college && profile?.college !== "Other" && (
                            <div className="flex items-start gap-2.5 p-3.5 bg-indigo-50/40 border border-indigo-100/50 rounded-2xl text-[11px] font-semibold text-indigo-950">
                              <MapPin className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                              <span className="leading-relaxed">{profile?.collegeAddress || "Address synced"}</span>
                            </div>
                          )}

                          <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl text-[10px] font-bold text-slate-400 flex items-start gap-2 leading-relaxed">
                            <Shield className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                            <span>Your account role and details are synced with the Pokhara University board syllabus rules.</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Tab: Edit Profile Details */}
                {activeTab === "profile" && (
                  <Card className="border border-slate-200/60 shadow-premium bg-white rounded-3xl p-1">
                    <CardContent className="p-6 sm:p-8">
                      <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                        <div className="w-11 h-11 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
                          <Settings className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <h2 className="text-base font-extrabold text-slate-800">Edit Dashboard details</h2>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Manage details and colleges</p>
                        </div>
                      </div>

                      {!isEditing ? (
                        <div className="space-y-6">
                          <ProfileDetails profile={profile} />
                          <button
                            onClick={() => setIsEditing(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md border-0 transition-all cursor-pointer"
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
                          <div className="flex gap-3 border-t border-slate-100 pt-4">
                            <button
                              onClick={() => setIsEditing(false)}
                              className="px-6 py-2.5 border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl font-bold text-xs transition-all duration-300 cursor-pointer"
                            >
                              Cancel Edit
                            </button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Tab: Past Paper Contributions */}
                {activeTab === "papers" && (
                  <Card className="border border-slate-200/60 shadow-premium bg-white rounded-3xl p-1">
                    <CardContent className="p-6 sm:p-8">
                      <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4 flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 bg-purple-50 rounded-2xl flex items-center justify-center border border-purple-100">
                            <FileText className="w-5.5 h-5.5 text-purple-650" />
                          </div>
                          <div>
                            <h2 className="text-base font-extrabold text-slate-800">My Submissions</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Track reviews and approvals</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => navigate("/past-papers")}
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md border-0 transition-all cursor-pointer"
                        >
                          Upload Paper
                        </button>
                      </div>

                      {papersLoading ? (
                        <div className="space-y-4">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="border border-slate-150 rounded-2xl p-5 bg-white animate-pulse flex items-center justify-between">
                              <div className="space-y-2 flex-1">
                                <div className="h-4 bg-slate-200 rounded w-2/3" />
                                <div className="h-3 bg-slate-150 rounded w-1/4" />
                              </div>
                              <div className="h-6 bg-slate-200 rounded-full w-20" />
                            </div>
                          ))}
                        </div>
                      ) : papers.length > 0 ? (
                        <div className="grid gap-4">
                          {papers.map((paper) => (
                            <div
                              key={paper.objectId}
                              className="border border-slate-150 rounded-2xl p-5 hover:border-slate-350 transition-all bg-gradient-to-r from-white to-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 group hover:shadow-sm"
                            >
                              <div className="flex-1">
                                <h3 className="text-sm font-bold text-slate-800 mb-1.5 leading-snug group-hover:text-indigo-600 transition-colors">{paper.title}</h3>
                                <div className="flex items-center gap-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                  <span className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-slate-450" />
                                    {new Date(paper.uploadedAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {paper.approved ? (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 border border-emerald-100/50 text-emerald-700">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Approved
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 border border-amber-100/50 text-amber-700">
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
                          <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-7 h-7 text-slate-400" />
                          </div>
                          <h3 className="text-sm font-bold text-slate-800 mb-1.5">No uploads discovered</h3>
                          <p className="text-xs text-slate-500 mb-6 font-semibold max-w-sm mx-auto leading-relaxed">You haven't contributed any past papers yet. Share your resources with the community.</p>
                          <button 
                            onClick={() => navigate("/past-papers")}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 text-white font-bold text-xs px-8 py-3 rounded-xl shadow-md border-0 transition-all cursor-pointer"
                          >
                            Upload Your First Paper
                          </button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Tab: Chronological Activity Logs */}
                {activeTab === "activity" && (
                  <Card className="border border-slate-200/60 shadow-premium bg-white rounded-3xl p-1">
                    <CardContent className="p-6 sm:p-8">
                      <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                        <div className="w-11 h-11 bg-purple-50 rounded-2xl flex items-center justify-center border border-purple-100">
                          <FileText className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h2 className="text-base font-extrabold text-slate-850">Recent Activity Logs</h2>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Chronological record of upload actions</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {papersLoading ? (
                          [1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse">
                              <div className="w-9 h-9 bg-slate-200 rounded-full flex-shrink-0" />
                              <div className="flex-1 space-y-2">
                                <div className="h-3 bg-slate-200 rounded w-1/2" />
                                <div className="h-2 bg-slate-150 rounded w-1/4" />
                              </div>
                              <div className="h-5 bg-slate-200 rounded-full w-14" />
                            </div>
                          ))
                        ) : papers.slice(0, 5).map((paper) => (
                          <div key={paper.objectId} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all">
                            <div className="w-9 h-9 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 text-indigo-600">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-bold text-slate-800 leading-snug">Uploaded "{paper.title}"</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{new Date(paper.uploadedAt).toLocaleDateString()}</p>
                            </div>
                            <div className={`px-2.5 py-0.5 border rounded-full text-[10px] font-bold ${
                              paper.approved 
                                ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                                : "bg-amber-50 border-amber-100 text-amber-700"
                            }`}>
                              {paper.approved ? "Approved" : "Pending"}
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
          </main>
        </div>

      </div>
    </div>
  );
};

export default StudentProfile;
