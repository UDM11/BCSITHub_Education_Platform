// src/dashboard/admin/AdminNotices.tsx
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/Card";
import { Bell, Search, Filter, Edit, Trash2, XCircle } from "lucide-react";
import { apiClient } from "../../lib/apiClient";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Notice {
  objectId: string;
  title: string;
  date: Date;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  category: 'Exam' | 'Admission' | 'Result' | 'General';
  content?: string;
}

interface AdminNoticesProps {
  onNoticeUpdate: () => void;
}

export const AdminNotices: React.FC<AdminNoticesProps> = ({ onNoticeUpdate }) => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

  // Edit form states
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState<Notice['category']>("General");
  const [editContent, setEditContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get("/notices") as any[];
      const mapped = data.map((item) => ({
        objectId: item.id,
        title: item.title,
        date: new Date(item.date),
        fileUrl: item.file_url,
        fileName: item.file_name,
        fileSize: item.file_size,
        category: item.category,
        content: item.content || "",
      }));
      setNotices(mapped);
    } catch (err: any) {
      console.error("Failed to fetch notices:", err);
      toast.error(err.message || "Failed to load notices database");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (noticeId: string, title: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to permanently delete notice "${title}"?`);
    if (!confirmDelete) return;

    try {
      await apiClient.delete(`/notices/${noticeId}`);
      toast.success("Notice deleted successfully!");
      fetchNotices();
      onNoticeUpdate();
    } catch (err: any) {
      toast.error(err.message || "Deletion failed");
    }
  };

  const startEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setEditTitle(notice.title);
    setEditCategory(notice.category);
    setEditContent(notice.content || "");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNotice) return;

    setSubmitting(true);
    try {
      await apiClient.patch(`/notices/${editingNotice.objectId}`, {
        title: editTitle.trim(),
        category: editCategory,
        content: editContent.trim()
      });
      toast.success("Notice updated successfully!");
      setEditingNotice(null);
      fetchNotices();
      onNoticeUpdate();
    } catch (err: any) {
      toast.error(err.message || "Failed to update notice");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredNotices = notices.filter((n) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      n.title.toLowerCase().includes(term) ||
      (n.content && n.content.toLowerCase().includes(term));

    const matchesCategory = categoryFilter === "all" || n.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Exam':
        return 'bg-rose-50 text-rose-650 border-rose-100';
      case 'Admission':
        return 'bg-sky-50 text-sky-650 border-sky-100';
      case 'Result':
        return 'bg-emerald-50 text-emerald-650 border-emerald-100';
      default:
        return 'bg-slate-50 text-slate-650 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 text-left">
      <Card className="border border-slate-200/60 shadow-premium bg-white rounded-3xl p-1">
        <CardContent className="p-6 sm:p-8">
          
          {/* Header & filters bar */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-purple-50 rounded-2xl flex items-center justify-center border border-purple-100">
                <Bell className="w-5.5 h-5.5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-800">PU Notices Database</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Audit & revise university announcements</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search title or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all focus:bg-white shadow-inner"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {['Exam', 'Admission', 'Result', 'General'].map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* List/Table */}
          <div className="overflow-x-auto max-h-[450px] overflow-y-auto pr-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                  <th className="p-4 font-bold text-slate-800 uppercase tracking-wider text-[10px]">Notice Title</th>
                  <th className="p-4 font-bold text-slate-800 uppercase tracking-wider text-[10px]">Category</th>
                  <th className="p-4 font-bold text-slate-800 uppercase tracking-wider text-[10px]">Attachment File</th>
                  <th className="p-4 font-bold text-slate-800 uppercase tracking-wider text-[10px]">Publish Date</th>
                  <th className="p-4 font-bold text-slate-800 uppercase tracking-wider text-[10px] text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i} className="animate-pulse border-b border-slate-50">
                      <td className="p-4"><div className="h-4 bg-slate-200 rounded w-48" /></td>
                      <td className="p-4"><div className="h-4 bg-slate-200 rounded w-16" /></td>
                      <td className="p-4"><div className="h-4 bg-slate-200 rounded w-24" /></td>
                      <td className="p-4"><div className="h-4 bg-slate-200 rounded w-20" /></td>
                      <td className="p-4"><div className="h-8 bg-slate-200 rounded-xl w-16 mx-auto" /></td>
                    </tr>
                  ))
                ) : filteredNotices.map((n) => (
                  <tr key={n.objectId} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div>
                        <span className="font-extrabold text-slate-800 leading-tight block">
                          {n.title}
                        </span>
                        {n.content && (
                          <p className="text-[10px] text-slate-400 font-semibold truncate max-w-sm mt-1">
                            {n.content}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 border rounded-full text-[9px] font-black uppercase tracking-wider ${getCategoryColor(n.category)}`}>
                        {n.category}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-slate-500">
                      {n.fileUrl ? (
                        <a href={n.fileUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
                          {n.fileName} ({n.fileSize})
                        </a>
                      ) : (
                        <span className="text-slate-400">Text-Only</span>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-slate-500">
                      {n.date.toLocaleDateString()}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => startEdit(n)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border-0 cursor-pointer"
                          title="Edit Notice"
                        >
                          <Edit className="w-4.5 h-4.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(n.objectId, n.title)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border-0 cursor-pointer"
                          title="Delete Notice"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredNotices.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-slate-400 font-bold text-xs uppercase tracking-wider">
                      No notices matched your filters
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
        {editingNotice && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-premium w-full max-w-md space-y-5"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-lg font-extrabold text-slate-805">Edit Notice Details</h3>
                <button
                  onClick={() => setEditingNotice(null)}
                  className="text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Notice Title</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as Notice['category'])}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {['Exam', 'Admission', 'Result', 'General'].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Notice Content Details</label>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
                    placeholder="Notice body text announcements..."
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingNotice(null)}
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
    </div>
  );
};
