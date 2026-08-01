// src/components/ui/Toast.tsx
import { Toaster, toast } from 'react-hot-toast';


export const ToastContainer = () => (
  <Toaster
    position="top-right"
    toastOptions={{
      duration: 4000,
      style: {
        background: '#333',
        color: '#fff',
        fontSize: '0.9rem',
      },
    }}
  />
);

// Optional helpers for consistent toast usage
export const showSuccess = (message: string) => toast.success(message);
export const showError = (message: string) => toast.error(message);
