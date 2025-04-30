import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('3D Visualization error:', error, errorInfo);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            style={{
              textAlign: 'center',
              padding: '20px',
              backgroundColor: 'rgba(0,0,0,0.5)',
              borderRadius: '8px',
            }}
          >
            <p>Unable to load visualization</p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
