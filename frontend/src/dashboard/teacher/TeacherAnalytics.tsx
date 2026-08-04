// src/dashboard/teacher/TeacherAnalytics.tsx
import React from "react";
import { Card, CardContent } from "../../components/ui/Card";
import { BarChart3, TrendingUp } from "lucide-react";

interface TeacherStats {
  totalPapers: number;
  approvedPapers: number;
  pendingPapers: number;
  totalDownloads: number;
  thisWeekUploads: number;
  popularPaper: string;
}

interface TeacherAnalyticsProps {
  stats: TeacherStats;
  loading: boolean;
}

const TeacherAnalytics: React.FC<TeacherAnalyticsProps> = ({ stats, loading }) => {
  return (
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
  );
};

export default TeacherAnalytics;
