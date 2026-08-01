// src/components/common/AuthRequiredModal.tsx
import React from "react";
import { Button } from "../ui/Button";
import { ShieldAlert, ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthRequiredModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-white/95 dark:bg-zinc-900/95 border border-slate-200/60 dark:border-zinc-800 backdrop-blur-md rounded-3xl shadow-premium max-w-sm w-full p-6 text-center relative overflow-hidden"
      >
        {/* Top decorative glow */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-200/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors border-0 cursor-pointer flex items-center justify-center"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center pt-2">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl flex items-center justify-center text-indigo-650 dark:text-indigo-400 mb-4">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>

          <h2 className="text-base font-extrabold text-slate-800 dark:text-white mb-2">
            Signup Required
          </h2>
          
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-6 leading-relaxed px-2">
            You must be signed in to access and download semester course notes.
          </p>

          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={() => {
                onClose();
                window.location.href = "/signup";
              }}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 text-white font-extrabold text-xs py-3 rounded-xl shadow-md border-0 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Sign Up Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full py-3 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-350 hover:bg-slate-50 border border-slate-200 dark:border-zinc-800"
            >
              Cancel
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
