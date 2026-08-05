// src/components/common/PWAUpdateToast.tsx
// Silently and automatically triggers a hard refresh when a new version of the app is deployed.
// Catches PWA service worker updates and global chunk load errors.
import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export function PWAUpdateToast() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        // Poll for updates every 15 seconds to ensure near-instant detection of new deployments
        setInterval(() => {
          r.update().catch(err => console.debug("PWA SW update check failed (offline or network fluctuation):", err));
        }, 15 * 1000);
      }
    },
  });

  // 1. Automatically update service worker and refresh the page when new content is available
  useEffect(() => {
    if (needRefresh && !import.meta.env.DEV) {
      console.log("[PWA] New version detected. Executing automatic background update...");
      updateServiceWorker(true);
    }
  }, [needRefresh, updateServiceWorker]);

  // 1.5. Listen for the new service worker taking control (automatic reload on updates)
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      let refreshing = false;
      const handleControllerChange = () => {
        // Only reload if the page was previously controlled by an older service worker
        if (navigator.serviceWorker.controller && !refreshing) {
          refreshing = true;
          console.log("[PWA] New version activated. Performing hard refresh to fetch latest assets...");
          window.location.reload();
        }
      };
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
      return () => {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      };
    }
  }, []);

  // 2. Handle ChunkLoadError (fails to import lazy bundles because files changed on server)
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      const errorMsg = event.message || "";
      const isChunkLoadFailed = 
        errorMsg.includes("ChunkLoadError") || 
        errorMsg.includes("Loading chunk") || 
        errorMsg.includes("Failed to fetch dynamically imported module");

      if (isChunkLoadFailed) {
        console.warn("[PWA] Chunk load failed. Force reloading to active build...");
        window.location.reload();
      }
    };

    window.addEventListener("error", handleGlobalError);
    return () => window.removeEventListener("error", handleGlobalError);
  }, []);

  return null; // Runs invisibly and automatically in the background
}
export default PWAUpdateToast;
