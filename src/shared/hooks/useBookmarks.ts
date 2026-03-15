import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  bookmarksService,
  type BookmarkItemType,
  type BookmarkRecord,
  type CreateBookmarkInput,
} from '@/core/services/bookmarksService';
import { useAuth } from './useAuth';

export const bookmarksQueryKey = (userId?: string | null) =>
  ['bookmarks', userId ?? 'anonymous'] as const;

interface BookmarkAdapter<TBookmark extends { id: string }> {
  itemType: BookmarkItemType;
  fromRecord: (record: BookmarkRecord) => TBookmark;
  toCreateInput: (bookmark: TBookmark) => CreateBookmarkInput;
  enabled?: boolean;
}

interface BookmarkMutationContext {
  previousBookmarks: BookmarkRecord[];
  bookmarkId: string;
}

interface UseBookmarksByTypeResult<TBookmark> {
  bookmarks: TBookmark[];
  addBookmark: (bookmark: TBookmark) => Promise<void>;
  removeBookmark: (id: string) => Promise<void>;
  isBookmarked: (id: string) => boolean;
  isBookmarkActionPending: (id: string) => boolean;
  isLoading: boolean;
  error: Error | null;
}

const createOptimisticBookmark = (input: CreateBookmarkInput): BookmarkRecord => {
  const timestamp = new Date().toISOString();

  return {
    itemId: input.itemId,
    itemType: input.itemType,
    title: input.title,
    url: input.url ?? null,
    metadata: input.metadata ?? {},
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

export const useBookmarksByType = <TBookmark extends { id: string }>({
  itemType,
  fromRecord,
  toCreateInput,
  enabled = true,
}: BookmarkAdapter<TBookmark>): UseBookmarksByTypeResult<TBookmark> => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const queryKey = bookmarksQueryKey(user?.id);

  const bookmarksQuery = useQuery({
    queryKey,
    queryFn: () => bookmarksService.getBookmarks(),
    enabled: Boolean(user?.id) && enabled,
  });

  const bookmarks = ((enabled ? bookmarksQuery.data : []) ?? [])
    .filter(bookmark => bookmark.itemType === itemType)
    .map(fromRecord);

  const addBookmarkMutation = useMutation<
    BookmarkRecord,
    Error,
    TBookmark,
    BookmarkMutationContext
  >({
    mutationFn: bookmark => bookmarksService.addBookmark(toCreateInput(bookmark)),
    onMutate: async bookmark => {
      const input = toCreateInput(bookmark);

      setPendingIds(previous =>
        previous.includes(bookmark.id) ? previous : [...previous, bookmark.id]
      );

      await queryClient.cancelQueries({ queryKey });

      const previousBookmarks = queryClient.getQueryData<BookmarkRecord[]>(queryKey) ?? [];
      const alreadyExists = previousBookmarks.some(
        previousBookmark =>
          previousBookmark.itemId === input.itemId && previousBookmark.itemType === input.itemType
      );

      if (!alreadyExists) {
        queryClient.setQueryData<BookmarkRecord[]>(queryKey, [
          createOptimisticBookmark(input),
          ...previousBookmarks,
        ]);
      }

      return {
        previousBookmarks,
        bookmarkId: bookmark.id,
      };
    },
    onError: (_error, _bookmark, context) => {
      if (context) {
        queryClient.setQueryData(queryKey, context.previousBookmarks);
      }
    },
    onSuccess: savedBookmark => {
      queryClient.setQueryData<BookmarkRecord[]>(queryKey, currentBookmarks => {
        const nextBookmarks = (currentBookmarks ?? []).filter(
          bookmark =>
            !(
              bookmark.itemId === savedBookmark.itemId &&
              bookmark.itemType === savedBookmark.itemType
            )
        );

        return [savedBookmark, ...nextBookmarks];
      });
    },
    onSettled: (_data, _error, _bookmark, context) => {
      setPendingIds(previous => previous.filter(id => id !== context?.bookmarkId));

      if (user?.id) {
        void queryClient.invalidateQueries({ queryKey });
      }
    },
  });

  const removeBookmarkMutation = useMutation<void, Error, string, BookmarkMutationContext>({
    mutationFn: bookmarkId => bookmarksService.removeBookmark(bookmarkId, itemType),
    onMutate: async bookmarkId => {
      setPendingIds(previous =>
        previous.includes(bookmarkId) ? previous : [...previous, bookmarkId]
      );

      await queryClient.cancelQueries({ queryKey });

      const previousBookmarks = queryClient.getQueryData<BookmarkRecord[]>(queryKey) ?? [];

      queryClient.setQueryData<BookmarkRecord[]>(
        queryKey,
        previousBookmarks.filter(
          bookmark => !(bookmark.itemId === bookmarkId && bookmark.itemType === itemType)
        )
      );

      return {
        previousBookmarks,
        bookmarkId,
      };
    },
    onError: (_error, _bookmarkId, context) => {
      if (context) {
        queryClient.setQueryData(queryKey, context.previousBookmarks);
      }
    },
    onSettled: (_data, _error, _bookmarkId, context) => {
      setPendingIds(previous => previous.filter(id => id !== context?.bookmarkId));

      if (user?.id) {
        void queryClient.invalidateQueries({ queryKey });
      }
    },
  });

  return {
    bookmarks,
    addBookmark: async bookmark => {
      await addBookmarkMutation.mutateAsync(bookmark);
    },
    removeBookmark: async bookmarkId => {
      await removeBookmarkMutation.mutateAsync(bookmarkId);
    },
    isBookmarked: bookmarkId =>
      ((enabled ? bookmarksQuery.data : []) ?? []).some(
        bookmark => bookmark.itemId === bookmarkId && bookmark.itemType === itemType
      ),
    isBookmarkActionPending: bookmarkId => pendingIds.includes(bookmarkId),
    isLoading: enabled && bookmarksQuery.isLoading,
    error: bookmarksQuery.error ?? addBookmarkMutation.error ?? removeBookmarkMutation.error,
  };
};
