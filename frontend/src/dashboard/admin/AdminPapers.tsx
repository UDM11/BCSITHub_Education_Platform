// src/dashboard/admin/AdminPapers.tsx
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/Card";
import { FileText, Search, Filter, Edit, Trash2, CheckCircle, XCircle, ArrowRight, Eye } from "lucide-react";
import { apiClient } from "../../lib/apiClient";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { PDFViewer } from "../../components/common/PDFViewer";

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
  session?: string;
}

interface AdminPapersProps {
  onPaperUpdate: () => void;
}

export const AdminPapers: React.FC<AdminPapersProps> = ({ onPaperUpdate }) => {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [approvedFilter, setApprovedFilter] = useState("all");
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);
  const [previewPaper, setPreviewPaper] = useState<Paper | null>(null);

  // Edit form states
  const [editTitle, setEditTitle] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editSemester, setEditSemester] = useState(1);
  const [editExamType, setEditExamType] = useState("final");
  const [editSession, setEditSession] = useState("");
  const [editCollege, setEditCollege] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const buildTitle = (subject: string, session: string, examType: string, currentTitle: string) => {
    const yearMatch = currentTitle.match(/\b(19|20)\d{2}\b/);
    const year = yearMatch ? yearMatch[0] : new Date().getFullYear().toString();
    const examTypeLabel = examType.charAt(0).toUpperCase() + examType.slice(1);
    return `${subject.trim()} ${session ? session + ' ' : ''}${examTypeLabel} Exam ${year}`;
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get("/papers?approved_only=false") as any[];
      const mapped = data.map((item) => ({
        objectId: item.id,
        title: item.title,
        subject: item.subject,
        semester: item.semester,
        examType: item.exam_type,
        college: item.college,
        uploadedAt: item.created_at,
        uploadedBy: item.uploader_name || "Anonymous",
        downloads: item.downloads || 0,
        approved: item.approved,
        fileUrl: item.file_url,
        session: item.session || "",
      }));
      setPapers(mapped);
    } catch (err: any) {
      console.error("Failed to fetch papers:", err);
      toast.error(err.message || "Failed to load past papers database");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (paperId: string) => {
    try {
      await apiClient.post(`/papers/${paperId}/approve`, {});
      toast.success("Paper approved successfully!");
      fetchPapers();
      onPaperUpdate();
    } catch (err: any) {
      toast.error(err.message || "Approval failed");
    }
  };

  const handleDelete = async (paperId: string, title: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to permanently delete "${title}"?`);
    if (!confirmDelete) return;

    try {
      await apiClient.delete(`/papers/${paperId}`);
      toast.success("Paper deleted successfully!");
      fetchPapers();
      onPaperUpdate();
    } catch (err: any) {
      toast.error(err.message || "Deletion failed");
    }
  };

  const startEdit = (paper: Paper) => {
    setEditingPaper(paper);
    setEditTitle(paper.title);
    setEditSubject(paper.subject);
    setEditSemester(paper.semester);
    setEditExamType(paper.examType);
    setEditSession(paper.session || "");
    setEditCollege(paper.college);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPaper) return;

    setSubmitting(true);
    try {
      await apiClient.patch(`/papers/${editingPaper.objectId}`, {
        title: editTitle.trim(),
        subject: editSubject.trim(),
        semester: editSemester,
        exam_type: editExamType,
        session: editSession,
        college: editCollege.trim()
      });
      toast.success("Past paper details updated successfully!");
      setEditingPaper(null);
      fetchPapers();
      onPaperUpdate();
    } catch (err: any) {
      toast.error(err.message || "Failed to update past paper");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPapers = papers.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      p.title.toLowerCase().includes(term) ||
      p.subject.toLowerCase().includes(term) ||
      p.college.toLowerCase().includes(term);

    const matchesSem = semesterFilter === "all" || p.semester.toString() === semesterFilter;
    
    const matchesApproved = 
      approvedFilter === "all" ||
      (approvedFilter === "approved" && p.approved) ||
      (approvedFilter === "pending" && !p.approved);

    return matchesSearch && matchesSem && matchesApproved;
  });

  return (
    <div className="space-y-6 text-left">
      <Card className="border border-slate-200/60 shadow-premium bg-white rounded-3xl p-1">
        <CardContent className="p-6 sm:p-8">
          
          {/* Header & filters bar */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
                <FileText className="w-5.5 h-5.5 text-indigo-650" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-800">Past Papers Assets</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Audit & revise syllabus files</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search title, subject, college..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all focus:bg-white shadow-inner"
                />
              </div>

              <select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Semesters</option>
                {[...Array(8)].map((_, i) => (
                  <option key={i} value={i + 1}>Semester {i + 1}</option>
                ))}
              </select>

              <select
                value={approvedFilter}
                onChange={(e) => setApprovedFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {/* List/Table */}
          <div className="overflow-x-auto max-h-[450px] overflow-y-auto pr-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                  <th className="p-4 font-bold text-slate-800 uppercase tracking-wider text-[10px]">Paper Details</th>
                  <th className="p-4 font-bold text-slate-800 uppercase tracking-wider text-[10px]">Subject</th>
                  <th className="p-4 font-bold text-slate-800 uppercase tracking-wider text-[10px]">College</th>
                  <th className="p-4 font-bold text-slate-800 uppercase tracking-wider text-[10px]">Status</th>
                  <th className="p-4 font-bold text-slate-800 uppercase tracking-wider text-[10px] text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i} className="animate-pulse border-b border-slate-50">
                      <td className="p-4"><div className="h-4 bg-slate-200 rounded w-40" /></td>
                      <td className="p-4"><div className="h-4 bg-slate-200 rounded w-24" /></td>
                      <td className="p-4"><div className="h-4 bg-slate-200 rounded w-32" /></td>
                      <td className="p-4"><div className="h-6 bg-slate-200 rounded-full w-16" /></td>
                      <td className="p-4"><div className="h-8 bg-slate-200 rounded-xl w-24 mx-auto" /></td>
                    </tr>
                  ))
                ) : filteredPapers.map((p) => (
                  <tr key={p.objectId} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div>
                        <a href={p.fileUrl} target="_blank" rel="noreferrer" className="font-extrabold text-slate-800 hover:text-indigo-600 transition-colors leading-tight block">
                          {p.title}
                        </a>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide mt-1 block">
                          Sem {p.semester} • {p.examType}{p.session ? ` • ${p.session}` : ''} • by {p.uploadedBy}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-600">{p.subject}</td>
                    <td className="p-4 font-semibold text-slate-550 max-w-[150px] truncate" title={p.college}>
                      {p.college}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 border rounded-full text-[9px] font-black uppercase tracking-wider ${
                        p.approved 
                          ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                          : "bg-amber-50 border-amber-100 text-amber-700 animate-pulse"
                      }`}>
                        {p.approved ? "Approved" : "Pending Review"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setPreviewPaper(p)}
                          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all border-0 cursor-pointer"
                          title="Inspect Document"
                        >
                          <Eye className="w-4.5 h-4.5" />
                        </button>
                        {!p.approved && (
                          <button
                            onClick={() => handleApprove(p.objectId)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all border-0 cursor-pointer"
                            title="Approve Paper"
                          >
                            <CheckCircle className="w-4.5 h-4.5" />
                          </button>
                        )}
                        <button
                          onClick={() => startEdit(p)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border-0 cursor-pointer"
                          title="Edit Details"
                        >
                          <Edit className="w-4.5 h-4.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.objectId, p.title)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border-0 cursor-pointer"
                          title="Delete Paper"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPapers.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-slate-400 font-bold text-xs uppercase tracking-wider">
                      No papers matched your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </CardContent>
      </Card>

      {/* Edit Dialog Modal */}
      <AnimatePresence>
        {editingPaper && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-premium w-full max-w-md space-y-5"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-lg font-extrabold text-slate-805">Edit Past Paper Details</h3>
                <button
                  onClick={() => setEditingPaper(null)}
                  className="text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Title</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</label>
                  <input
                    type="text"
                    required
                    value={editSubject}
                    onChange={(e) => {
                      const newSubject = e.target.value;
                      setEditSubject(newSubject);
                      setEditTitle(buildTitle(newSubject, editSession, editExamType, editTitle));
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Semester</label>
                    <select
                      value={editSemester}
                      onChange={(e) => setEditSemester(parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      {[...Array(8)].map((_, i) => (
                        <option key={i} value={i + 1}>Semester {i + 1}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Exam Type</label>
                    <select
                      value={editExamType}
                      onChange={(e) => {
                        const newExamType = e.target.value;
                        setEditExamType(newExamType);
                        setEditTitle(buildTitle(editSubject, editSession, newExamType, editTitle));
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      {['midterm', 'pre-board', 'final', 'quiz', 'assignment'].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-550 uppercase tracking-wider">Session</label>
                    <select
                      value={editSession}
                      onChange={(e) => {
                        const newSession = e.target.value;
                        setEditSession(newSession);
                        setEditTitle(buildTitle(editSubject, newSession, editExamType, editTitle));
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="">No Session</option>
                      <option value="Spring">Spring</option>
                      <option value="Fall">Fall</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">College Name</label>
                    <input
                      type="text"
                      required
                      value={editCollege}
                      onChange={(e) => setEditCollege(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingPaper(null)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl border-0 cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl border-0 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {submitting ? "Updating..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Document Inspector Modal */}
      <AnimatePresence>
        {previewPaper && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white border border-slate-200 shadow-2xl w-full max-w-5xl rounded-3xl flex flex-col md:flex-row relative text-left overflow-y-auto md:overflow-hidden max-h-[90vh] md:h-[680px]"
            >
              {/* Close Button */}
              <button
                onClick={() => setPreviewPaper(null)}
                className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-950 text-slate-200 hover:text-white transition-all border border-slate-800 shadow-lg backdrop-blur-md cursor-pointer flex items-center justify-center"
                aria-label="Close"
              >
                <XCircle className="w-4.5 h-4.5" />
              </button>

              {/* PDF/Image Preview Panel */}
              <div className="w-full md:flex-1 bg-slate-950 p-4 flex items-center justify-center relative min-h-[350px] md:h-full">
                <div className="w-full h-full flex items-center justify-center">
                  {previewPaper.fileUrl && /\.(jpg|jpeg|png|webp)$/i.test(previewPaper.fileUrl) ? (
                    <img 
                      src={previewPaper.fileUrl} 
                      alt={previewPaper.title} 
                      className="max-w-full max-h-[600px] object-contain rounded-2xl shadow-premium border border-slate-900 bg-slate-900"
                    />
                  ) : (
                    <PDFViewer 
                      fileUrl={(() => {
                        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
                        return apiBase.startsWith('http') 
                          ? `${apiBase}/papers/${previewPaper.objectId}/pdf` 
                          : `${window.location.origin}${apiBase}/papers/${previewPaper.objectId}/pdf`;
                      })()} 
                    />
                  )}
                </div>
              </div>

              {/* Side Action Details */}
              <div className="w-full md:w-[350px] p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-100 md:h-full bg-white">
                <div className="space-y-5">
                  <div>
                    <span className={`inline-block text-[9px] font-black px-2.5 py-0.5 rounded-full border mb-2 ${
                      previewPaper.approved 
                        ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                        : "bg-amber-50 border-amber-100 text-amber-700"
                    }`}>
                      {previewPaper.approved ? "Approved" : "Pending Review"}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-800 leading-tight">
                      {previewPaper.title}
                    </h3>
                  </div>

                  <div className="space-y-3.5 border-t border-b border-slate-50 py-4 text-xs font-semibold text-slate-600">
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase tracking-wider font-bold">Subject</span>
                      <span className="text-slate-700">{previewPaper.subject}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase tracking-wider font-bold">College</span>
                      <span className="text-slate-700">{previewPaper.college}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase tracking-wider font-bold">Academic Scope</span>
                      <span className="text-slate-700">Semester {previewPaper.semester} • {previewPaper.examType}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase tracking-wider font-bold">Uploaded By</span>
                      <span className="text-slate-750 font-bold">{previewPaper.uploadedBy}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-6">
                  {!previewPaper.approved && (
                    <button
                      onClick={() => {
                        handleApprove(previewPaper.objectId);
                        setPreviewPaper(null);
                      }}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs border-0 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve Submission</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleDelete(previewPaper.objectId, previewPaper.title);
                      setPreviewPaper(null);
                    }}
                    className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/50 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Reject & Delete</span>
                  </button>
                  <button
                    onClick={() => setPreviewPaper(null)}
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border-0 transition-all flex items-center justify-center cursor-pointer"
                  >
                    Close Inspector
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
