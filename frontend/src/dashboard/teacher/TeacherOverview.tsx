// src/dashboard/teacher/TeacherOverview.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/Card";
import { 
  PlusCircle, FileText, BookOpen, ChevronRight 
} from "lucide-react";

interface Paper {
  objectId: string;
  title: string;
  uploadedAt: string | Date;
  approved: boolean;
}

interface TeacherOverviewProps {
  papers: Paper[];
  loading: boolean;
  setActiveTab: (tab: string) => void;
}

const TeacherOverview: React.FC<TeacherOverviewProps> = ({ papers, loading, setActiveTab }) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Academic Actions links */}
      <Card className="border border-slate-200/60 shadow-premium bg-white rounded-3xl p-1">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-50 pb-2">Academic Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/upload-paper")}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 p-3.5 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-700 transition-all cursor-pointer group"
            >
              <span className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-indigo-650" />
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

      {/* Recent Uploads Queue card */}
      <Card className="border border-slate-200/60 shadow-premium bg-white rounded-3xl p-1">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-50 pb-2">Recent Contributions</h3>
          <div className="space-y-3.5 max-h-[170px] overflow-y-auto pr-1">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse">
                  <div className="w-8 h-8 bg-slate-200 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-slate-200 rounded w-2/3" />
                    <div className="h-2 bg-slate-150 rounded w-1/3" />
                  </div>
                  <div className="h-5 bg-slate-200 rounded-full w-12" />
                </div>
              ))
            ) : papers.length > 0 ? (
              papers.slice(0, 4).map((paper) => (
                <div key={paper.objectId} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-8 h-8 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-black text-xs flex-shrink-0">
                    {paper.title.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800 text-xs truncate leading-snug">{paper.title}</p>
                    <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">{new Date(paper.uploadedAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold flex-shrink-0 border ${
                    paper.approved 
                      ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                      : "bg-amber-50 border-amber-100 text-amber-700"
                  }`}>
                    {paper.approved ? "Live" : "Review"}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FileText className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500 font-bold">No papers uploaded yet.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default TeacherOverview;
