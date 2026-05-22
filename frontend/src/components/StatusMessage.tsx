import type { ReactNode } from 'react';

type StatusMessageVariant = 'success' | 'error' | 'info';

interface StatusMessageProps {
  variant: StatusMessageVariant;
  children: ReactNode;
}

export function StatusMessage({ variant, children }: StatusMessageProps) {
  return (
    <div className={`status-message status-message--${variant}`} role="status">
      {children}
    </div>
  );
}
