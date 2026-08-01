// src/components/InstallAppModal.tsx
import { useRef, useEffect } from "react";
import { X, Smartphone, Monitor, Download, Sparkles, CheckCircle2 } from "lucide-react";
import { usePWAInstall } from "../context/PWAInstallContext";
import { motion, AnimatePresence } from "framer-motion";

type InstallAppModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function InstallAppModal({ isOpen, onClose }: InstallAppModalProps) {
  const { canInstall, isInstalled, triggerInstall } = usePWAInstall();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            ref={dialogRef}
            className="bg-white/95 border border-slate-200/60 backdrop-blur-md rounded-3xl shadow-premium max-w-lg w-full max-h-[90vh] overflow-y-auto relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Top decorative glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/20 rounded-full blur-2xl pointer-events-none" />

            <div className="p-6 sm:p-8">
              
              {/* Header */}
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                <h2 className="text-lg font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent flex items-center gap-2">
                  <Download className="w-5.5 h-5.5 text-indigo-600" />
                  Install BCSITHub App
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors border-0 cursor-pointer flex items-center justify-center"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs font-semibold text-slate-500 mb-6 leading-relaxed">
                Add BCSITHub to your home screen or desktop. Offline storage caching enables you to open the syllabus and read notes without internet access.
              </p>

              {/* Instructions deck */}
              <div className="space-y-4 mb-6">
                
                {/* Desktop Card */}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                    <Monitor className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-xs text-slate-800">Chrome / Edge (Desktop)</h4>
                    <p className="text-[11px] font-semibold text-slate-500 mt-1 leading-relaxed">
                      Click the installation monitor icon in the address bar (right side), or open settings (three dots ⋮) and select <strong className="text-indigo-600 font-bold">"Install BCSITHub"</strong>.
                    </p>
                  </div>
                </div>

                {/* Mobile Android Card */}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-xs text-slate-800">Android Devices (Chrome)</h4>
                    <p className="text-[11px] font-semibold text-slate-500 mt-1 leading-relaxed">
                      Tap the installation banner popup at the bottom of the page, or tap the menu (three dots ⋮) and select <strong className="text-purple-600 font-bold">"Install App"</strong> / <strong className="text-purple-600 font-bold">"Add to Home Screen"</strong>.
                    </p>
                  </div>
                </div>

                {/* iPhone Safari Card */}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600 flex-shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-xs text-slate-800">iOS iPhone / iPad (Safari)</h4>
                    <p className="text-[11px] font-semibold text-slate-500 mt-1 leading-relaxed">
                      Tap the Share button (<strong className="text-pink-600 font-bold">□↑</strong>) in Safari, scroll down, and select <strong className="text-pink-600 font-bold">"Add to Home Screen"</strong>.
                    </p>
                  </div>
                </div>

              </div>

              {/* Action area */}
              <div className="border-t border-slate-100 pt-5">
                {isInstalled ? (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50/50 border border-emerald-100/50 rounded-2xl text-[11px] font-bold text-emerald-700">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                    <span>You have already installed BCSITHub on your device home screen.</span>
                  </div>
                ) : canInstall ? (
                  <button
                    type="button"
                    onClick={async () => {
                      await triggerInstall();
                      onClose();
                    }}
                    className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 text-white font-extrabold text-xs rounded-xl shadow-md border-0 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install BCSITHub Now</span>
                  </button>
                ) : (
                  <div className="flex items-start gap-2 p-3 bg-indigo-50/40 border border-indigo-100/50 rounded-2xl text-[10px] font-semibold text-indigo-950 leading-relaxed">
                    <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span>Use the options listed above inside your browser to install. The native installation prompt will activate automatically once visited in supporting browsers.</span>
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
