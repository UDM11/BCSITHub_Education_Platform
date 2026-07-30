// src/components/PWAInstallBanner.tsx
import { useState, useEffect } from "react";
import { usePWAInstall } from "../context/PWAInstallContext";
import { X, Download, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DISMISS_KEY = "bcsithub-pwa-install-dismissed";

export function PWAInstallBanner() {
  const { canInstall, isInstalled, triggerInstall } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY) === "true") return;
    if (isInstalled) return;
    if (canInstall) setIsVisible(true);
  }, [canInstall, isInstalled]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(DISMISS_KEY, "true");
  };

  if (isInstalled) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50"
        >
          <div className="bg-white/95 border border-slate-200/60 shadow-premium rounded-2xl p-5 relative overflow-hidden backdrop-blur-md flex flex-col gap-4">
            
            {/* Top right close button */}
            <button
              type="button"
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50 border-0 cursor-pointer flex items-center justify-center"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>

            {/* App logo and text row */}
            <div className="flex items-center gap-3.5 pr-6">
              {/* App icon block */}
              <div className="w-12 h-12 bg-gradient-to-tr from-rose-500 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md flex-shrink-0">
                B
              </div>
              
              <div className="min-w-0">
                <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1">
                  Install BCSITHub App
                  <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" />
                </h4>
                <p className="text-slate-500 text-[11px] font-semibold mt-0.5 leading-relaxed">
                  Access PU syllabus papers and download notes offline.
                </p>
              </div>
            </div>

            {/* Button group */}
            <div className="flex gap-2.5 border-t border-slate-50 pt-3.5">
              <button
                type="button"
                onClick={() => triggerInstall().then(() => setIsVisible(false))}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-sm border-0 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install App</span>
              </button>
              
              <button
                type="button"
                onClick={handleDismiss}
                className="py-2.5 px-4 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-slate-200 rounded-xl font-bold transition-all cursor-pointer"
              >
                Not Now
              </button>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
