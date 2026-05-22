'use client';

import { useEffect } from 'react';

export function ErrorSuppressor() {
  useEffect(() => {
    // Suppress unhandled rejection from MetaMask and other extensions
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (
        event.reason &&
        (String(event.reason).includes('MetaMask') ||
          String(event.reason).includes('chrome-extension') ||
          (event.reason.message && event.reason.message.includes('MetaMask')))
      ) {
        event.preventDefault();
      }
    };

    // Suppress console errors from extensions
    const handleError = (event: ErrorEvent) => {
      if (
        event.message &&
        (event.message.includes('MetaMask') ||
          event.message.includes('chrome-extension'))
      ) {
        event.preventDefault();
        return true;
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return null;
}
