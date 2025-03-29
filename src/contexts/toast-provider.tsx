import { Toaster } from 'react-hot-toast';
import { type ReactNode } from 'react';

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps): JSX.Element {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--color-background)',
            color: 'var(--color-text)',
            borderRadius: '0.5rem',
            border: '1px solid var(--color-border)',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: 'var(--color-success)',
              secondary: 'var(--color-background)',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: 'var(--color-error)',
              secondary: 'var(--color-background)',
            },
          },
        }}
      />
      {children}
    </>
  );
} 