import { useBookmarksByType } from './useBookmarks';

export interface BookmarkedQuote {
  id: string;
  text: string;
  author: string;
  theme: string;
  timestamp: number;
}

interface UseBookmarkedQuotesResult {
  bookmarkedQuotes: BookmarkedQuote[];
  addBookmark: (quote: BookmarkedQuote) => Promise<void>;
  removeBookmark: (id: string) => Promise<void>;
  isBookmarked: (id: string) => boolean;
  isBookmarkActionPending: (id: string) => boolean;
  isLoading: boolean;
  error: Error | null;
}

const getMetadataString = (metadata: Record<string, unknown>, key: string): string => {
  const value = metadata[key];
  return typeof value === 'string' ? value : '';
};

const toTimestamp = (value: string): number => {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? Date.now() : parsed;
};

export const useBookmarkedQuotes = (): UseBookmarkedQuotesResult => {
  const {
    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    isBookmarkActionPending,
    isLoading,
    error,
  } = useBookmarksByType<BookmarkedQuote>({
    itemType: 'quote',
    fromRecord: bookmark => ({
      id: bookmark.itemId,
      text: getMetadataString(bookmark.metadata, 'text') || bookmark.title,
      author: getMetadataString(bookmark.metadata, 'author'),
      theme: getMetadataString(bookmark.metadata, 'theme') || 'wisdom',
      timestamp: toTimestamp(bookmark.createdAt),
    }),
    toCreateInput: quote => ({
      itemId: quote.id,
      itemType: 'quote',
      title: quote.text,
      metadata: {
        text: quote.text,
        author: quote.author,
        theme: quote.theme,
      },
    }),
  });

  return {
    bookmarkedQuotes: bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    isBookmarkActionPending,
    isLoading,
    error,
  };
};
