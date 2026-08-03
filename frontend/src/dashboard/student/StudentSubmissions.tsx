// src/dashboard/student/StudentSubmissions.tsx
import React, { useState, useMemo } from "react";
import { Card, CardContent } from "../../components/ui/Card";
import { 
  FileText, Clock, CheckCircle, Search, Filter, 
  Trash2, Eye, Calendar, BookOpen, AlertCircle, FileCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Paper {
  objectId: string;
  title: string;
  uploadedAt: string;
  approved: boolean;
}

interface StudentSubmissionsProps {
  papers: Paper[];
  papersLoading: boolean;
}

const StudentSubmissions: React.FC<StudentSubmissionsProps> = ({ papers, papersLoading }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending">("all");

  const filteredPapers = useMemo(() => {
    return papers.filter((paper) => {
      const matchesSearch = paper.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = 
        statusFilter === "all" ||
        (statusFilter === "approved" && paper.approved) ||
        (statusFilter === "pending" && !paper.approved);
      return matchesSearch && matchesStatus;
    });
  }, [papers, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const total = papers.length;
    const approved = papers.filter(p => p.approved).length;
    const pending = total - approved;
    return { total, approved, pending };
  }, [papers]);

  return (
    <div className="space-y-6 text-left">
      
      {/* Mini Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Contributions", count: stats.total, color: "text-indigo-600 bg-indigo-50 border-indigo-100/50", icon: FileText },
          { label: "Approved Papers", count: stats.approved, color: "text-emerald-600 bg-emerald-50 border-emerald-100/50", icon: FileCheck },
          { label: "Pending Review", count: stats.pending, color: "text-amber-600 bg-amber-50 border-amber-100/50", icon: Clock }
        ].map((item, idx) => (
          <div key={idx} className="bg-white border border-slate-200/60 p-4 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="min-w-0">
              <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest truncate">{item.label}</span>
              <span className="text-lg font-black text-slate-800 mt-1 block">{papersLoading ? "..." : item.count}</span>
            </div>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${item.color}`}>
              <item.icon className="w-4.5 h-4.5" />
            </div>
          </div>
        ))}
      </div>

      <Card className="border border-slate-200/60 shadow-premium bg-white rounded-3xl p-1">
        <CardContent className="p-6 sm:p-8 space-y-6">
          
          {/* Header & Controls Layout */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-base font-extrabold text-slate-800">My Submissions Archive</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Manage and track your uploads</p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search contributions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none w-full sm:w-48 bg-slate-50/50 hover:bg-slate-50 transition-colors font-medium text-slate-700"
                />
              </div>

              {/* Status Switcher Tabs */}
              <div className="flex p-1 bg-slate-100/80 rounded-xl border border-slate-200/30">
                {(["all", "approved", "pending"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border-0 cursor-pointer ${
                      statusFilter === status
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submissions List Grid */}
          {papersLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-slate-100 rounded-2xl p-5 bg-white animate-pulse flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                    <div className="h-3 bg-slate-150 rounded w-1/4" />
                  </div>
                  <div className="h-6 bg-slate-200 rounded-full w-20" />
                </div>
              ))}
            </div>
          ) : filteredPapers.length > 0 ? (
            <div className="grid gap-4">
              <AnimatePresence mode="popLayout">
                {filteredPapers.map((paper) => (
                  <motion.div
                    key={paper.objectId}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="border border-slate-100 hover:border-indigo-500/20 rounded-2xl p-5 bg-gradient-to-r from-white to-slate-50/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 group hover:shadow-sm transition-all duration-300"
                  >
                    <div className="flex-1 space-y-2 min-w-0">
                      <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors truncate">
                        {paper.title}
                      </h3>
                      
                      <div className="flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Uploaded {new Date(paper.uploadedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                          Pokhara University
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                      {paper.approved ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-emerald-50 border border-emerald-100/50 text-emerald-600 shadow-sm shadow-emerald-50">
                          <CheckCircle className="w-3 h-3" />
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-amber-50 border border-amber-100/50 text-amber-600 shadow-sm shadow-amber-50">
                          <Clock className="w-3 h-3 animate-pulse" />
                          Pending Review
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-slate-200/60 rounded-2xl bg-slate-50/20">
              <div className="w-14 h-14 bg-indigo-50 border border-indigo-100/50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-500">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-slate-800 mb-1">No uploads match search</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider max-w-xs mx-auto leading-relaxed">
                {searchQuery ? "Try refining your keywords or filters" : "Upload your first past paper to start contributing"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default StudentSubmissions;
