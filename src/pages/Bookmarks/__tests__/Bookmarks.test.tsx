import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import Bookmarks from '../Bookmarks';

const mockUseBookmarkedQuotes = vi.fn();
const mockUseBookmarkedAffirmations = vi.fn();

vi.mock('framer-motion', () => {
  const createMotionTag =
    (tag: string) =>
    ({
      children,
      layout: _layout,
      animate: _animate,
      initial: _initial,
      exit: _exit,
      transition: _transition,
      whileHover: _whileHover,
      whileTap: _whileTap,
      ...props
    }: React.HTMLAttributes<HTMLElement> & Record<string, unknown>) =>
      React.createElement(tag, props, children);

  const motionProxy = new Proxy(
    {},
    {
      get: (_, tag: string) => createMotionTag(tag),
    }
  );

  return {
    motion: motionProxy,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

vi.mock('@/shared/hooks/useBookmarkedQuotes', () => ({
  useBookmarkedQuotes: () => mockUseBookmarkedQuotes(),
}));

vi.mock('@/shared/hooks/useBookmarkedAffirmations', () => ({
  useBookmarkedAffirmations: () => mockUseBookmarkedAffirmations(),
}));

vi.mock('@/shared/hooks/useTranslation', () => ({
  useCommonTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>): string => {
      return key;
    },
  }),
  useBookmarksTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>): string => {
      const translations: Record<string, string> = {
        'common.actions.loading': 'Loading',
        'bookmarks.title': 'Bookmarks',
        'bookmarks.subtitle': 'Saved quotes and affirmations',
        'bookmarks.stats.quotes': 'Quotes',
        'bookmarks.stats.affirmations': 'Affirmations',
        'bookmarks.search.placeholder': 'Search bookmarks',
        'bookmarks.controls.filter': 'Filter',
        'bookmarks.controls.sort': 'Sort',
        'bookmarks.controls.gridView': 'Grid view',
        'bookmarks.controls.listView': 'List view',
        'bookmarks.sorting.newest': 'Newest',
        'bookmarks.sorting.oldest': 'Oldest',
        'bookmarks.sorting.alphabetical': 'Alphabetical',
        'bookmarks.filters.typeLabel': 'Type',
        'bookmarks.filters.all': 'All',
        'bookmarks.filters.quotes': 'Quotes only',
        'bookmarks.filters.affirmations': 'Affirmations only',
        'bookmarks.emptyState.noBookmarks.title': 'No bookmarks yet',
        'bookmarks.emptyState.noBookmarks.description': 'Save something to get started',
        'bookmarks.emptyState.noResults.title': 'No results found',
        'bookmarks.emptyState.noResults.description': 'Try another search',
      };

      if (key === 'bookmarks.itemCount') {
        return `${options?.count ?? 0} saved`;
      }

      return translations[key] || key;
    },
  }),
}));

vi.mock('../components/QuoteCard/QuoteCard', () => ({
  default: ({ quote }: { quote: { text: string } }) => (
    <div data-testid="bookmark-card">quote:{quote.text}</div>
  ),
}));

vi.mock('../components/AffirmationCard/AffirmationCard', () => ({
  default: ({ affirmation }: { affirmation: { text: string } }) => (
    <div data-testid="bookmark-card">affirmation:{affirmation.text}</div>
  ),
}));

describe('Bookmarks', () => {
  beforeEach(() => {
    mockUseBookmarkedQuotes.mockReturnValue({
      bookmarkedQuotes: [
        {
          id: 'quote-1',
          text: 'Zebra mindset',
          author: 'Ada',
          theme: 'growth',
          timestamp: 300,
        },
        {
          id: 'quote-2',
          text: 'Alpha focus',
          author: 'Bea',
          theme: 'wisdom',
          timestamp: 100,
        },
      ],
      isLoading: false,
    });

    mockUseBookmarkedAffirmations.mockReturnValue({
      bookmarkedAffirmations: [
        {
          id: 'affirmation-1',
          text: 'Calm confidence',
          category: 'confidence',
          timestamp: 200,
        },
      ],
      isLoading: false,
    });
  });

  it('filters and sorts the rendered bookmark cards through the page controls', () => {
    render(<Bookmarks />);

    expect(screen.queryByText('Bookmarks')).not.toBeNull();
    expect(screen.queryByText(/3 saved/)).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Filter' }));
    fireEvent.click(screen.getByRole('button', { name: 'Quotes only' }));

    expect(screen.queryByText('affirmation:Calm confidence')).toBeNull();
    expect(screen.queryByText('quote:Zebra mindset')).not.toBeNull();
    expect(screen.queryByText('quote:Alpha focus')).not.toBeNull();

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'alpha' },
    });

    expect(screen.queryByText('quote:Alpha focus')).not.toBeNull();
    expect(screen.queryByText('quote:Zebra mindset')).toBeNull();

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Sort' }));
    fireEvent.click(screen.getByRole('button', { name: 'Alphabetical' }));

    expect(screen.getAllByTestId('bookmark-card').map(card => card.textContent)).toEqual([
      'quote:Alpha focus',
      'quote:Zebra mindset',
    ]);
  });
});
