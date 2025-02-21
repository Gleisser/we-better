import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { authService } from '@/services/authService';
import styles from './Login.module.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    //Retrieve all search params
    const searchParamsArray = [];
    for (const [key, value] of searchParams.entries()) {
      searchParamsArray.push({ key, value });
    }
    console.log(searchParamsArray);

    if (!token) {
      setError('Invalid reset link');
      return;
    }

    // Verify the token
    authService.verifyResetToken(token).catch(() => {
      
      setError('This reset link is invalid or has expired');
    });
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    const token = searchParams.get('token');
    
    //Retrieve all search params
    const searchParamsArray = [];
    for (const [key, value] of searchParams.entries()) {
      searchParamsArray.push({ key, value });
    }
    console.log(searchParamsArray);

    if (!token) {
      setError('Invalid reset link');
      return;
    }

    try {
      const { error } = await authService.resetPassword(password, token);
      
      if (error) throw error;
      
      setSuccessMessage('Password updated successfully');
      setTimeout(() => navigate('/auth/login'), 2000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={styles.quotePanel}>
        <div className={styles.quoteContent}>
          <span className={styles.quoteLabel}>Reset Password</span>
          <div className={styles.quoteTextContainer}>
            <h2 className={styles.quoteTitle}>
              Create New
              <br />
              Password
            </h2>
            <p className={styles.quoteText}>
              Choose a strong password to protect your account.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.formPanel}>
        <div className={styles.formWrapper}>
          <div className={styles.formSection}>
            <h1 className={styles.title}>Reset Your Password</h1>
            <p className={styles.subtitle}>
              Enter your new password below
            </p>

            {error && <div className={styles.error}>{error}</div>}
            {successMessage && <div className={styles.success}>{successMessage}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="password">New Password</label>
                <div className={styles.passwordInput}>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your new password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.passwordToggle}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword; 