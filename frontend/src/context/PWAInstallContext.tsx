import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void> };

type PWAInstallContextType = {
  canInstall: boolean;
  isInstalled: boolean;
  triggerInstall: () => Promise<void>;
  installPrompt: BeforeInstallPromptEvent | null;
};

const PWAInstallContext = createContext<PWAInstallContextType>({
  canInstall: false,
  isInstalled: false,
  triggerInstall: async () => {},
  installPrompt: null,
});

export function PWAInstallProvider({ children }: { children: ReactNode }) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    const installedHandler = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const triggerInstall = useCallback(async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    setInstallPrompt(null);
  }, [installPrompt]);

  const value: PWAInstallContextType = {
    canInstall: !!installPrompt,
    isInstalled,
    triggerInstall,
    installPrompt,
  };

  return (
    <PWAInstallContext.Provider value={value}>
      {children}
    </PWAInstallContext.Provider>
  );
}

export function usePWAInstall() {
  return useContext(PWAInstallContext);
}
