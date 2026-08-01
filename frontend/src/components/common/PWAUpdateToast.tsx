// src/components/common/PWAUpdateToast.tsx
// Shows a banner when a new version of the app is deployed.
// Uses the vite-plugin-pwa virtual module to detect service worker updates.
import { useRegisterSW } from 'virtual:pwa-register/react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X, Sparkles } from 'lucide-react';

export function PWAUpdateToast() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Poll every 60 seconds to check for a new service worker
      if (r) {
        setInterval(() => {
          r.update();
        }, 60 * 1000);
      }
    },
  });

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  const handleDismiss = () => {
    setNeedRefresh(false);
  };

  return (
    <AnimatePresence>
      {needRefresh && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-sm px-4"
        >
          <div className="bg-slate-900 text-white rounded-2xl shadow-2xl shadow-slate-900/40 border border-slate-700/60 p-4 flex items-center gap-3">
            {/* Icon */}
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-extrabold text-white leading-snug">New version available!</p>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Click update to get the latest features.</p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleUpdate}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer border-0 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Update
              </button>
              <button
                onClick={handleDismiss}
                className="text-slate-500 hover:text-slate-300 cursor-pointer border-0 bg-transparent p-1 rounded-lg transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
