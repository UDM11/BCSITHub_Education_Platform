// src/components/common/UploadNoticeForm.tsx
import React, { useState, ChangeEvent, FormEvent, useRef } from "react";
import backendless from "../../lib/backendless";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { UploadCloud, FileText, X, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Notice {
  objectId?: string;
  title: string;
  date: Date;
  fileUrl: string;
  fileName: string;
  fileSize: string;
  category: "Exam" | "Admission" | "Result" | "General";
}

interface UploadNoticeFormProps {
  onUploadSuccess: (newNotice: Notice) => void;
}

const categories: Notice["category"][] = ["Exam", "Admission", "Result", "General"];

const UploadNoticeForm: React.FC<UploadNoticeFormProps> = ({ onUploadSuccess }) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Notice["category"]>("Exam");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Drag & drop state references
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = ["application/pdf", "image/png", "image/jpeg"];

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
      const selectedFile = e.dataTransfer.files[0];
      validateAndSetFile(selectedFile);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile: File) => {
    if (!allowedTypes.includes(selectedFile.type)) {
      setAlert({ type: "error", text: "Only PDF documents or image files (PNG, JPG) are permitted." });
      setFile(null);
      return;
    }
    if (selectedFile.size > 8388608) { // 8MB limit
      setAlert({ type: "error", text: `File "${selectedFile.name}" exceeds the 8MB size limit.` });
      setFile(null);
      return;
    }
    setAlert(null);
    setFile(selectedFile);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setFile(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setAlert({ type: "error", text: "Please enter a notice title." });
      return;
    }

    if (!file) {
      setAlert({ type: "error", text: "Please select or drop a file to upload." });
      return;
    }

    setUploading(true);
    setAlert(null);

    try {
      const uploadedFile = await backendless.Files.upload(file, "notice-pdfs", true);
      const publicUrl = uploadedFile.fileURL;

      const noticeToSave = {
        title: title.trim(),
        date: new Date(),
        fileUrl: publicUrl,
        fileName: file.name,
        fileSize: (file.size / (1024 * 1024)).toFixed(2) + " MB",
        category,
      };

      const savedNotice = await backendless.Data.of("PU_Notices").save(noticeToSave);
      
      setAlert({ type: "success", text: "Notice uploaded successfully!" });
      onUploadSuccess(savedNotice);

      // Reset form
      setTitle("");
      setCategory("Exam");
      setFile(null);
    } catch (err: any) {
      console.error("Upload failed:", err);
      setAlert({ type: "error", text: `Failed to upload. ${err.message || "Try again."}` });
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/95 border border-slate-200/60 dark:border-zinc-800 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-premium space-y-5 relative overflow-hidden"
    >
      {/* Glow effect */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-200/10 rounded-full blur-2xl pointer-events-none" />

      <h2 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-50 pb-2">
        <Sparkles className="w-4.5 h-4.5 text-indigo-500" />
        Upload New PU Notice
      </h2>

      {/* Input Title */}
      <Input
        id="title"
        label="Notice Title"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={uploading}
        placeholder="e.g., Admission Notice 2025"
      />

      {/* Select Category */}
      <Select
        id="category"
        label="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value as Notice["category"])}
        disabled={uploading}
        options={categories.map((cat) => ({
          value: cat,
          label: cat,
        }))}
      />

      {/* File Upload Zone */}
      <div className="space-y-1.5">
        <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">File Attachment (PDF or Image)</span>
        
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
            dragActive 
              ? "border-indigo-500 bg-indigo-50/40" 
              : "border-slate-200 dark:border-zinc-800 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-350"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="application/pdf,image/png,image/jpeg"
            onChange={handleFileChange}
            disabled={uploading}
          />
          
          <UploadCloud className={`w-8 h-8 ${dragActive ? "text-indigo-600 animate-bounce" : "text-slate-400"}`} />
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Drag & drop files here, or <span className="text-indigo-600">browse</span></p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">PDF, PNG, or JPG (Max 8MB)</p>
          </div>
        </div>

        {/* Selected file block */}
        {file && (
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-xl text-xs mt-2">
            <div className="flex items-center gap-2 truncate">
              <FileText className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <span className="font-bold text-slate-700 dark:text-slate-200 truncate leading-snug">{file.name}</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase flex-shrink-0">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeFile();
              }}
              className="p-1 text-slate-400 hover:text-slate-655 hover:bg-slate-200 dark:hover:bg-zinc-850 rounded-lg transition-colors border-0 cursor-pointer flex items-center justify-center"
              disabled={uploading}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Action and feedback area */}
      <div className="space-y-3 pt-2">
        <AnimatePresence mode="wait">
          {alert && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs font-semibold leading-relaxed ${
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

        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 text-white font-extrabold text-xs py-3 rounded-xl shadow-md border-0 transition-all cursor-pointer flex items-center justify-center disabled:opacity-50"
        >
          {uploading ? "Uploading notice..." : "Upload Notice"}
        </button>
      </div>

    </form>
  );
};

export default UploadNoticeForm;