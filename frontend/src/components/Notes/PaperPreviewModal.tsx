// src/components/Notes/PaperPreviewModal.tsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  X, Download, Share2, AlertTriangle, Calendar, 
  School, FileText, Check, User, Lock, ZoomIn, ZoomOut, RotateCcw
} from "lucide-react";
import { Button } from "../ui/Button";
import { PDFViewer } from "../common/PDFViewer";

interface Paper {
  objectId?: string;
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
  ownerId?: string;
  uploaderName?: string;
  uploaderRole?: string;
}

interface PaperPreviewModalProps {
  paper: Paper;
  onClose: () => void;
  onDownload: () => void;
  isAuthenticated: boolean;
}

export function PaperPreviewModal({ paper, onClose, onDownload, isAuthenticated }: PaperPreviewModalProps) {
  const [copied, setCopied] = useState(false);
  const [reported, setReported] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleShare = async () => {
    const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const shareUrl = `${window.location.origin}/past-papers/${slugify(paper.title)}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: paper.title,
          text: `Check out this past exam paper: ${paper.title} (${paper.subject})`,
          url: shareUrl,
        });
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return; // User cancelled
        console.error("Web Share failed, falling back to clipboard:", err);
      }
    }

    // Fallback: copy link to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleReport = () => {
    setReported(true);
    setTimeout(() => setReported(false), 3000);
  };

  const isImage = paper.fileUrl && /\.(jpg|jpeg|png|webp)$/i.test(paper.fileUrl);

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-[100] p-4 overflow-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white border border-slate-200/50 shadow-2xl w-full max-w-6xl rounded-3xl flex flex-col md:flex-row relative text-left overflow-y-auto md:overflow-hidden max-h-[95vh] md:h-[750px]"
      >
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />

        {/* Unified Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-950 text-slate-200 hover:text-white transition-all border border-slate-800 shadow-lg backdrop-blur-md cursor-pointer flex items-center justify-center"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Column: Interactive Document Viewer */}
        <div className="w-full md:flex-1 bg-slate-950 p-4 md:p-6 flex flex-col items-center justify-center relative min-h-[480px] md:h-full overflow-hidden">
          {/* Zoom controls for Image */}
          {isImage && (
            <div className="absolute top-4 left-4 z-40 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-1.5 shadow-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoom(prev => Math.max(0.5, prev - 0.25))}
                className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg h-7 w-7 flex items-center justify-center"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-[10px] font-bold text-slate-400 min-w-[36px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoom(prev => Math.min(3, prev + 0.25))}
                className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg h-7 w-7 flex items-center justify-center"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoom(1)}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg h-7 flex items-center justify-center"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}

          <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
            {isImage ? (
              <img 
                src={paper.fileUrl} 
                alt={paper.title} 
                style={{ transform: `scale(${zoom})`, transformOrigin: "center center", transition: "transform 0.2s ease-out" }}
                className="max-w-full max-h-[440px] md:max-h-[640px] object-contain rounded-2xl shadow-premium border border-slate-900 bg-slate-900"
              />
            ) : (
              <PDFViewer 
                fileUrl={(() => {
                  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
                  return apiBase.startsWith('http') 
                    ? `${apiBase}/papers/${paper.objectId}/pdf` 
                    : `${window.location.origin}${apiBase}/papers/${paper.objectId}/pdf`;
                })()} 
              />
            )}
          </div>
        </div>

        {/* Right Column: Metadata & Actions */}
        <div className="w-full md:w-[420px] p-4 md:p-8 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-100 md:h-full md:overflow-y-auto shrink-0 bg-white">
          <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div>
              <span className="inline-block text-[9px] md:text-[10px] font-bold px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 uppercase tracking-wider mb-2">
                {paper.examType} Exam
              </span>
              <h2 className="text-base md:text-xl font-black text-slate-850 tracking-tight leading-snug pr-8">
                {paper.title}
              </h2>
            </div>

            {/* Meta stats block */}
            <div className="space-y-2.5 md:space-y-3.5 border-t border-b border-slate-100 py-4 md:py-5">
              <div className="flex items-center text-slate-600 font-semibold gap-3">
                <School className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400" />
                <div>
                  <span className="text-[9px] md:text-[10px] text-slate-400 block font-bold uppercase tracking-wider">College Origin</span>
                  <span className="text-[11px] md:text-xs text-slate-800">{paper.college}</span>
                </div>
              </div>
              
              <div className="flex items-center text-slate-600 font-semibold gap-3">
                <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400" />
                <div>
                  <span className="text-[9px] md:text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Subject</span>
                  <span className="text-[11px] md:text-xs text-slate-800">{paper.subject}</span>
                </div>
              </div>

              <div className="flex items-center text-slate-600 font-semibold gap-3">
                <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400" />
                <div>
                  <span className="text-[9px] md:text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Uploaded On</span>
                  <span className="text-[11px] md:text-xs text-slate-800">{new Date(paper.uploadedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center text-slate-600 font-semibold gap-3">
                <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400" />
                <div>
                  <span className="text-[9px] md:text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Contributor</span>
                  {paper.uploaderRole === "admin" ? (
                    <span className="font-bold text-indigo-705 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100/40 text-[9px] md:text-[10px]">
                      Administrator
                    </span>
                  ) : (
                    <span className="text-[11px] md:text-xs text-slate-800">{paper.uploaderName || "Anonymous Student"}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons panel */}
          <div className="space-y-2.5 md:space-y-3 pt-4 md:pt-6">
            <Button
              variant="primary"
              className="w-full py-2.5 md:py-3 rounded-xl font-bold text-[11px] md:text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 border-0 hover:brightness-105 transition-all text-white shadow-lg shadow-indigo-100"
              onClick={onDownload}
            >
              <Download className="w-4 h-4" />
              {isAuthenticated ? "Download Past Paper" : "Login to Download"}
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="py-2 md:py-2.5 rounded-xl font-bold text-[11px] md:text-xs flex items-center justify-center gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                onClick={handleShare}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? "Copied" : "Share Paper"}</span>
              </Button>

              <Button
                variant="outline"
                className="py-2 md:py-2.5 rounded-xl font-bold text-[11px] md:text-xs flex items-center justify-center gap-1.5 border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all"
                onClick={handleReport}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span>{reported ? "Flagged!" : "Flag Errors"}</span>
              </Button>
            </div>

            {reported && (
              <p className="text-[10px] text-rose-600 font-bold text-center animate-pulse mt-2">
                Thank you. Errors reported successfully to the administrators.
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
