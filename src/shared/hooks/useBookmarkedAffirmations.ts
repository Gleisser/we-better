import { useBookmarksByType } from './useBookmarks';

export interface BookmarkedAffirmation {
  id: string;
  text: string;
  category: string;
  timestamp: number;
}

interface UseBookmarkedAffirmationsResult {
  bookmarkedAffirmations: BookmarkedAffirmation[];
  addBookmark: (affirmation: BookmarkedAffirmation) => Promise<void>;
  removeBookmark: (id: string) => Promise<void>;
  isBookmarked: (id: string) => boolean;
  isBookmarkActionPending: (id: string) => boolean;
  isLoading: boolean;
  error: Error | null;
}

interface UseBookmarkedAffirmationsOptions {
  enabled?: boolean;
}

const getMetadataString = (metadata: Record<string, unknown>, key: string): string => {
  const value = metadata[key];
  return typeof value === 'string' ? value : '';
};

const toTimestamp = (value: string): number => {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? Date.now() : parsed;
};

export const useBookmarkedAffirmations = (
  options: UseBookmarkedAffirmationsOptions = {}
): UseBookmarkedAffirmationsResult => {
  const {
    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    isBookmarkActionPending,
    isLoading,
    error,
  } = useBookmarksByType<BookmarkedAffirmation>({
    itemType: 'affirmation',
    enabled: options.enabled,
    fromRecord: bookmark => ({
      id: bookmark.itemId,
      text: getMetadataString(bookmark.metadata, 'text') || bookmark.title,
      category: getMetadataString(bookmark.metadata, 'category') || 'personal',
      timestamp: toTimestamp(bookmark.createdAt),
    }),
    toCreateInput: affirmation => ({
      itemId: affirmation.id,
      itemType: 'affirmation',
      title: affirmation.text,
      metadata: {
        text: affirmation.text,
        category: affirmation.category,
      },
    }),
  });

  return {
    bookmarkedAffirmations: bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    isBookmarkActionPending,
    isLoading,
    error,
  };
};
