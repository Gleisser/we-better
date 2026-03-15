import { beforeEach, describe, expect, it, vi } from 'vitest';

const renderMock = vi.fn();
const createRootMock = vi.fn(() => ({
  render: renderMock,
}));

const registerMock = vi.fn();
const ensureDatabaseReadyMock = vi.fn();

vi.mock('react-dom/client', () => ({
  default: {
    createRoot: createRootMock,
  },
}));

vi.mock('./core/router/index', () => ({
  router: {},
}));

vi.mock('./core/database', () => ({
  ensureDatabaseReady: ensureDatabaseReadyMock,
}));

describe('main bootstrap', () => {
  beforeEach(() => {
    vi.resetModules();
    renderMock.mockReset();
    createRootMock.mockClear();
    ensureDatabaseReadyMock.mockReset();
    registerMock.mockReset();
    document.body.innerHTML = '<div id="root"></div>';

    Object.defineProperty(window.navigator, 'serviceWorker', {
      configurable: true,
      value: {
        register: registerMock,
      },
    });
  });

  it('mounts the app without starting database init or service worker registration', async () => {
    await import('./main');

    expect(createRootMock).toHaveBeenCalledTimes(1);
    expect(renderMock).toHaveBeenCalledTimes(1);
    expect(ensureDatabaseReadyMock).not.toHaveBeenCalled();
    expect(registerMock).not.toHaveBeenCalled();
  });
});
