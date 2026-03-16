'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type AppToastType = 'success' | 'warning' | 'info';

type AppToastProps = {
  open: boolean;
  message: string;
  type?: AppToastType;
  onClose: () => void;
};

const iconByType: Record<AppToastType, React.ReactNode> = {
  success: <CheckCircle2 className="app-toast__icon" />,
  warning: <AlertCircle className="app-toast__icon" />,
  info: <Info className="app-toast__icon" />,
};

export default function AppToast({ open, message, type = 'info', onClose }: AppToastProps) {
  useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(onClose, 2600);
    return () => clearTimeout(timeout);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={`app-toast app-toast--${type}`} role="status" aria-live="polite">
      {iconByType[type]}
      <span className="app-toast__text">{message}</span>
      <button className="app-toast__close" onClick={onClose} aria-label="Bildirimi kapat">
        <X className="app-toast__close-icon" />
      </button>
    </div>
  );
}
