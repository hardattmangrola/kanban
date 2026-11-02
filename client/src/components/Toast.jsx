import React from 'react';
import { useTaskStore } from '../store/useTaskStore.js';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const Toast = () => {
  const { toast, clearToast } = useTaskStore();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />,
    info: <Info className="w-4 h-4 text-zinc-400 shrink-0" />,
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full px-2 animate-slide-up pointer-events-auto">
      <div
        className="flex items-start gap-2.5 p-3 rounded-lg bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-800 dark:border-zinc-200 shadow-xl transition-all"
        role="alert"
      >
        {icons[toast.type] || icons.info}
        <div className="flex-1 text-xs font-normal leading-relaxed">
          {toast.message}
        </div>
        <button
          onClick={clearToast}
          className="text-zinc-400 hover:text-zinc-100 dark:text-zinc-500 dark:hover:text-zinc-900 p-0.5"
          aria-label="Close notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
