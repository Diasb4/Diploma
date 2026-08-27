import React from 'react';
import { X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastRegion: React.FC = () => {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="fixed bottom-4 right-4 z-[70] w-[min(360px,calc(100vw-2rem))] space-y-2" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div key={toast.id} className="flex items-start justify-between gap-3 rounded-lg border border-slate-300 bg-white p-3 text-sm shadow-md dark:border-slate-700 dark:bg-[#171d27]">
          <p><strong>{toast.tone === 'error' ? 'Ошибка. ' : toast.tone === 'success' ? 'Готово. ' : ''}</strong>{toast.text}</p>
          <button onClick={() => dismissToast(toast.id)} aria-label="Закрыть уведомление" className="rounded p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-4 w-4" /></button>
        </div>
      ))}
    </div>
  );
};
