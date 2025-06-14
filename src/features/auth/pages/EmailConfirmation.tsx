import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authService } from '@/core/services/authService';
import styles from './Login.module.css';

const EmailConfirmation = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const confirmEmail = async (): Promise<void> => {
      try {
        const hash = location.hash;
        if (!hash) {
          throw new Error('Invalid confirmation link');
        }

        // Extract token from hash
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');

        if (!accessToken) {
          throw new Error('Invalid confirmation link');
        }

        await authService.confirmEmail();

        // Redirect to login after short delay
        setTimeout(() => {
          navigate('/auth/login', {
            state: { message: 'Email confirmed successfully. Please log in.' },
          });
        }, 2000);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to confirm email');
      } finally {
        setIsProcessing(false);
      }
    };

    confirmEmail();
  }, [navigate, location]);

  return (
    <div className={styles.confirmationContainer}>
      {isProcessing ? (
        <h2>Confirming your email...</h2>
      ) : error ? (
        <>
          <h2>Error</h2>
          <p className={styles.error}>{error}</p>
          <Link to="/auth/login" className={styles.backToLogin}>
            Back to Login
          </Link>
        </>
      ) : (
        <>
          <h2>Email Confirmed!</h2>
          <p>Redirecting to login...</p>
        </>
      )}
    </div>
  );
};

export default EmailConfirmation;
