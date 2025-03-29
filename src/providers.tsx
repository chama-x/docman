import { type ReactNode } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from 'react-error-boundary';
import { BrowserRouter } from 'react-router-dom';
import { QueryProvider } from '@/contexts/query-client';
import { ToastProvider } from '@/contexts/toast-provider';

interface ProvidersProps {
  children: ReactNode;
}

// Fallback component for ErrorBoundary
function ErrorFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h2 className="mb-4 text-2xl font-bold text-red-600">
        Something went wrong
      </h2>
      <p className="mb-6 text-gray-600">
        We've encountered an unexpected error. Please try refreshing the page.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="rounded bg-primary-600 px-4 py-2 font-bold text-white transition hover:bg-primary-700"
      >
        Refresh the page
      </button>
    </div>
  );
}

export function Providers({ children }: ProvidersProps): JSX.Element {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <HelmetProvider>
        <BrowserRouter>
          <QueryProvider>
            <ToastProvider>{children}</ToastProvider>
          </QueryProvider>
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  );
} 