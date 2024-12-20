import React from 'react';
import styles from './ErrorBoundary.module.css';

interface Props {
  children: React.ReactNode;
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

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorBackground} />
          <div className={styles.errorContent}>
            <img 
              src="/assets/images/error/error.webp" 
              alt="Error" 
              className={styles.errorImage}
            />
            <h1 className={styles.errorTitle}>Oops! Something went wrong</h1>
            <p className={styles.errorMessage}>
              Our team of AI robots is working hard to fix this issue.
              Please try again later!
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className={styles.refreshButton}
            >
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