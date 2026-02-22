import React from 'react';

export default function Toast({ visible, message, type = 'info' }) {
  if (!visible) return null;

  const base = 'max-w-sm w-full px-4 py-3 rounded-lg shadow-lg border flex items-start gap-3';
  const variants = {
    info: base + ' bg-slate-50 border-slate-200 text-slate-800',
    success: base + ' bg-green-50 border-green-200 text-green-800',
    error: base + ' bg-red-50 border-red-200 text-red-800',
  };

  return (
    <div className="fixed right-4 bottom-6 z-50">
      <div className={variants[type] || variants.info} role="status" aria-live="polite">
        <div className="flex-1 text-sm leading-snug">{message}</div>
      </div>
    </div>
  );
}
