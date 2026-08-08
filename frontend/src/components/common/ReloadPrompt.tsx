import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X, Sparkles } from 'lucide-react';

export function ReloadPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      // Check for SW updates every 5 minutes
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 5 * 60 * 1000);
      }
    },
    onRegSWUpdFound(registration) {
      console.log('SW update found!', registration);
    },
  });

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  const handleClose = () => {
    setNeedRefresh(false);
  };

  return (
    <AnimatePresence>
      {needRefresh && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className="fixed bottom-6 z-[9999] w-[92%] max-w-md"
          style={{ left: '50%', transform: 'translateX(-50%)' }}
        >
          <div className="bg-white/95 backdrop-blur-xl border border-indigo-100 rounded-2xl shadow-2xl shadow-indigo-500/10 p-4 sm:p-5">
            {/* Top accent bar */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />

            <div className="flex items-start gap-3.5">
              {/* Icon */}
              <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-200">
                <Sparkles className="w-5 h-5 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 mb-0.5">
                  New Update Available! 🚀
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  We've improved the app with new features and fixes. Refresh to get the latest version.
                </p>

                {/* Buttons */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={handleUpdate}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold rounded-lg shadow-md shadow-indigo-200 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-95"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Refresh Now
                  </button>
                  <button
                    onClick={handleClose}
                    className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Later
                  </button>
                </div>
              </div>

              {/* Close */}
              <button
                onClick={handleClose}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
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
