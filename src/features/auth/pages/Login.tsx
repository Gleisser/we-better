import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { authService } from '@/core/services/authService';
import styles from './Login.module.css';

const Login = (): JSX.Element => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const isGoogleAuthEnabled = authService.isGoogleAuthEnabled();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { user, error: authError } = await authService.signIn(email, password);

      if (authError) {
        throw authError;
      }

      if (!user) {
        console.warn('Sign in returned empty user object');
        setError('Authentication failed - no user returned');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError(error instanceof Error ? error.message : 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async (): Promise<void> => {
    if (!isGoogleAuthEnabled) {
      setError(authService.getGoogleAuthUnavailableMessage());
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const { error: authError } = await authService.signInWithGoogle();
      if (authError) {
        throw authError;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google');
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
              Get Everything
              <br />
              You Want
            </h2>
            <p className={styles.quoteText}>
              You can get everything you want if you work hard, trust the process, and stick to the
              plan.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className={styles.formPanel}>
        <div className={styles.formWrapper}>
          {/* Form Section */}
          <div className={styles.formSection}>
            <h1 className={styles.title}>Welcome Back</h1>
            <p className={styles.subtitle}>Enter your email and password to access your account</p>

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
                    placeholder="Enter your password"
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

              <div className={styles.options}>
                <label className={styles.rememberMe}>
                  <input id="remember-me" name="rememberMe" type="checkbox" />
                  <span>Remember me</span>
                </label>
                <Link to="/auth/forgot-password" className={styles.forgotPassword}>
                  Forgot Password
                </Link>
              </div>

              <button type="submit" className={styles.submitButton} disabled={isLoading}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>

              <button
                type="button"
                className={styles.googleButton}
                onClick={handleGoogleSignIn}
                disabled={isLoading || !isGoogleAuthEnabled}
              >
                <img
                  src="/assets/images/icons/google_logo.png"
                  alt=""
                  className={styles.googleIcon}
                />
                {authService.getGoogleAuthButtonLabel()}
              </button>
            </form>

            <p className={styles.signupPrompt}>
              Don't have an account?
              <Link to="/auth/signup" className={styles.signupLink}>
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
