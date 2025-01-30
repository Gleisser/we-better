let apiLoaded = false;
let apiLoadPromise: Promise<void> | null = null;

export const loadYouTubeAPI = () => {
  // Return existing promise if API is already loading
  if (apiLoadPromise) {
    return apiLoadPromise;
  }

  // Return resolved promise if API is already loaded and initialized
  if (window.YT && window.YT.Player) {
    return Promise.resolve();
  }

  // Create new promise for API loading
  apiLoadPromise = new Promise<void>((resolve) => {
    // Set global callback
    window.onYouTubeIframeAPIReady = () => {
      apiLoaded = true;
      resolve();
    };

    // Only inject the script tag if it hasn't been injected yet
    if (!apiLoaded && !document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  });

  return apiLoadPromise;
}; 