export const getSpotifyAuthToken = async () => {
  const storedToken = localStorage.getItem('spotify_token');
  const tokenExpiry = localStorage.getItem('spotify_token_expiry');
  
  if (storedToken && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
    return storedToken;
  }

  // Generate random state
  const state = Math.random().toString(36).substring(7);
  localStorage.setItem('spotify_auth_state', state);

  // Scopes required for Web Playback SDK
  const scope = [
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'app-remote-control',
    'user-modify-playback-state'
  ].join(' ');

  // Use implicit grant flow instead of authorization code flow
  const params = new URLSearchParams({
    response_type: 'token',
    client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
    scope,
    redirect_uri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
    state,
    show_dialog: 'true'
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
  return null;
};

// Update the callback handler for implicit flow
export const handleSpotifyCallback = () => {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  
  const accessToken = params.get('access_token');
  const expiresIn = params.get('expires_in');
  const state = params.get('state');
  const storedState = localStorage.getItem('spotify_auth_state');

  if (state !== storedState) {
    throw new Error('State mismatch');
  }

  if (accessToken) {
    localStorage.setItem('spotify_token', accessToken);
    localStorage.setItem('spotify_token_expiry', (Date.now() + (Number(expiresIn) * 1000)).toString());
    return accessToken;
  }

  return null;
}; 