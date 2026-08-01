// src/dashboard/admin/AdminOverview.tsx
import React from "react";
import { Card, CardContent } from "../../components/ui/Card";
import { 
  Sparkles, CheckSquare, Users, BookOpen, Activity, CheckCircle, Clock 
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

interface AdminOverviewProps {
  stats: AdminStats;
  papers: Paper[];
  loading: boolean;
  setActiveTab: (tab: string) => void;
  navigate: (path: string) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  stats,
  papers,
  loading,
  setActiveTab,
  navigate
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Console Control Links Card */}
      <Card className="border border-slate-200/60 shadow-premium bg-white rounded-3xl p-1">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            Console Control Links
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => setActiveTab("approvals")}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 p-3.5 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-700 transition-all cursor-pointer group"
            >
              <span className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-indigo-600" />
                Review Past Paper Submissions ({stats.pendingApprovals})
              </span>
              <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 rounded-lg px-2 py-0.5 font-bold transition-transform group-hover:scale-105">
                Action Required
              </span>
            </button>

            <button
              onClick={() => setActiveTab("users")}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 p-3.5 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-700 transition-all cursor-pointer group"
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                Manage Registered Student Profiles
              </span>
              <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-100 rounded-lg px-2 py-0.5 font-bold">
                Control Node
              </span>
            </button>

            <button
              onClick={() => navigate("/past-papers")}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 p-3.5 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-700 transition-all cursor-pointer group"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                Access past questions library
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg px-2 py-0.5 font-bold">
                Assets DB
              </span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Awaiting approvals queue list */}
      <Card className="border border-slate-200/60 shadow-premium bg-white rounded-3xl p-1">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-500 animate-pulse" />
            Pending Upload Queue
          </h3>
          
          <div className="space-y-3.5 max-h-[170px] overflow-y-auto pr-1">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse">
                  <div className="w-8 h-8 bg-slate-200 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-slate-200 rounded w-2/3" />
                    <div className="h-2.5 bg-slate-150 rounded w-1/3" />
                  </div>
                  <div className="h-5 bg-slate-200 rounded-full w-12" />
                </div>
              ))
            ) : papers.length > 0 ? (
              papers.slice(0, 4).map((paper) => (
                <div key={paper.objectId} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all">
                  <div className="w-8 h-8 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-black text-xs flex-shrink-0">
                    {paper.title.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800 text-xs truncate leading-snug">{paper.title}</p>
                    <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">by {paper.uploadedBy}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-[9px] font-extrabold flex-shrink-0">
                    Review
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-xs text-slate-550 font-bold">No papers awaiting review.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
};
