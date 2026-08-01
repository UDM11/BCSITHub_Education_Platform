// src/dashboard/admin/AdminApprovals.tsx
import React from "react";
import { Card, CardContent } from "../../components/ui/Card";
import { PaperCard } from "../../components/Notes/PaperCard";
import { Clock, Users, CheckCircle, Trash2 } from "lucide-react";

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

interface AdminApprovalsProps {
  papers: Paper[];
  loading: boolean;
  papersLoading: boolean;
  approvePaper: (id: string) => Promise<void>;
  handleRejectClick: (paper: Paper) => void;
}

export const AdminApprovals: React.FC<AdminApprovalsProps> = ({
  papers,
  loading,
  papersLoading,
  approvePaper,
  handleRejectClick
}) => {
  const showLoading = papersLoading || loading;

  return (
    <Card className="border border-slate-200/60 shadow-premium bg-white rounded-3xl p-1">
      <CardContent className="p-6 sm:p-8">
        
        {/* Header Block */}
        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100">
              <Clock className="w-6 h-6 text-amber-600 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-800">Review Paper Submissions</h2>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">Verify course curriculum exams and resource links</p>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-2 text-xs font-bold text-amber-700">
            <span>{papers.length} pending reviews</span>
          </div>
        </div>

        {/* Content Area */}
        {showLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-slate-150 rounded-2xl p-5 bg-white animate-pulse space-y-4">
                <div className="h-28 bg-slate-100 rounded-2xl w-full" />
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                  <div className="h-3 bg-slate-150 rounded w-1/2" />
                </div>
                <div className="h-9 bg-slate-200 rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : papers.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {papers.map((paper) => (
              <div
                key={paper.objectId}
                className="border border-slate-100 rounded-2xl p-5 hover:border-indigo-200 transition-all bg-gradient-to-br from-white to-slate-50 flex flex-col justify-between hover:shadow-sm"
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
                  
                  <div className="space-y-2 text-xs font-semibold text-slate-600 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-1.5 p-2 bg-indigo-50/50 border border-indigo-100/50 rounded-xl text-[10px] font-bold text-indigo-850 truncate">
                      <Users className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Uploaded by: {paper.uploadedBy || "Unknown"}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="p-2 bg-slate-100 rounded-xl min-w-0">
                        <span className="opacity-70 block text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Subject:</span>
                        <p className="font-bold text-slate-800 truncate">{paper.subject}</p>
                      </div>
                      <div className="p-2 bg-slate-100 rounded-xl">
                        <span className="opacity-70 block text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Semester:</span>
                        <p className="font-bold text-slate-800">Sem {paper.semester}</p>
                      </div>
                    </div>
                    
                    <div className="p-2 bg-slate-100 rounded-xl text-[10px] min-w-0">
                      <span className="opacity-70 block text-[9px] uppercase tracking-wider font-extrabold text-slate-400">College:</span>
                      <p className="font-bold text-slate-800 truncate">{paper.college}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 mt-5 border-t border-slate-100 pt-4">
                  <button
                    onClick={() => approvePaper(paper.objectId)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm border-0 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                    <span>Approve Resource</span>
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
              <CheckCircle className="w-8 h-8 text-emerald-600 animate-bounce" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1.5">All Caught Up!</h3>
            <p className="text-xs text-slate-500 font-semibold">Verification queue has been completely cleared.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
