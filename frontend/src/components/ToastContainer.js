import React from 'react';
import { useToast } from '../context/ToastContext';

const iconMap = { success: 'fa-circle-check', error: 'fa-circle-exclamation', info: 'fa-circle-info' };

const ToastContainer = () => {
  const { toasts } = useToast();
  return (
    <div className="toast-stack" data-testid="toast-stack">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`} data-testid={`toast-${t.type}`}>
          <i className={`fa-solid ${iconMap[t.type] || iconMap.info}`}></i>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
