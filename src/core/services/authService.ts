import { supabase } from './supabaseClient';

interface User {
  id: string;
  email?: string;
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

// Define your app's redirect URL for Supabase configuration
const REDIRECT_URL = `${window.location.origin}/app`;

export const authService = {
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new Error(error.message);

      // Remove manual redirect, let the component handle it
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          // Add explicit redirect URL
          emailRedirectTo: REDIRECT_URL,
        },
      });

      if (error) throw new Error(error.message);

      // For email confirmation flows
      return {
        user: data.user,
        session: data.session,
        needsEmailConfirmation: !data.session,
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
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: REDIRECT_URL,
        },
      });

      if (error) throw new Error(error.message);

      return {
        user: null, // Will be populated after redirect
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error : new Error('An unknown error occurred'),
      };
    }
  },

  async signOut(): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw new Error(error.message);

      return { error: null };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error('An unknown error occurred'),
      };
    }
  },

  async confirmEmail(): Promise<{ error: Error | null }> {
    try {
      // The link from the email will be handled automatically by Supabase
      // This method would only be needed for manual verification
      return { error: null };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error('An unknown error occurred'),
      };
    }
  },

  async resendConfirmation(email: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) throw new Error(error.message);

      return { error: null };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error('An unknown error occurred'),
      };
    }
  },

  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.getSession();

      // Extract user from session if it exists
      const user = data.session?.user || null;

      if (error) throw new Error(error.message);

      return {
        user,
        session: data.session,
        error: null,
      };
    } catch (error) {
      console.error('getCurrentUser error:', error);
      return {
        user: null,
        error: error instanceof Error ? error : new Error('An unknown error occurred'),
      };
    }
  },

  async forgotPassword(email: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw new Error(error.message);

      return { error: null };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error('An unknown error occurred'),
      };
    }
  },

  async resetPassword(password: string): Promise<{ error: Error | null }> {
    try {
      // When using the reset password link, Supabase automatically extracts
      // the token from the URL, so we only need to provide the new password
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw new Error(error.message);

      return { error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        error: error instanceof Error ? error : new Error('An unknown error occurred'),
      };
    }
  },
};
