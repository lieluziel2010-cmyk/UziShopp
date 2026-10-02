import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 start-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none w-full max-w-sm px-4">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 w-full py-2.5 px-4 rounded-2xl shadow-lg border backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${
              isSuccess
                ? 'bg-white/95 border-purple-200 text-slate-800 shadow-purple-500/10'
                : isError
                ? 'bg-white/95 border-rose-200 text-rose-950 shadow-rose-500/10'
                : 'bg-white/95 border-sky-200 text-slate-800 shadow-sky-500/10'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {isSuccess && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-pink-400 to-purple-500 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              {isError && (
                <div className="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              {!isSuccess && !isError && (
                <div className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center shrink-0">
                  <Info className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <span className="text-xs font-semibold truncate leading-snug">
                {toast.text}
              </span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-full transition-colors shrink-0"
              aria-label="סגור"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
