import { Loader2 } from "lucide-react";

export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="loading-state">
      <Loader2 size={32} className="spinner" />
      <p>{message}</p>
    </div>
  );
}

export function EmptyState({ message = "No data found" }: { message?: string }) {
  return (
    <div className="empty-state">
      <p>{message}</p>
    </div>
  );
}

export function ErrorState({ message = "Something went wrong", onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="error-state">
      <p>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-primary">
          Try Again
        </button>
      )}
    </div>
  );
}