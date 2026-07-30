// src/components/common/ConfirmDialog.tsx
import React from "react";
import { Dialog } from "@headlessui/react";
import { Button } from "../ui/Button";
import { AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onClose={onCancel} className="fixed z-50 inset-0 flex items-center justify-center p-4">
          {/* Frosted Backdrop */}
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" aria-hidden="true" onClick={onCancel} />
          
          <Dialog.Panel className="max-w-sm w-full z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white/95 dark:bg-zinc-900/95 border border-slate-200/60 dark:border-zinc-800 backdrop-blur-md p-6 rounded-3xl shadow-premium relative overflow-hidden text-center w-full"
            >
              {/* Top decorative glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-200/10 rounded-full blur-2xl pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={onCancel}
                className="absolute top-4 right-4 p-1 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors border-0 cursor-pointer flex items-center justify-center"
                aria-label="Cancel confirmation"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center pt-2">
                {/* Caution Icon */}
                <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4 animate-bounce">
                  <AlertTriangle className="w-6 h-6" />
                </div>

                <Dialog.Title className="text-base font-extrabold text-slate-800 dark:text-white mb-2">
                  {title}
                </Dialog.Title>

                <Dialog.Description className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-6 leading-relaxed px-1">
                  {message}
                </Dialog.Description>

                <div className="flex flex-col gap-2 w-full">
                  <button
                    onClick={onConfirm}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs py-3 rounded-xl shadow-md border-0 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Confirm Operation
                  </button>
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    className="w-full py-3 rounded-xl text-xs font-bold text-slate-655 dark:text-slate-350 hover:bg-slate-50 border border-slate-200 dark:border-zinc-800"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </Dialog.Panel>
        </Dialog>
      )}
    </AnimatePresence>
  );
}