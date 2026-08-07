// src/dashboard/student/StudentOverview.tsx
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/ui/Card";
import { 
  FileText, CheckCircle, Clock, TrendingUp, Sparkles, BookOpen, 
  Building, MapPin, Shield, ChevronRight, GraduationCap, Calendar, 
  Search, Brain, Code, Award, ExternalLink, Bell
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../lib/apiClient";

interface StudentOverviewProps {
  studentName: string;
  stats: {
    totalPapers: number;
    approvedPapers: number;
    pendingPapers: number;
    recentActivity: number;
  };
  papersLoading: boolean;
  profile: any;
  setActiveTab: (tab: string) => void;
}

interface Notice {
  id: string;
  title: string;
  category: string;
  date: string;
}

const StudentOverview: React.FC<StudentOverviewProps> = ({
  studentName,
  stats,
  papersLoading,
  profile,
  setActiveTab,
}) => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [noticesLoading, setNoticesLoading] = useState(true);

  useEffect(() => {
    const fetchRecentNotices = async () => {
      try {
        setNoticesLoading(true);
        const data = await apiClient.get("/notices") as any[];
        // Map and slice to get the latest 3 notices
        const mapped = data
          .map((item) => ({
            id: item.id,
            title: item.title,
            category: item.category || "General",
            date: item.date || item.created_at,
          }))
          .slice(0, 3);
        setNotices(mapped);
      } catch (error) {
        console.error("Error loading notices in overview:", error);
      } finally {
        setNoticesLoading(false);
      }
    };
    fetchRecentNotices();
  }, []);

  const [pomodoroStats, setPomodoroStats] = useState({
    totalSessions: 0,
    totalFocusTime: 0,
    streak: 0
  });

  useEffect(() => {
    const fetchPomodoro = async () => {
      try {
        const data = await apiClient.get("/pomodoro/stats") as any;
        setPomodoroStats({
          totalSessions: data.totalSessions,
          totalFocusTime: Math.round(data.totalFocusTime / 60), // in minutes
          streak: data.streak
        });
      } catch (error) {
        console.error("Error fetching pomodoro stats in overview:", error);
      }
    };
    fetchPomodoro();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const learningActions = [
    {
      title: "Explore Notes Library",
      desc: "Access structured chapter-wise notes for your current syllabus subjects.",
      icon: BookOpen,
      color: "text-blue-500 bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30",
      link: "/notes"
    },
    {
      title: "Question Paper Bank",
      desc: "Explore previous year Pokhara University exam question papers.",
      icon: FileText,
      color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30",
      link: "/past-papers"
    },
    {
      title: "Smart AI Chatbot",
      desc: "Discuss questions, summarize notes, and clear exam doubts with AI.",
      icon: Brain,
      color: "text-purple-500 bg-purple-50 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900/30",
      action: () => {
        // Toggle/open AI Chatbot
        const chatButton = document.getElementById("ai-chat-toggle");
        if (chatButton) chatButton.click();
      }
    },
    {
      title: "In-Browser Code Compiler",
      desc: "Write, compile, and execute code snippets on-the-go.",
      icon: Code,
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30",
      link: "/code-compiler"
    }
  ];

  return (
    <div className="space-y-8 text-left text-slate-800 dark:text-slate-200">
      
      {/* 1. HERO SECTION WITH GRADIENT MESH */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 text-white p-8 sm:p-10 shadow-xl border border-slate-800/40">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              E-Learning Portal
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              {getGreeting()}, <span className="bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400 bg-clip-text text-transparent">{studentName.split(" ")[0]}!</span>
            </h2>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              Welcome back to your academic console. Explore lecture notes, view past university questions, and compile code snippets to boost your exam preparations.
            </p>
          </div>
          
          <button
            onClick={() => navigate("/notes")}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-amber-500 hover:brightness-110 text-slate-900 font-extrabold text-xs px-6 py-3.5 rounded-xl shadow-lg border-0 transition-all cursor-pointer whitespace-nowrap self-start md:self-center"
          >
            <BookOpen className="w-4 h-4" />
            Start Learning
          </button>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { title: "Contributed Papers", value: stats.totalPapers, sub: `${stats.approvedPapers} Approved`, icon: FileText, color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20" },
          { title: "Current Semester", value: profile?.semester ? `${profile.semester} Sem` : "N/A", sub: "Pokhara University", icon: GraduationCap, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
          { title: "Study Focus Time", value: `${pomodoroStats.totalFocusTime} Min`, sub: `${pomodoroStats.totalSessions} Sessions Complete`, icon: Clock, color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
          { title: "Focus Streak", value: `${pomodoroStats.streak} Days`, sub: "Keep it up!", icon: Award, color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
          { title: "Assigned Campus", value: profile?.college ? (profile.college.length > 12 ? profile.college.substring(0, 12) + "..." : profile.college) : "N/A", sub: "Pokhara University Affiliation", icon: Building, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-white border border-slate-200/60 dark:border-slate-200/60 p-5 rounded-2xl flex items-center justify-between gap-3 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="space-y-1 min-w-0">
              <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest truncate">{stat.title}</span>
              {papersLoading ? (
                <div className="h-6 w-10 bg-slate-100 dark:bg-slate-100 animate-pulse rounded mt-1" />
              ) : (
                <span className="text-xl font-black text-slate-800 dark:text-slate-800 truncate block">{stat.value}</span>
              )}
              <span className="block text-[9px] font-bold text-slate-400 truncate">{stat.sub}</span>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. CORE CORE LAYOUT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COMPONENT: Learning Actions Grid */}
        <div className="lg:col-span-8 space-y-6">
          <h3 className="text-base font-black text-slate-800 dark:text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            Your Learning Hub
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {learningActions.map((action, idx) => (
              <Card 
                key={idx} 
                onClick={() => action.link ? navigate(action.link) : action.action?.()}
                className="border border-slate-200/60 dark:border-slate-200/60 shadow-sm bg-white dark:bg-white rounded-2xl overflow-hidden hover:shadow-md hover:border-indigo-500/40 dark:hover:border-indigo-500/30 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
              >
                <CardContent className="p-6 space-y-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${action.color}`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-800 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                      {action.title}
                      <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </h4>
                    <p className="text-[11px] font-semibold text-slate-400 leading-relaxed">
                      {action.desc}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* RIGHT COMPONENT: Announcements & Campus Details */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Recent PU Notices */}
          <Card className="border border-slate-200/60 dark:border-slate-200/60 shadow-sm bg-white dark:bg-white rounded-3xl overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-xs font-black text-slate-800 dark:text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Bell className="w-4 h-4 text-indigo-500" />
                  PU Notices
                </h3>
                <button
                  onClick={() => navigate("/pu-notices")}
                  className="text-[9px] font-black text-indigo-500 hover:underline uppercase tracking-widest border-0 bg-transparent cursor-pointer flex items-center gap-0.5"
                >
                  View All <ExternalLink className="w-2.5 h-2.5" />
                </button>
              </div>

              <div className="space-y-3">
                {noticesLoading ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="space-y-1.5 animate-pulse">
                      <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                      <div className="h-2 bg-slate-50 dark:bg-slate-800 rounded w-1/3" />
                    </div>
                  ))
                ) : notices.length > 0 ? (
                  notices.map((notice) => (
                    <div 
                      key={notice.id}
                      onClick={() => navigate(`/pu-notices/${notice.id}`)}
                      className="group cursor-pointer border-b border-slate-50 last:border-0 pb-3 last:pb-0 space-y-1"
                    >
                      <h4 className="text-[11px] font-bold text-slate-700 leading-snug group-hover:text-indigo-500 transition-colors line-clamp-2">
                        {notice.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded text-[8px]">
                          {notice.category}
                        </span>
                        <span>
                          {new Date(notice.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] font-bold text-slate-400 text-center py-4 uppercase tracking-wider">No notices found</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Academic Info */}
          <Card className="border border-slate-200/60 shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
                Assigned College
              </h3>
              <div className="space-y-3.5">
                <div className="flex gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100/50 text-indigo-500 flex items-center justify-center flex-shrink-0">
                    <Building className="w-5.5 h-5.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest">Institution</span>
                    <span className="text-xs font-black text-slate-750 truncate block mt-0.5">{profile?.college || "Not specified"}</span>
                  </div>
                </div>

                {profile?.college && profile?.college !== "Other" && (
                  <div className="flex items-start gap-2.5 p-3.5 bg-indigo-50/40 border border-indigo-100/50 rounded-2xl text-[10px] font-semibold text-slate-600">
                    <MapPin className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <span className="leading-relaxed">{profile?.collegeAddress || "Address synced"}</span>
                  </div>
                )}

                <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl text-[9px] font-bold text-slate-400 flex items-start gap-2 leading-relaxed">
                  <Shield className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span>Syllabus resources are dynamically matched to Pokhara University regulation frameworks.</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default StudentOverview;
