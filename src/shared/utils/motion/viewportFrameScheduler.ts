type Subscriber = () => void;

const subscribers = new Set<Subscriber>();
let rafId = 0;
let listenersAttached = false;

const runSubscribers = (): void => {
  rafId = 0;

  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
    return;
  }

  subscribers.forEach(callback => {
    callback();
  });
};

const scheduleFrame = (): void => {
  if (typeof window === 'undefined' || rafId || subscribers.size === 0) {
    return;
  }

  rafId = window.requestAnimationFrame(runSubscribers);
};

const handleViewportChange = (): void => {
  scheduleFrame();
};

const attachListeners = (): void => {
  if (listenersAttached || typeof window === 'undefined') {
    return;
  }

  window.addEventListener('scroll', handleViewportChange, { passive: true });
  window.addEventListener('resize', handleViewportChange);
  document.addEventListener('visibilitychange', handleViewportChange);
  listenersAttached = true;
};

const detachListeners = (): void => {
  if (!listenersAttached || typeof window === 'undefined') {
    return;
  }

  window.removeEventListener('scroll', handleViewportChange);
  window.removeEventListener('resize', handleViewportChange);
  document.removeEventListener('visibilitychange', handleViewportChange);
  listenersAttached = false;
};

export const subscribeToViewportFrame = (callback: Subscriber): (() => void) => {
  subscribers.add(callback);
  attachListeners();
  scheduleFrame();

  return () => {
    subscribers.delete(callback);

    if (subscribers.size === 0) {
      if (rafId && typeof window !== 'undefined') {
        window.cancelAnimationFrame(rafId);
      }
      rafId = 0;
      detachListeners();
    }
  };
};
