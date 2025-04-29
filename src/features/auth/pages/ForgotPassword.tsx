import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '@/core/services/authService';
import styles from './Login.module.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const { error } = await authService.forgotPassword(email);
      
      if (error) throw error;
      
      setSuccessMessage('Password reset instructions have been sent to your email');
      setEmail(''); // Clear the form
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send reset instructions');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Left Panel - Quote Section */}
      <div className={styles.quotePanel}>
        <div className={styles.quoteContent}>
          <span className={styles.quoteLabel}>A Wise Quote</span>
          <div className={styles.quoteTextContainer}>
            <h2 className={styles.quoteTitle}>
              Reset Password
              <br />
              Get Back Access
            </h2>
            <p className={styles.quoteText}>
              Don't worry, we'll help you recover your account.
              Just enter your email and follow the instructions.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form Section */}
      <div className={styles.formPanel}>
        <div className={styles.formWrapper}>
          <div className={styles.formSection}>
            <h1 className={styles.title}>Reset Password</h1>
            <p className={styles.subtitle}>
              Enter your email to receive reset instructions
            </p>

            {error && <div className={styles.error}>{error}</div>}
            {successMessage && <div className={styles.success}>{successMessage}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Instructions'}
              </button>
            </form>

            <div className={styles.formFooter}>
              <Link to="/auth/login" className={styles.backToLogin}>
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword; 