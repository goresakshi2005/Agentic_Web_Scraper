import React from 'react';

export default function ErrorBanner({ message, onRetry, onClose }) {
  if (!message) return null;

  return (
    <div className="fixed left-1/2 transform -translate-x-1/2 top-6 z-50 w-[min(90%,720px)]">
      <div className="p-4 bg-red-50 dark:bg-red-900/80 border border-red-200 dark:border-red-800 text-red-700 rounded-lg shadow-md flex items-start justify-between gap-4">
        <div className="flex-1 text-sm">{message}</div>
        <div className="flex items-center gap-2">
          {onRetry && (
            <button onClick={onRetry} className="px-3 py-1 bg-white dark:bg-slate-800 rounded text-sm border">Retry</button>
          )}
          {onClose && (
            <button onClick={onClose} aria-label="Close error" className="px-2 py-1 text-sm text-red-600">✕</button>
          )}
        </div>
      </div>
    </div>
  );
}
