// src/dashboard/admin/AdminOverview.tsx
import React from "react";
import { Card, CardContent } from "../../components/ui/Card";
import { 
  Sparkles, Users, BookOpen, Activity, CheckCircle, Shield, ShieldAlert, Award
} from "lucide-react";

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
}

interface AdminOverviewProps {
  stats: AdminStats;
  users: User[];
  loading: boolean;
  setActiveTab: (tab: string) => void;
  navigate: (path: string) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  stats,
  users,
  loading,
  setActiveTab,
  navigate
}) => {
  // Sort users to get 4 most recent registrations
  const recentUsers = [...users]
    .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
    .slice(0, 4);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
      
      {/* Console Control Links Card */}
      <Card className="border border-slate-200/60 shadow-premium bg-white rounded-3xl p-1">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            Console Control Links
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => setActiveTab("users")}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 p-3.5 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-700 transition-all cursor-pointer group"
            >
              <span className="flex items-center gap-2.5">
                <Users className="w-4.5 h-4.5 text-purple-600" />
                Manage Registered User Profiles
              </span>
              <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-100 rounded-lg px-2.5 py-0.5 font-bold transition-transform group-hover:scale-105">
                Active Database
              </span>
            </button>

            <button
              onClick={() => navigate("/past-papers")}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 p-3.5 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-700 transition-all cursor-pointer group"
            >
              <span className="flex items-center gap-2.5">
                <BookOpen className="w-4.5 h-4.5 text-indigo-650" />
                Access Questions & Papers
              </span>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg px-2.5 py-0.5 font-bold">
                Live Library
              </span>
            </button>

            <button
              onClick={() => navigate("/pu-notices")}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 p-3.5 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-700 transition-all cursor-pointer group"
            >
              <span className="flex items-center gap-2.5">
                <Award className="w-4.5 h-4.5 text-emerald-600" />
                Manage Pokhara University Notices
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg px-2.5 py-0.5 font-bold">
                Announcements
              </span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Recent User Registrations Card */}
      <Card className="border border-slate-200/60 shadow-premium bg-white rounded-3xl p-1">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-500 animate-pulse" />
            Recent Registrations Queue
          </h3>
          
          <div className="space-y-3.5 max-h-[190px] overflow-y-auto pr-1">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse">
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-slate-200 rounded w-2/3" />
                    <div className="h-2.5 bg-slate-150 rounded w-1/3" />
                  </div>
                  <div className="h-5 bg-slate-200 rounded-full w-12" />
                </div>
              ))
            ) : recentUsers.length > 0 ? (
              recentUsers.map((u) => (
                <div key={u.objectId} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all">
                  <div className="w-8 h-8 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center text-indigo-650 font-black text-xs flex-shrink-0">
                    {(u.name || u.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-slate-800 text-xs truncate leading-snug">{u.name || "Student User"}</p>
                    <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">{u.email}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 border rounded-full text-[8px] font-black uppercase tracking-wider ${
                    u.role === "admin" 
                      ? "bg-rose-50 border-rose-100 text-rose-700" 
                      : u.role === "teacher"
                      ? "bg-purple-50 border-purple-100 text-purple-700"
                      : "bg-indigo-50 border-indigo-100 text-indigo-700"
                  }`}>
                    {u.role || "student"}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-xs text-slate-550 font-bold">No registered profiles.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
};
