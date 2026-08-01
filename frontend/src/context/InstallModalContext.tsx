import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { InstallAppModal } from '../components/InstallAppModal';

type InstallModalContextType = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const InstallModalContext = createContext<InstallModalContextType | null>(null);

export function InstallModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <InstallModalContext.Provider value={{ isOpen, open, close }}>
      {children}
      <InstallAppModal isOpen={isOpen} onClose={close} />
    </InstallModalContext.Provider>
  );
}

export function useInstallModal() {
  const ctx = useContext(InstallModalContext);
  if (!ctx) return { isOpen: false, open: () => {}, close: () => {} };
  return ctx;
}
