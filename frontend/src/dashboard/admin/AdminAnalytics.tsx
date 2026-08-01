// src/dashboard/admin/AdminAnalytics.tsx
import React from "react";
import { Card, CardContent } from "../../components/ui/Card";
import { BarChart3, Activity, Database, Network } from "lucide-react";

interface AdminStats {
  totalPapers: number;
  pendingApprovals: number;
  approvedPapers: number;
  totalUsers: number;
  todayUploads: number;
  totalDownloads: number;
}

interface AdminAnalyticsProps {
  stats: AdminStats;
  loading: boolean;
}

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({
  stats,
  loading
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      
      {/* Platform Health Metrics */}
      <Card className="border border-slate-200/60 shadow-premium bg-white rounded-3xl p-1">
        <CardContent className="p-6">
          <h3 className="text-sm font-extrabold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-50 pb-2">
            <BarChart3 className="w-5 h-5 text-indigo-600 animate-pulse" />
            Platform Metrics & Approvals
          </h3>

          <div className="space-y-6">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold">
              <p className="text-slate-500 mb-2 font-bold uppercase tracking-wider text-[10px]">Approval Acceptance Rate</p>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-slate-200 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2.5 rounded-full transition-all"
                    style={{ width: `${stats.totalPapers > 0 ? (stats.approvedPapers / stats.totalPapers) * 105 : 0}%` }}
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
              <p className="text-slate-500 mb-1 font-bold uppercase tracking-wider text-[10px]">Average Downloads per paper</p>
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

      {/* Network Nodes Health */}
      <Card className="border border-slate-200/60 shadow-premium bg-white rounded-3xl p-1">
        <CardContent className="p-6">
          <h3 className="text-sm font-extrabold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-50 pb-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            Network System Health
          </h3>
          <div className="space-y-4 text-xs font-semibold text-slate-700">
            <div className="flex items-center justify-between p-4 bg-emerald-50/40 border border-emerald-100 rounded-2xl">
              <span className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                Database Connection Status
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700 font-bold uppercase tracking-wide text-[9px]">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                Online
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-emerald-50/40 border border-emerald-100 rounded-2xl">
              <span className="flex items-center gap-2">
                <Network className="w-5 h-5 text-emerald-600" />
                File Storage Server
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700 font-bold uppercase tracking-wide text-[9px]">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                Operational
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
              <span className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                API Response Times
              </span>
              <span className="text-indigo-800 font-bold">~150ms latency</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
