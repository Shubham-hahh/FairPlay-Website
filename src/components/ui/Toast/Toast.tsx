import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styles from './Toast.module.css';

export type ToastKind = 'success' | 'error' | 'info';

export type ToastItem = {
  id: string;
  kind: ToastKind;
  message: string;
  duration?: number; // ms
};

type ToastContextValue = {
  push: (kind: ToastKind, message: string, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Record<string, number>>({});

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const handle = timers.current[id];
    if (handle) {
      window.clearTimeout(handle);
      delete timers.current[id];
    }
  }, []);

  const push = useCallback((kind: ToastKind, message: string, duration = 4000) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, kind, message, duration }]);
    timers.current[id] = window.setTimeout(() => remove(id), duration);
  }, [remove]);

  // Convenience helpers
  const value = useMemo<ToastContextValue>(() => ({
    push,
    success: (m, d) => push('success', m, d),
    error: (m, d) => push('error', m, d),
    info: (m, d) => push('info', m, d),
  }), [push]);

  // Clear timers on unmount
  useEffect(() => () => {
    Object.values(timers.current).forEach((h) => window.clearTimeout(h));
    timers.current = {};
  }, []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={remove} />
    </ToastContext.Provider>
  );
};

export const ToastContainer: React.FC<{ toasts: ToastItem[]; onClose: (id: string) => void }> = ({ toasts, onClose }) => {
  const { t } = useTranslation('common');

  return (
    <div className={styles.container} role="region" aria-label="Notifications">
      {toasts.map((t) => (
        <div key={t.id} className={`${styles.toast} ${styles[t.kind]}`} role="status" aria-live={t.kind === 'error' ? 'assertive' : 'polite'}>
          <div className={styles.message}>{t.message}</div>
          <button className={styles.close} aria-label={t('close')} onClick={() => onClose(t.id)}>×</button>
        </div>
      ))}
    </div>
  );
};