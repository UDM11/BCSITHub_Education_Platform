// src/components/common/NoticeReaderModal.tsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  X, Download, Share2, Calendar, FileText, Check, AlertTriangle, Info, Bell, Lock 
} from "lucide-react";
import { Button } from "../ui/Button";
import { PDFViewer } from "./PDFViewer";
import { watermarkFile } from "../../lib/watermark";

interface Notice {
  id?: string;
  title: string;
  date: Date | string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  category: "Exam" | "Admission" | "Result" | "General";
  content?: string;
}

interface NoticeReaderModalProps {
  notice: Notice;
  onClose: () => void;
  isAuthenticated: boolean;
  onAuthRequired: () => void;
}

export function NoticeReaderModal({ notice, onClose, isAuthenticated, onAuthRequired }: NoticeReaderModalProps) {
  const [copied, setCopied] = useState(false);
  const [reported, setReported] = useState(false);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleShare = async () => {
    const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const shareUrl = `${window.location.origin}/pu-notices/${slugify(notice.title)}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: notice.title,
          text: `Check out this official Pokhara University notice: ${notice.title}`,
          url: shareUrl,
        });
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return; // User cancelled, do nothing
        console.error("Web Share failed, falling back to clipboard:", err);
      }
    }

    // Fallback: Copy link to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleDownload = () => {
    if (!notice.fileUrl) return;
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    
    // Direct download trigger
    fetch(notice.fileUrl)
      .then(res => res.blob())
      .then(async (blob) => {
        const watermarkedBlob = await watermarkFile(blob, "BCSITHub");
        const blobUrl = window.URL.createObjectURL(watermarkedBlob);
        const link = document.createElement("a");
        link.href = blobUrl;
        
        const ext = notice.fileName?.split(".").pop() || "pdf";
        const safeTitle = notice.title.replace(/[^a-zA-Z0-9\s-_]/g, '').trim();
        
        link.download = `${safeTitle}.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch((err) => {
        console.error("Watermarked notice download failed, redirecting:", err);
        window.open(notice.fileUrl, "_blank");
      });
  };

  const isImage = notice.fileUrl && /\.(jpg|jpeg|png|webp)$/i.test(notice.fileUrl);
  const hasFile = !!notice.fileUrl || !!notice.fileName;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-[100] p-4 overflow-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white border border-slate-200/50 shadow-2xl w-full max-w-6xl rounded-3xl flex flex-col md:flex-row relative text-left overflow-hidden h-[85vh] md:h-[720px]"
      >
        {/* Unified Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-950 text-slate-200 hover:text-white transition-all border border-slate-800 shadow-lg backdrop-blur-md cursor-pointer flex items-center justify-center"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Panel: File Viewer OR Text Notice Reader */}
        <div className="w-full h-[65%] md:h-full md:flex-1 bg-slate-950 p-3 md:p-6 flex items-center justify-center relative overflow-hidden shrink-0">
          <div className="w-full h-full flex items-center justify-center">
            {hasFile ? (
              isImage ? (
                <img 
                  src={notice.fileUrl} 
                  alt={notice.title} 
                  className="max-w-full max-h-full md:max-h-[672px] object-contain rounded-2xl shadow-premium border border-slate-900 bg-slate-900"
                />
              ) : (
                <PDFViewer 
                  fileUrl={(() => {
                    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
                    return apiBase.startsWith('http') 
                      ? `${apiBase}/notices/${notice.id || (notice as any).objectId}/pdf` 
                      : `${window.location.origin}${apiBase}/notices/${notice.id || (notice as any).objectId}/pdf`;
                  })()} 
                />
              )
            ) : (
              /* Text-Only Notice Design */
              <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 p-8 rounded-3xl text-left space-y-6 shadow-2xl">
                <div className="flex items-center gap-3 text-indigo-400">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <Bell className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 block">Announcement</span>
                    <span className="text-sm font-bold text-slate-300">Official Notice Content</span>
                  </div>
                </div>

                <div className="border-t border-slate-800/80 pt-6">
                  <p className="text-slate-200 text-sm font-medium leading-relaxed whitespace-pre-wrap select-text max-h-[300px] md:max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                    {notice.content || "No details provided for this notice."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Metadata & Action Items */}
        <div className="w-full h-[35%] md:h-full md:w-[420px] p-3 md:p-8 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-100 overflow-y-auto shrink-0 bg-white">
          <div className="space-y-2 md:space-y-6">
            <div>
              <span className="inline-block text-[9px] md:text-[10px] font-bold px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 uppercase tracking-wider mb-1.5">
                PU {notice.category} Notice
              </span>
              <h2 className="text-sm md:text-xl font-black text-slate-850 tracking-tight leading-snug pr-8">
                {notice.title}
              </h2>
            </div>

            <div className="space-y-1.5 md:space-y-3.5 border-t border-b border-slate-100 py-2 md:py-5">
              <div className="flex items-center text-slate-650 font-semibold gap-3">
                <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400" />
                <div>
                  <span className="text-[9px] md:text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Published On</span>
                  <span className="text-[11px] md:text-xs text-slate-800">{new Date(notice.date).toLocaleDateString()}</span>
                </div>
              </div>

              {hasFile && (
                <div className="flex items-center text-slate-650 font-semibold gap-3">
                  <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400" />
                  <div>
                    <span className="text-[9px] md:text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Attachment Details</span>
                    <span className="text-[11px] md:text-xs text-slate-800 truncate block max-w-[280px]">
                      {notice.fileName} ({notice.fileSize})
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center text-slate-655 font-semibold gap-3">
                <Info className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400" />
                <div>
                  <span className="text-[9px] md:text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Source Authority</span>
                  <span className="text-[11px] md:text-xs text-slate-800">Pokhara University Exam Board</span>
                </div>
              </div>
            </div>

            {/* Display notice body on the right panel as a quick summary if it has a file */}
            {hasFile && notice.content && (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-1.5 max-h-[140px] overflow-y-auto">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Description / Note</span>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">{notice.content}</p>
              </div>
            )}
          </div>

          <div className="space-y-2 md:space-y-3 pt-2.5 md:pt-6">
            {hasFile && (
              <Button
                variant="primary"
                className="w-full py-2.5 md:py-3 rounded-xl font-bold text-[11px] md:text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 border-0 hover:brightness-105 transition-all text-white shadow-lg shadow-indigo-100"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4" />
                {isAuthenticated ? "Download Attachment File" : "Login to Download"}
              </Button>
            )}

            <div className={`grid ${hasFile ? "grid-cols-2" : "grid-cols-1"} gap-3`}>
              <Button
                variant="outline"
                className="py-2 md:py-2.5 rounded-xl font-bold text-[11px] md:text-xs flex items-center justify-center gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                onClick={handleShare}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? "Copied" : "Share Notice Details"}</span>
              </Button>

              {hasFile && (
                <Button
                  variant="outline"
                  className="py-2 md:py-2.5 rounded-xl font-bold text-[11px] md:text-xs flex items-center justify-center gap-1.5 border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all"
                  onClick={() => setReported(true)}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  <span>{reported ? "Flagged!" : "Flag Errors"}</span>
                </Button>
              )}
            </div>

            {reported && (
              <p className="text-[10px] text-rose-600 font-bold text-center animate-pulse mt-2">
                Notice report sent to site moderation team.
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
