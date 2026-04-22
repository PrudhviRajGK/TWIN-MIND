import { AlertCircle, X, RefreshCw } from "lucide-react";

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
  type?: 'error' | 'warning' | 'info';
}

export default function ErrorBanner({ 
  message, 
  onDismiss, 
  onRetry,
  type = 'error' 
}: ErrorBannerProps) {
  const styles = {
    error: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      icon: 'text-red-400',
    },
    warning: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-400',
      icon: 'text-yellow-400',
    },
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      icon: 'text-blue-400',
    },
  };

  const style = styles[type];

  return (
    <div className={`${style.bg} border ${style.border} rounded-lg p-3 flex items-start gap-3`}>
      <AlertCircle size={18} className={`${style.icon} mt-0.5 flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${style.text}`}>{message}</p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {onRetry && (
          <button
            onClick={onRetry}
            className={`p-1 rounded hover:bg-white/10 transition-colors ${style.text}`}
            aria-label="Retry"
          >
            <RefreshCw size={16} />
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`p-1 rounded hover:bg-white/10 transition-colors ${style.text}`}
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
