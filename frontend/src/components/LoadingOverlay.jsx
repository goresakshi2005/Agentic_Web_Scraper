import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingOverlay({ visible, label = 'Analyzing…' }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" role="status" aria-live="polite" aria-label={label}>
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
        <Loader2 className="animate-spin" />
        <div className="text-sm font-medium">{label}</div>
      </div>
    </div>
  );
}
