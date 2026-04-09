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
const GOOGLE_AUTH_ENABLED = import.meta.env.VITE_AUTH_GOOGLE_ENABLED === 'true';
const GOOGLE_AUTH_BUTTON_LABEL = 'Continue with Google';
const GOOGLE_AUTH_DISABLED_LABEL = 'Google Sign-In Unavailable';
const GOOGLE_AUTH_UNAVAILABLE_MESSAGE =
  'Google sign-in is currently unavailable. Please use email and password.';

const isUnsupportedGoogleProviderError = (message: string): boolean => {
  const normalized = message.toLowerCase();
  return normalized.includes('unsupported provider') || normalized.includes('validation_failed');
};

export const authService = {
  isGoogleAuthEnabled(): boolean {
    return GOOGLE_AUTH_ENABLED;
  },

  getGoogleAuthButtonLabel(): string {
    return GOOGLE_AUTH_ENABLED ? GOOGLE_AUTH_BUTTON_LABEL : GOOGLE_AUTH_DISABLED_LABEL;
  },

  getGoogleAuthUnavailableMessage(): string {
    return GOOGLE_AUTH_UNAVAILABLE_MESSAGE;
  },

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
            display_name: fullName,
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
      if (!GOOGLE_AUTH_ENABLED) {
        throw new Error(GOOGLE_AUTH_UNAVAILABLE_MESSAGE);
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: REDIRECT_URL,
        },
      });

      if (error) {
        if (isUnsupportedGoogleProviderError(error.message)) {
          throw new Error(GOOGLE_AUTH_UNAVAILABLE_MESSAGE);
        }
        throw new Error(error.message);
      }

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
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) throw new Error(sessionError.message);

      if (!sessionData.session) {
        return {
          user: null,
          session: null,
          error: null,
        };
      }

      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError) {
        if (userError.name === 'AuthSessionMissingError') {
          return {
            user: null,
            session: null,
            error: null,
          };
        }

        throw new Error(userError.message);
      }

      return {
        user: userData.user ?? null,
        session: sessionData.session,
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
