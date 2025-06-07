import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Determine if we're on a reset-password route
//const isResetPasswordFlow = window.location.pathname.includes('/auth/reset-password');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Only redirect to app if NOT in password reset flow
    //redirectTo: isResetPasswordFlow ? undefined : `${window.location.origin}/app`, uncomment this to redirect to app if something goes wrong
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'we-better-auth-token',
    storage: {
      getItem: key => {
        try {
          return localStorage.getItem(key);
        } catch (error) {
          console.warn('localStorage access error, falling back to memory storage:', error);
          return sessionStorage.getItem(key) || null;
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.warn('localStorage access error, falling back to memory storage:', error);
          try {
            sessionStorage.setItem(key, value);
          } catch (innerError) {
            console.error('sessionStorage access error:', innerError);
          }
        }
      },
      removeItem: key => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn('localStorage access error:', error);
          try {
            sessionStorage.removeItem(key);
          } catch (innerError) {
            console.error('sessionStorage access error:', innerError);
          }
        }
      },
    },
  },
});
