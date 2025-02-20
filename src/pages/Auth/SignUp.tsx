import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import styles from './Login.module.css'; // We'll reuse the login styles for now

const SignUp = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement actual signup logic
      console.log('Signup attempt with:', { email, password });
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/app');
    } catch (error) {
      setError('Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

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
              Join our community of self-improvers and start your
              journey towards becoming your best self.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className={styles.formPanel}>
        <div className={styles.formWrapper}>
          <div className={styles.formSection}>
            <h1 className={styles.title}>Create Account</h1>
            <p className={styles.subtitle}>
              Enter your details to create your account
            </p>

            {error && <div className={styles.error}>{error}</div>}

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

              <div className={styles.inputGroup}>
                <label htmlFor="password">Password</label>
                <div className={styles.passwordInput}>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                    onChange={(e) => setConfirmPassword(e.target.value)}
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

              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>

              <button type="button" className={styles.googleButton}>
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