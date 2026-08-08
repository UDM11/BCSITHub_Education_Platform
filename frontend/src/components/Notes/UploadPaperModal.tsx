// src/components/Notes/UploadPaperModal.tsx
import React, { useState, useEffect, useRef } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "../../lib/apiClient";
import { 
  X, UploadCloud, FileText, CheckCircle2, AlertCircle 
} from "lucide-react";
import { semestersData } from "../../data/notesData";
import { specializationData } from "../../data/syllabusData";

interface User {
  name?: string;
  email?: string;
}

interface UploadPaperModalProps {
  onClose: () => void;
  user: User;
  onUploadSuccess?: () => void;
}

const semesters = [
  { value: "1", label: "1st Semester" },
  { value: "2", label: "2nd Semester" },
  { value: "3", label: "3rd Semester" },
  { value: "4", label: "4th Semester" },
  { value: "5", label: "5th Semester" },
  { value: "6", label: "6th Semester" },
  { value: "7", label: "7th Semester" },
  { value: "8", label: "8th Semester" },
];

const examTypes = [
  { value: "midterm", label: "Midterm" },
  { value: "pre-board", label: "Pre-board" },
  { value: "final", label: "Final" },
];

const colleges = [
  { value: "Pokhara University", label: "Pokhara University" },
  { value: "Ace Institute of Management", label: "Ace Institute of Management" },
  { value: "SAIM College", label: "SAIM College" },
  { value: "Apollo International College", label: "Apollo International College" },
  { value: "Quest International College", label: "Quest International College" },
  { value: "Shubhashree College of Management", label: "Shubhashree College of Management" },
  { value: "Liberty College", label: "Liberty College" },
  { value: "Uniglobe College", label: "Uniglobe College" },
  { value: "Medhavi College", label: "Medhavi College" },
  { value: "Crimson College of Technology", label: "Crimson College of Technology" },
  { value: "Rajdhani Model College", label: "Rajdhani Model College" },
  { value: "Excel Business College", label: "Excel Business College" },
  { value: "Malpi International College", label: "Malpi International College" },
  { value: "Nobel College", label: "Nobel College" },
  { value: "Boston International College", label: "Boston International College" },
  { value: "Pokhara College of Management", label: "Pokhara College of Management" },
  { value: "Apex College", label: "Apex College" },
  { value: "Other", label: "Other College" },
];

const years = Array.from({ length: 10 }, (_, i) => {
  const y = (new Date().getFullYear() - i).toString();
  return { value: y, label: y };
});

export function UploadPaperModal({ onClose, user, onUploadSuccess }: UploadPaperModalProps) {
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [examType, setExamType] = useState("");
  const [season, setSeason] = useState("");
  const [year, setYear] = useState("");
  const [college, setCollege] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Storing alerts
  const [alert, setAlert] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Drag and drop states
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...droppedFiles]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getSubjectsForSemester = (semId: string) => {
    if (!semId) return [];
    const sem = semestersData.find(s => s.id.toString() === semId);
    if (!sem) return [];

    // Get base subjects
    const baseSubjects = sem.subjects
      .filter(sub => sub.courseName !== "Specialization" && !sub.courseName.startsWith("Concentration"))
      .map(sub => sub.courseName);

    // If semester has specialization/concentration courses, add the respective specialization courses
    const additionalSubjects: string[] = [];
    if (semId === "5" || semId === "6" || semId === "7" || semId === "8") {
      Object.values(specializationData).forEach(spec => {
        spec.courses.forEach(c => {
          if (!additionalSubjects.includes(c.name)) {
            additionalSubjects.push(c.name);
          }
        });
      });
    }

    const allSubjects = [...baseSubjects, ...additionalSubjects].sort();
    return allSubjects.map(name => ({ value: name, label: name }));
  };

  const examTypeLabel = examTypes.find(e => e.value === examType)?.label || examType;
  const displaySubject = subject === "other" ? customSubject : subject;
  const generatedTitle = displaySubject && examTypeLabel && year
    ? `${displaySubject} ${season ? season + ' ' : ''}${examTypeLabel} Exam ${year}`
    : "";

  const handleUpload = async () => {
    const finalSubject = subject === "other" ? customSubject.trim() : subject;
    const finalTitle = generatedTitle;

    if (!semester) {
      setAlert({ type: "error", text: "Please select a semester." });
      return;
    }
    if (!finalSubject) {
      setAlert({ type: "error", text: "Please select or enter a subject." });
      return;
    }
    if (!examType) {
      setAlert({ type: "error", text: "Please select an exam type." });
      return;
    }
    if (!year) {
      setAlert({ type: "error", text: "Please select a year." });
      return;
    }
    if (!college) {
      setAlert({ type: "error", text: "Please select a college." });
      return;
    }
    if (files.length === 0) {
      setAlert({ type: "error", text: "Please select at least one file to upload." });
      return;
    }

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setAlert({ type: "error", text: "Only PDF documents or image files (JPG, PNG) are permitted." });
        return;
      }
      if (file.size > 5242880) { // 5MB limit
        setAlert({ type: "error", text: `File "${file.name}" exceeds the 5MB file size limit.` });
        return;
      }
    }

    setLoading(true);
    setAlert(null);

    try {
      for (const file of files) {
        const payload = new FormData();
        payload.append('title', finalTitle);
        payload.append('subject', finalSubject);
        payload.append('semester', semester);
        payload.append('exam_type', examType.toLowerCase());
        payload.append('college', college);
        if (season) {
          payload.append('session', season);
        }
        payload.append('file', file);

        await apiClient.postMultipart('/papers/upload', payload);
      }

      setAlert({
        type: "success",
        text: "Success! Your files have been uploaded and are now pending administrator verification.",
      });
      
      setSemester("");
      setSubject("");
      setCustomSubject("");
      setExamType("");
      setSeason("");
      setYear("");
      setCollege("");
      setFiles([]);

      if (typeof onUploadSuccess === "function") onUploadSuccess();

      setTimeout(() => {
        const modal = document.querySelector(".UploadPaperModal");
        if (modal) modal.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);

      setTimeout(() => {
        onClose();
      }, 3500);
    } catch (error: any) {
      console.error("Upload failed:", error);
      setAlert({ type: "error", text: `Failed to upload. ${error.message || "Please try again."}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="UploadPaperModal bg-white/95 border border-slate-200/60 shadow-premium w-full max-w-xl rounded-3xl max-h-[90vh] overflow-y-auto relative overflow-hidden"
      >
        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/20 rounded-full blur-2xl pointer-events-none" />

        <div className="p-6 sm:p-8 space-y-5">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent flex items-center gap-2">
              <UploadCloud className="w-5.5 h-5.5 text-indigo-600" />
              Upload Past Paper
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors border-0 cursor-pointer flex items-center justify-center"
              aria-label="Close"
              disabled={loading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Semester"
                value={semester}
                onChange={(e) => {
                  setSemester(e.target.value);
                  setSubject("");
                  setCustomSubject("");
                }}
                options={semesters}
                disabled={loading}
              />
              
              <Select
                label="Subject"
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  if (e.target.value !== "other") {
                    setCustomSubject("");
                  }
                }}
                options={semester ? [
                  ...getSubjectsForSemester(semester),
                  { value: "other", label: "Other / Custom Subject" }
                ] : []}
                disabled={loading || !semester}
                placeholder={semester ? "Select a subject" : "Select semester first"}
              />
            </div>

            {subject === "other" && (
              <Input
                label="Custom Subject Name"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="e.g. Database Management System"
                disabled={loading}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select
                label="Exam Type"
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                options={examTypes}
                disabled={loading}
              />
              <Select
                label="Session"
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                options={[
                  { value: "", label: "No Session" },
                  { value: "Spring", label: "Spring" },
                  { value: "Fall", label: "Fall" }
                ]}
                disabled={loading}
              />
              <Select
                label="Year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                options={years}
                disabled={loading}
              />
              <Select
                label="College"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                options={colleges}
                disabled={loading}
              />
            </div>

            {generatedTitle && (
              <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100/50 mt-2">
                <span className="block text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1">Generated Paper Title Preview</span>
                <p className="text-sm font-extrabold text-slate-800">{generatedTitle}</p>
              </div>
            )}

            {/* Interactive Drag & Drop Area */}
            <div className="space-y-2">
              <span className="block text-xs font-bold text-slate-700">Attach Exam Documents</span>
              
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileInput}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5 ${
                  dragActive 
                    ? "border-indigo-500 bg-indigo-50/40" 
                    : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="application/pdf,image/jpeg,image/png,image/jpg"
                  multiple
                  onChange={handleFileSelect}
                  disabled={loading}
                />
                <UploadCloud className={`w-8 h-8 ${dragActive ? "text-indigo-600 animate-bounce" : "text-slate-400"}`} />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-700">Drag & drop files here, or <span className="text-indigo-600 hover:text-indigo-800">browse files</span></p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">PDF, JPG, or PNG (Max 5MB each)</p>
                </div>
              </div>

              {/* Staged files list */}
              {files.length > 0 && (
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                        <span className="font-bold text-slate-700 truncate leading-snug">{file.name}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase flex-shrink-0">({(file.size / 1024).toFixed(0)} KB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(idx);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors border-0 cursor-pointer flex items-center justify-center"
                        disabled={loading}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Feedback Alerts */}
          <AnimatePresence mode="wait">
            {alert && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs leading-relaxed font-semibold ${
                  alert.type === "success" 
                    ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
                    : "bg-rose-50 border-rose-100 text-rose-800"
                }`}
              >
                {alert.type === "success" ? (
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4.5 h-4.5 text-rose-600 flex-shrink-0 mt-0.5" />
                )}
                <span>{alert.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Actions */}
          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <Button 
              variant="outline" 
              onClick={onClose} 
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all border border-slate-200"
            >
              Cancel
            </Button>
            <button
              onClick={handleUpload}
              disabled={loading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-md border-0 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Submit Paper"}
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
