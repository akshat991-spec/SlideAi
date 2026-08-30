import React, { createContext, useContext, useCallback } from 'react';
import toast from 'react-hot-toast';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const showSuccess = useCallback((msg) => toast.success(msg), []);
  const showError   = useCallback((msg) => toast.error(msg), []);
  const showInfo    = useCallback((msg) => toast(msg), []);
  const showLoading = useCallback((msg) => toast.loading(msg), []);
  const dismiss     = useCallback((id)  => toast.dismiss(id), []);

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showInfo, showLoading, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
