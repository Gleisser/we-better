import { useState, useCallback } from 'react';
import { getDetailedErrorMessage, getErrorCode } from '@/utils/error-handling';

interface ErrorState {
  hasError: boolean;
  message: string;
  code: string;
  timestamp: number;
}

interface UseErrorHandlerOptions {
  onError?: (error: unknown) => void;
  fallbackMessage?: string;
}

export function useErrorHandler({ 
  onError, 
  fallbackMessage = 'An unexpected error occurred' 
}: UseErrorHandlerOptions = {}) {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    message: '',
    code: '',
    timestamp: 0,
  });

  const handleError = useCallback((error: unknown) => {
    const errorMessage = getDetailedErrorMessage(error);
    const errorCode = getErrorCode(error);
    
    setErrorState({
      hasError: true,
      message: errorMessage || fallbackMessage,
      code: errorCode,
      timestamp: Date.now(),
    });

    // Call custom error handler if provided
    onError?.(error);

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${errorCode}]`, error);
    }
  }, [fallbackMessage, onError]);

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      message: '',
      code: '',
      timestamp: 0,
    });
  }, []);

  const isError = errorState.hasError;
  const error = isError ? errorState : null;

  return {
    handleError,
    clearError,
    isError,
    error,
  };
} 