import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { authService } from '@/core/services/authService';
import styles from './Login.module.css'; // We'll reuse the login styles for now

const SignUp = (): JSX.Element => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isConfirmationSent, setIsConfirmationSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const {
        user,
        error: authError,
        needsEmailConfirmation,
      } = await authService.signUp(email, password);

      if (authError) throw authError;

      if (needsEmailConfirmation) {
        setIsConfirmationSent(true);
      } else if (user) {
        navigate('/app');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async (): Promise<void> => {
    setError('');
    setIsLoading(true);

    try {
      const { error: authError } = await authService.signInWithGoogle();
      if (authError) throw authError;
      // The redirect will happen automatically
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to sign in with Google');
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async (): Promise<void> => {
    try {
      const { error } = await authService.resendConfirmation(email);
      if (error) {
        setError(error.message);
      } else {
        setError('Confirmation email resent. Please check your inbox.');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to resend confirmation email');
    }
  };

  if (isConfirmationSent) {
    return (
      <>
        {/* Left Panel - Quote Section */}
        <div className={styles.quotePanel}>
          <div className={styles.quoteContent}>
            <span className={styles.quoteLabel}>Almost There!</span>
            <div className={styles.quoteTextContainer}>
              <h2 className={styles.quoteTitle}>
                Check Your
                <br />
                Email
              </h2>
              <p className={styles.quoteText}>
                We're excited to have you join our community. Just one more step to get started!
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Confirmation Message */}
        <div className={styles.formPanel}>
          <div className={styles.formWrapper}>
            <div className={styles.formSection}>
              <h1 className={styles.title}>Check Your Email</h1>
              <p className={styles.subtitle}>We've sent a confirmation link to:</p>
              <p className={styles.emailHighlight}>{email}</p>

              {error && <div className={styles.error}>{error}</div>}

              <div className={styles.confirmationActions}>
                <p className={styles.resendPrompt}>Didn't receive the email?</p>
                <button onClick={handleResendConfirmation} className={styles.submitButton}>
                  Resend Confirmation
                </button>

                <Link to="/auth/login" className={styles.googleButton}>
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Left Panel - Quote Section */}
      <div className={styles.quotePanel}>
        <div className={styles.quoteContent}>
          <span className={styles.quoteLabel}>Start Your Journey</span>
          <div className={styles.quoteTextContainer}>
            <h2 className={styles.quoteTitle}>
              Begin Your
              <br />
              Journey Today
            </h2>
            <p className={styles.quoteText}>
              Join our community of self-improvers and start your journey towards becoming your best
              self.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className={styles.formPanel}>
        <div className={styles.formWrapper}>
          <div className={styles.formSection}>
            <h1 className={styles.title}>Create Account</h1>
            <p className={styles.subtitle}>Enter your details to create your account</p>

            {error && <div className={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="password">Password</label>
                <div className={styles.passwordInput}>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.passwordToggle}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className={styles.passwordInput}>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={styles.passwordToggle}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button type="submit" className={styles.submitButton} disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>

              <button
                type="button"
                className={styles.googleButton}
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <img
                  src="/assets/images/icons/google_logo.png"
                  alt=""
                  className={styles.googleIcon}
                />
                Sign Up with Google
              </button>
            </form>

            <p className={styles.signupPrompt}>
              Already have an account?
              <Link to="/auth/login" className={styles.signupLink}>
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp;
