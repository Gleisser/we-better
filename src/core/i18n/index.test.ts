import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('i18n namespace loading', () => {
  beforeEach(async () => {
    vi.resetModules();
  });

  it('loads only the requested namespace file for the active language', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const i18nModule = await import('./index');
    const i18n = i18nModule.default;

    await i18n.changeLanguage('en');
    fetchSpy.mockClear();

    await i18n.loadNamespaces(['settings']);

    const requestedLocaleUrls = fetchSpy.mock.calls
      .map(([url]) => String(url))
      .filter(url => url.includes('/locales/'));

    expect(requestedLocaleUrls).toContain('/locales/en/settings.json');
    expect(requestedLocaleUrls.some(url => url.includes('/locales/en/dream-board.json'))).toBe(
      false
    );
  });

  it('fetches the matching namespace file after a language change', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const i18nModule = await import('./index');
    const i18n = i18nModule.default;

    await i18n.changeLanguage('pt');
    fetchSpy.mockClear();

    await i18n.loadNamespaces(['settings']);

    const requestedLocaleUrls = fetchSpy.mock.calls
      .map(([url]) => String(url))
      .filter(url => url.includes('/locales/'));

    expect(requestedLocaleUrls).toContain('/locales/pt/settings.json');
  });
});
