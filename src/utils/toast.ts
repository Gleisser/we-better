// src/utils/toast.ts
import toast from 'react-hot-toast';

export const showToast = {
  success: (message: string, options = {}) => 
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#1A1A1A',
        color: '#fff',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '12px',
        padding: '16px 24px',
        fontSize: '14px',
        maxWidth: '400px',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
      },
      ...options
    }),
  
  error: (message: string, options = {}) => 
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#1A1A1A',
        color: '#fff',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '12px',
        padding: '16px 24px',
        fontSize: '14px',
        maxWidth: '400px',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
      },
      ...options
    }),
  info: (message: string, options = {}) =>
    toast.custom(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#1A1A1A',
        color: '#fff',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '12px',
        padding: '16px 24px',
        fontSize: '14px',
        maxWidth: '400px',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
      },
      ...options
    }),
  warning: (message: string, options = {}) =>
    toast.custom(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#1A1A1A',
        color: '#fff',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '12px',
        padding: '16px 24px',
        fontSize: '14px',
        maxWidth: '400px',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
      },
      ...options
    }),
  loading: (message: string, options = {}) =>
    toast.loading(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#1A1A1A',
        color: '#fff',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '12px',
        padding: '16px 24px',
        fontSize: '14px',
        maxWidth: '400px',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
      },
      ...options
    }),
  promise: (promise: Promise<any>, msgs: { loading: string, success: string, error: string }, options = {}) =>
    toast.promise(promise, msgs, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#1A1A1A',
        color: '#fff',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '12px',
        padding: '16px 24px',
        fontSize: '14px',
        maxWidth: '400px',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
      },
      ...options
    }),
  // Add more as needed: loading, promise, etc.
};

export default showToast;