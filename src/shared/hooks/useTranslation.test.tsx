import { renderHook } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';
import i18n from '@/core/i18n';
import { useBookmarksTranslation, useCommonTranslation, useTranslation } from './useTranslation';

describe('useTranslation', () => {
  beforeAll(async () => {
    await import('@/core/i18n');
  });

  it('keeps the wrapped translator stable for equivalent namespace arrays', () => {
    const { result, rerender } = renderHook(() => useTranslation(['common', 'dashboard']));
    const firstTranslator = result.current.t;

    rerender();

    expect(result.current.t).toBe(firstTranslator);
  });

  it('does not resolve route-specific keys through common once other namespaces are loaded', async () => {
    await i18n.loadNamespaces(['bookmarks']);

    const { result } = renderHook(() => useCommonTranslation());

    expect(result.current.t('bookmarks.title')).toBe('Title');
  });

  it('resolves route-specific keys when the caller requests the explicit namespace', async () => {
    await i18n.loadNamespaces(['bookmarks']);

    const { result } = renderHook(() => useBookmarksTranslation());

    expect(result.current.t('bookmarks.title')).toBe('My Bookmarks');
  });
});
