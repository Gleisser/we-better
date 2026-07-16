import { supabase } from './supabaseClient';

const API_BASE_URL = (
  import.meta.env.VITE_USER_SERVICE_URL ||
  import.meta.env.VITE_API_BACKEND_URL ||
  ''
).replace(/\/$/, '');

async function request(path: string, init?: RequestInit): Promise<Response> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token || !API_BASE_URL) throw new Error('ACCOUNT_DATA_UNAVAILABLE');
  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
}

export const accountDataService = {
  async exportJson(): Promise<Blob> {
    const response = await request('/api/account/export');
    if (!response.ok) throw new Error('EXPORT_FAILED');
    return new Blob([await response.text()], { type: 'application/json' });
  },

  async reauthenticateAndDelete(password: string): Promise<void> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    const email = userData.user?.email;
    if (userError || !email) throw new Error('REAUTHENTICATION_REQUIRED');
    const hasPasswordIdentity = userData.user.identities?.some(
      identity => identity.provider === 'email'
    );
    if (!hasPasswordIdentity) throw new Error('OAUTH_REAUTHENTICATION_REQUIRED');
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) throw new Error('REAUTHENTICATION_FAILED');
    const response = await request('/api/account/delete', {
      method: 'DELETE',
      body: JSON.stringify({ confirmation: 'DELETE' }),
    });
    if (response.status === 409) throw new Error('ACTIVE_SUBSCRIPTION');
    if (response.status === 403) throw new Error('REAUTHENTICATION_REQUIRED');
    if (!response.ok) throw new Error('DELETE_FAILED');
  },
};
