import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { authService } from '@/services/authService';
import { supabase } from '@/services/supabaseClient';
import styles from './Login.module.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [hashProcessed, setHashProcessed] = useState(false);

  // Process the authentication hash when the component mounts
  useEffect(() => {
    const handleAuthRedirect = async () => {
      try {
        setIsLoading(true);
        
        // Check if we have the required hash parameters
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        
        // Log the hash params for debugging
        console.log('Hash params:', { accessToken: !!accessToken, refreshToken: !!refreshToken, type });
        
        // This crucial step processes the hash fragment and establishes the session
        const { data, error } = await supabase.auth.getSession();
        
        console.log('Session data:', data);
        
        if (error) {
          console.error("Failed to get session:", error);
          setError("Failed to verify your recovery link. Please try requesting a new password reset.");
          return;
        }
        
        if (!data.session) {
          console.warn("No session found in redirect");
          setError("Your recovery link appears to be invalid or expired. Please request a new one.");
          return;
        }
        
        console.log("Auth redirect processed successfully", data.session?.user?.id);
        setHashProcessed(true);
      } catch (err) {
        console.error("Error handling auth redirect:", err);
        setError("An unexpected error occurred. Please try again or request a new reset link.");
      } finally {
        setIsLoading(false);
      }
    };

    handleAuthRedirect();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (!hashProcessed) {
        throw new Error("Please wait for your recovery link to be verified before resetting your password.");
      }
      
      const { error } = await authService.resetPassword(password);
      
      if (error) throw error;
      
      setSuccessMessage('Password updated successfully');
      setTimeout(() => navigate('/auth/login'), 2000);
    } catch (error) {
      console.error("Password reset error:", error);
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

            {isLoading && !hashProcessed && (
              <div className={styles.loading}>Verifying your reset link...</div>
            )}

            {(hashProcessed || !isLoading) && (
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
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword; 