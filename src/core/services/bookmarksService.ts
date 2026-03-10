import { supabase } from './supabaseClient';

export type BookmarkItemType = 'quote' | 'affirmation';

export interface BookmarkRecord {
  itemId: string;
  itemType: BookmarkItemType;
  title: string;
  url: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookmarkInput {
  itemId: string;
  itemType: BookmarkItemType;
  title: string;
  url?: string | null;
  metadata?: Record<string, unknown>;
}

interface BookmarkRow {
  item_id: string;
  item_type: BookmarkItemType;
  title: string;
  url: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

const BOOKMARK_SELECT_COLUMNS = 'item_id, item_type, title, url, metadata, created_at, updated_at';

const mapBookmarkRow = (row: BookmarkRow): BookmarkRecord => ({
  itemId: row.item_id,
  itemType: row.item_type,
  title: row.title,
  url: row.url,
  metadata: row.metadata ?? {},
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const getCurrentUserId = async (): Promise<string | null> => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  return user?.id ?? null;
};

const fetchExistingBookmark = async (
  userId: string,
  itemId: string,
  itemType: BookmarkItemType
): Promise<BookmarkRecord | null> => {
  const { data, error } = await supabase
    .from('bookmarks')
    .select(BOOKMARK_SELECT_COLUMNS)
    .eq('user_id', userId)
    .eq('item_id', itemId)
    .eq('item_type', itemType)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return mapBookmarkRow(data as BookmarkRow);
};

class BookmarksService {
  async getBookmarks(): Promise<BookmarkRecord[]> {
    const userId = await getCurrentUserId();

    if (!userId) {
      return [];
    }

    const { data, error } = await supabase
      .from('bookmarks')
      .select(BOOKMARK_SELECT_COLUMNS)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return ((data ?? []) as BookmarkRow[]).map(mapBookmarkRow);
  }

  async addBookmark(input: CreateBookmarkInput): Promise<BookmarkRecord> {
    const userId = await getCurrentUserId();

    if (!userId) {
      throw new Error('Not authenticated');
    }

    const existingBookmark = await fetchExistingBookmark(userId, input.itemId, input.itemType);

    if (existingBookmark) {
      return existingBookmark;
    }

    const { data, error } = await supabase
      .from('bookmarks')
      .insert({
        user_id: userId,
        item_id: input.itemId,
        item_type: input.itemType,
        title: input.title,
        url: input.url ?? null,
        metadata: input.metadata ?? {},
      })
      .select(BOOKMARK_SELECT_COLUMNS)
      .single();

    if (error) {
      if (error.code === '23505') {
        const duplicateBookmark = await fetchExistingBookmark(userId, input.itemId, input.itemType);

        if (duplicateBookmark) {
          return duplicateBookmark;
        }
      }

      throw new Error(error.message);
    }

    return mapBookmarkRow(data as BookmarkRow);
  }

  async removeBookmark(itemId: string, itemType: BookmarkItemType): Promise<void> {
    const userId = await getCurrentUserId();

    if (!userId) {
      return;
    }

    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .eq('item_type', itemType);

    if (error) {
      throw new Error(error.message);
    }
  }
}

export const bookmarksService = new BookmarksService();
