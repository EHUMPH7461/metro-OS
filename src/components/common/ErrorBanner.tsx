import { AlertCircle, X } from 'lucide-react';

export function ErrorBanner({ message, onDismiss, onRetry }: { message: string; onDismiss: () => void; onRetry?: () => void }) {
  return <div className="error-banner" role="alert"><AlertCircle size={18}/><span>{message}</span>{onRetry && <button onClick={onRetry}>Retry</button>}<button className="icon" onClick={onDismiss} aria-label="Dismiss error"><X size={16}/></button></div>;
}
