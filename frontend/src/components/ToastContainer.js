import React from 'react';
import { useToast } from '../context/ToastContext';

const iconMap = { success: 'fa-circle-check', error: 'fa-circle-exclamation', info: 'fa-circle-info' };
const borderCls = { success: 'border-l-green-500', error: 'border-l-red-500', info: 'border-l-blue-500' };
const textCls = { success: 'text-green-400', error: 'text-red-400', info: 'text-blue-400' };

const ToastContainer = () => {
  const { toasts } = useToast();
  return (
    <div className="fixed bottom-8 right-8 z-[9999] flex flex-col gap-2.5 max-w-sm" data-testid="toast-stack">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`bg-ink-800 border border-ink-700 border-l-[3px] rounded-xl px-5 py-3.5 flex items-center gap-3 text-sm font-medium shadow-card animate-slideIn ${borderCls[t.type] || borderCls.info}`}
          data-testid={`toast-${t.type}`}
        >
          <i className={`fa-solid ${iconMap[t.type] || iconMap.info} ${textCls[t.type] || textCls.info}`}></i>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
