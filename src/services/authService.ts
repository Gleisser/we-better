interface User {
  id: string;
  email: string;
  full_name?: string;
  // Add other user properties as needed
}

interface Session {
  access_token: string;
  // Add other session properties as needed
}

export interface AuthResponse {
  user: User | null;
  session?: Session | null;
  error: Error | null;
  needsEmailConfirmation?: boolean;
}

const API_URL = import.meta.env.VITE_USER_API_BASE_URL || 'http://localhost:3000/api';

export const authService = {
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Important for handling cookies
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign in');
      }

      return {
        user: data.user,
        session: data.session,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error : new Error('An unknown error occurred'),
      };
    }
  },

  async signUp(email: string, password: string, fullName?: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password,
          full_name: fullName 
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up');
      }

      return {
        user: data.user,
        needsEmailConfirmation: true,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error : new Error('An unknown error occurred'),
      };
    }
  },

  async signInWithGoogle(): Promise<AuthResponse> {
    // TODO: Implement when backend supports Google auth
    return {
      user: null,
      error: new Error('Google sign-in not implemented yet')
    };
  },

  async signOut(): Promise<{ error: Error | null }> {
    try {
      const response = await fetch(`${API_URL}/auth/signout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to sign out');
      }

      return { error: null };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error('An unknown error occurred'),
      };
    }
  },

  async confirmEmail(token: string): Promise<{ error: Error | null }> {
    try {
      const response = await fetch(`${API_URL}/auth/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to confirm email');
      }

      return { error: null };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error('An unknown error occurred'),
      };
    }
  },

  async resendConfirmation(email: string): Promise<{ error: Error | null }> {
    try {
      const response = await fetch(`${API_URL}/auth/resend-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend confirmation email');
      }

      return { error: null };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error('An unknown error occurred'),
      };
    }
  },

  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/session`, {
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get current user');
      }

      return {
        user: data.user,
        session: data.session,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error : new Error('An unknown error occurred'),
      };
    }
  },

  async forgotPassword(email: string): Promise<{ error: Error | null }> {
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset instructions');
      }

      return { error: null };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error('An unknown error occurred'),
      };
    }
  },

  async verifyResetToken(token: string): Promise<{ error: Error | null }> {
    console.log(token);
    try {
      const response = await fetch(`${API_URL}/auth/verify-reset-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid reset token');
      }

      return { error: null };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error('An unknown error occurred'),
      };
    }
  },

  async resetPassword(password: string, token: string): Promise<{ error: Error | null }> {
    console.log(password, token);
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password, token }),
        credentials: 'include',
      });

      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      return { error: null };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error('An unknown error occurred'),
      };
    }
  }
}; 