// src/dashboard/teacher/TeacherPapers.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/Card";
import { FileText, Download, Eye } from "lucide-react";

interface Paper {
  objectId: string;
  title: string;
  subject: string;
  semester: number;
  examType: string;
  college: string;
  uploadedAt: string | Date;
  downloads: number;
  approved: boolean;
  fileUrl: string;
}

interface TeacherPapersProps {
  papers: Paper[];
  loading: boolean;
}

const TeacherPapers: React.FC<TeacherPapersProps> = ({ papers, loading }) => {
  const navigate = useNavigate();

  return (
    <Card className="border border-slate-200/60 shadow-premium bg-white rounded-3xl p-1">
      <CardContent className="p-6 sm:p-8">
        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-purple-50 rounded-2xl flex items-center justify-center border border-purple-100">
              <FileText className="w-5.5 h-5.5 text-purple-650" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-805">My Uploaded Papers</h2>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">Manage course resources shared by your account</p>
            </div>
          </div>
          <button 
            onClick={() => navigate("/upload-paper")}
            className="bg-gradient-to-r from-indigo-600 to-purple-650 hover:brightness-110 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md border-0 transition-all cursor-pointer"
          >
            Upload New
          </button>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-slate-150 rounded-2xl p-5 bg-white animate-pulse space-y-4">
                <div className="h-4 bg-slate-200 rounded w-2/3" />
                <div className="h-3 bg-slate-150 rounded w-1/3" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : papers.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {papers.map((paper) => (
              <div
                key={paper.objectId}
                className="border border-slate-100 rounded-2xl p-5 hover:border-indigo-300 transition-all bg-gradient-to-br from-white to-slate-50 flex flex-col justify-between hover:shadow-sm"
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-2 line-clamp-2 leading-relaxed">{paper.title}</h3>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-4">
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    <span>{paper.downloads || 0} downloads logged</span>
                  </div>
                  
                  <div className="space-y-1.5 text-xs font-semibold text-slate-655 border-t border-slate-50 pt-3 mb-4">
                    <div className="flex justify-between">
                      <span className="opacity-70">Subject:</span>
                      <span className="font-bold text-slate-800 truncate max-w-[120px]">{paper.subject}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-70">Semester:</span>
                      <span className="font-bold text-slate-800">Sem {paper.semester}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-70">Exam Type:</span>
                      <span className="font-bold text-slate-800">{paper.examType}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    paper.approved 
                      ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                      : "bg-amber-50 border-amber-100 text-amber-700"
                  }`}>
                    {paper.approved ? "Live/Approved" : "Pending Review"}
                  </span>
                  <button 
                    onClick={() => window.open(paper.fileUrl, "_blank")}
                    className="text-indigo-600 hover:text-indigo-800 font-bold text-xs flex items-center gap-1 bg-transparent border-0 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View file</span>
                  </button>
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
            <p className="text-xs text-slate-500 mb-6 font-semibold max-w-sm mx-auto leading-relaxed">No past papers uploaded yet under this account.</p>
            <button 
              onClick={() => navigate("/upload-paper")}
              className="bg-gradient-to-r from-indigo-600 to-purple-650 hover:brightness-110 text-white font-bold text-xs px-8 py-3 rounded-xl shadow-md border-0 transition-all cursor-pointer"
            >
              Upload Your First Paper
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeacherPapers;
