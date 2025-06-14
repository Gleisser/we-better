import React from 'react';
import styles from './ErrorBoundary.module.css';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  section?: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error(`Error in ${this.props.section || 'component'}:`, error);
    this.props.onError?.(error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorBackground} />
          <div className={styles.errorContent}>
            <img src="/assets/images/error.webp" alt="Error" className={styles.errorImage} />
            <h1 className={styles.errorTitle}>
              {this.props.section
                ? `${this.props.section} is currently unavailable`
                : 'Something went wrong'}
            </h1>
            <p className={styles.errorMessage}>
              {this.state.error?.message || 'Please try again later'}
            </p>
            <button onClick={() => window.location.reload()} className={styles.refreshButton}>
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
