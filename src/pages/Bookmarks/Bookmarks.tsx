import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBookmarkedQuotes } from '@/shared/hooks/useBookmarkedQuotes';
import { useBookmarkedAffirmations } from '@/shared/hooks/useBookmarkedAffirmations';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import { BookmarkIcon, SearchIcon, ChevronDownIcon } from '@/shared/components/common/icons';
import { cn } from '@/utils/classnames';
import QuoteCard from './components/QuoteCard/QuoteCard';
import AffirmationCard from './components/AffirmationCard/AffirmationCard';

type BookmarkType = 'all' | 'quotes' | 'affirmations';
type SortOption = 'newest' | 'oldest' | 'alphabetical';
type ViewMode = 'grid' | 'list';

const PANEL_CLASS_NAME =
  'rounded-2xl border border-theme-primary bg-theme-elevated shadow-theme-sm transition-colors';
const ACTIVE_BUTTON_CLASS_NAME =
  'border-[var(--theme-interactive-primary)] bg-[var(--theme-interactive-primary)] text-white';
const INACTIVE_BUTTON_CLASS_NAME =
  'border-theme-primary bg-theme-elevated text-theme-primary hover:border-theme-secondary hover:bg-theme-secondary';
const VIEW_MODE_BUTTON_CLASS_NAME =
  'flex h-10 w-10 items-center justify-center rounded-lg text-theme-secondary transition-colors';
const FILTER_BUTTON_CLASS_NAME =
  'rounded-full border px-4 py-2 text-sm font-medium transition-colors';

// Temporary inline icons until we add them to the main icons file
const FilterIcon = ({ className }: { className?: string }): JSX.Element => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
    />
  </svg>
);

const SortIcon = ({ className }: { className?: string }): JSX.Element => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 5v6m0 0l3-3m-3 3L5 8"
    />
  </svg>
);

const GridIcon = ({ className }: { className?: string }): JSX.Element => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
    <rect
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      x="3"
      y="3"
      width="7"
      height="7"
    />
    <rect
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      x="14"
      y="3"
      width="7"
      height="7"
    />
    <rect
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      x="14"
      y="14"
      width="7"
      height="7"
    />
    <rect
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      x="3"
      y="14"
      width="7"
      height="7"
    />
  </svg>
);

const ListIcon = ({ className }: { className?: string }): JSX.Element => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);

const Bookmarks = (): JSX.Element => {
  const { bookmarkedQuotes, isLoading: areQuotesLoading } = useBookmarkedQuotes();
  const { bookmarkedAffirmations, isLoading: areAffirmationsLoading } = useBookmarkedAffirmations();
  const { t } = useCommonTranslation();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<BookmarkType>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Combine and filter bookmarks
  const allBookmarks = useMemo(() => {
    const quotes = bookmarkedQuotes.map(quote => ({ ...quote, type: 'quote' as const }));
    const affirmations = bookmarkedAffirmations.map(affirmation => ({
      ...affirmation,
      type: 'affirmation' as const,
    }));

    return [...quotes, ...affirmations];
  }, [bookmarkedQuotes, bookmarkedAffirmations]);

  // Filter and sort bookmarks
  const filteredBookmarks = useMemo(() => {
    let filtered = [...allBookmarks];

    if (selectedType !== 'all') {
      filtered = filtered.filter(bookmark => {
        if (selectedType === 'quotes') return bookmark.type === 'quote';
        if (selectedType === 'affirmations') return bookmark.type === 'affirmation';
        return true;
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(bookmark => {
        const searchLower = searchTerm.toLowerCase();
        if (bookmark.type === 'quote') {
          return (
            bookmark.text.toLowerCase().includes(searchLower) ||
            bookmark.author.toLowerCase().includes(searchLower) ||
            bookmark.theme.toLowerCase().includes(searchLower)
          );
        }

        return (
          bookmark.text.toLowerCase().includes(searchLower) ||
          bookmark.category.toLowerCase().includes(searchLower)
        );
      });
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.timestamp - a.timestamp;
        case 'oldest':
          return a.timestamp - b.timestamp;
        case 'alphabetical':
          return a.text.localeCompare(b.text);
        default:
          return 0;
      }
    });

    return filtered;
  }, [allBookmarks, selectedType, searchTerm, sortBy]);

  const handleRemoveBookmark = (id: string): void => {
    // The individual cards handle removal through their respective hooks
    console.info('Bookmark removed:', id);
  };

  const totalBookmarks = allBookmarks.length;
  const quotesCount = bookmarkedQuotes.length;
  const affirmationsCount = bookmarkedAffirmations.length;
  const isLoadingBookmarks = areQuotesLoading || areAffirmationsLoading;

  // Memoize translated values to prevent infinite re-renders
  const translations = useMemo(
    () => ({
      loading: t('common.actions.loading') as string,
      title: t('bookmarks.title') as string,
      subtitle: t('bookmarks.subtitle') as string,
      itemCount: t('bookmarks.itemCount', { count: totalBookmarks }) as string,
      stats: {
        quotes: t('bookmarks.stats.quotes') as string,
        affirmations: t('bookmarks.stats.affirmations') as string,
      },
      search: {
        placeholder: t('bookmarks.search.placeholder') as string,
      },
      controls: {
        filter: t('bookmarks.controls.filter') as string,
        sort: t('bookmarks.controls.sort') as string,
        gridView: t('bookmarks.controls.gridView') as string,
        listView: t('bookmarks.controls.listView') as string,
      },
      sorting: {
        newest: t('bookmarks.sorting.newest') as string,
        oldest: t('bookmarks.sorting.oldest') as string,
        alphabetical: t('bookmarks.sorting.alphabetical') as string,
      },
      filters: {
        typeLabel: t('bookmarks.filters.typeLabel') as string,
        all: t('bookmarks.filters.all') as string,
        quotes: t('bookmarks.filters.quotes') as string,
        affirmations: t('bookmarks.filters.affirmations') as string,
      },
      emptyState: {
        noBookmarks: {
          title: t('bookmarks.emptyState.noBookmarks.title') as string,
          description: t('bookmarks.emptyState.noBookmarks.description') as string,
        },
        noResults: {
          title: t('bookmarks.emptyState.noResults.title') as string,
          description: t('bookmarks.emptyState.noResults.description') as string,
        },
      },
    }),
    [t, totalBookmarks]
  );

  return (
    <div className="mx-auto min-h-[calc(100vh-120px)] max-w-[1400px] px-3 py-3 sm:p-4 lg:p-8">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <BookmarkIcon className="h-8 w-8 text-[var(--theme-interactive-primary)]" filled />
            <h1 className="font-plus-jakarta text-2xl font-bold text-theme-primary sm:text-[28px] lg:text-[32px]">
              {translations.title}
            </h1>
          </div>
          <p className="text-sm font-medium text-theme-secondary sm:text-base">
            {translations.subtitle} • {translations.itemCount}
          </p>
        </div>

        <div
          className={cn(
            PANEL_CLASS_NAME,
            'flex items-center gap-4 self-start px-5 py-4 lg:gap-6 lg:px-6 lg:py-5'
          )}
        >
          <div className="flex flex-col items-center gap-1">
            <span className="font-plus-jakarta text-xl font-bold text-theme-primary lg:text-2xl">
              {quotesCount}
            </span>
            <span className="text-[12px] font-semibold uppercase tracking-[0.5px] text-theme-secondary">
              {translations.stats.quotes}
            </span>
          </div>
          <div className="h-8 w-px bg-[var(--theme-border-primary)]" />
          <div className="flex flex-col items-center gap-1">
            <span className="font-plus-jakarta text-xl font-bold text-theme-primary lg:text-2xl">
              {affirmationsCount}
            </span>
            <span className="text-[12px] font-semibold uppercase tracking-[0.5px] text-theme-secondary">
              {translations.stats.affirmations}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-4">
        <div className="relative min-w-0 flex-1 md:min-w-[280px]">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 z-[1] h-5 w-5 -translate-y-1/2 text-[var(--theme-text-tertiary)]" />
          <input
            id="bookmarks-search"
            name="bookmarksSearch"
            type="text"
            placeholder={translations.search.placeholder}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="h-12 w-full rounded-xl border border-theme-primary bg-theme-elevated pl-12 pr-4 text-sm font-medium text-theme-primary shadow-theme-sm transition-colors placeholder:text-[var(--theme-text-tertiary)] focus:border-[var(--theme-border-focus)] focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between gap-3 md:justify-start">
          <div className={cn(PANEL_CLASS_NAME, 'flex rounded-[10px] p-1')}>
            <button
              className={cn(
                VIEW_MODE_BUTTON_CLASS_NAME,
                viewMode === 'grid'
                  ? 'bg-[var(--theme-interactive-primary)] text-white'
                  : 'hover:bg-theme-secondary hover:text-theme-primary'
              )}
              onClick={() => setViewMode('grid')}
              aria-label={translations.controls.gridView}
            >
              <GridIcon className="h-[18px] w-[18px]" />
            </button>
            <button
              className={cn(
                VIEW_MODE_BUTTON_CLASS_NAME,
                viewMode === 'list'
                  ? 'bg-[var(--theme-interactive-primary)] text-white'
                  : 'hover:bg-theme-secondary hover:text-theme-primary'
              )}
              onClick={() => setViewMode('list')}
              aria-label={translations.controls.listView}
            >
              <ListIcon className="h-[18px] w-[18px]" />
            </button>
          </div>

          <button
            className={cn(
              'flex h-12 items-center gap-2 rounded-xl border px-4 text-sm font-semibold shadow-theme-sm transition-colors',
              showFilters ? ACTIVE_BUTTON_CLASS_NAME : INACTIVE_BUTTON_CLASS_NAME
            )}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FilterIcon className="h-[18px] w-[18px]" />
            {translations.controls.filter}
          </button>

          <div className="relative">
            <button
              className={cn(
                'flex h-12 items-center gap-2 rounded-xl border px-4 text-sm font-semibold shadow-theme-sm transition-colors',
                showSortMenu ? ACTIVE_BUTTON_CLASS_NAME : INACTIVE_BUTTON_CLASS_NAME
              )}
              onClick={() => setShowSortMenu(!showSortMenu)}
            >
              <SortIcon className="h-[18px] w-[18px]" />
              {translations.controls.sort}
              <ChevronDownIcon className="h-4 w-4" />
            </button>

            {showSortMenu && (
              <motion.div
                className="absolute right-0 top-full z-10 mt-2 min-w-[160px] rounded-xl border border-theme-primary bg-theme-elevated p-2 shadow-[0_8px_32px_rgba(0,0,0,0.16)]"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                <button
                  className={cn(
                    'block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors',
                    sortBy === 'newest'
                      ? 'bg-[var(--theme-interactive-primary)] text-white'
                      : 'text-theme-primary hover:bg-theme-secondary'
                  )}
                  onClick={() => {
                    setSortBy('newest');
                    setShowSortMenu(false);
                  }}
                >
                  {translations.sorting.newest}
                </button>
                <button
                  className={cn(
                    'block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors',
                    sortBy === 'oldest'
                      ? 'bg-[var(--theme-interactive-primary)] text-white'
                      : 'text-theme-primary hover:bg-theme-secondary'
                  )}
                  onClick={() => {
                    setSortBy('oldest');
                    setShowSortMenu(false);
                  }}
                >
                  {translations.sorting.oldest}
                </button>
                <button
                  className={cn(
                    'block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors',
                    sortBy === 'alphabetical'
                      ? 'bg-[var(--theme-interactive-primary)] text-white'
                      : 'text-theme-primary hover:bg-theme-secondary'
                  )}
                  onClick={() => {
                    setSortBy('alphabetical');
                    setShowSortMenu(false);
                  }}
                >
                  {translations.sorting.alphabetical}
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            className={cn(PANEL_CLASS_NAME, 'mb-6 overflow-hidden rounded-xl p-5')}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-wrap items-center gap-4">
              <span className="min-w-[60px] text-sm font-semibold text-theme-secondary">
                {translations.filters.typeLabel}
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  className={cn(
                    FILTER_BUTTON_CLASS_NAME,
                    selectedType === 'all' ? ACTIVE_BUTTON_CLASS_NAME : INACTIVE_BUTTON_CLASS_NAME
                  )}
                  onClick={() => setSelectedType('all')}
                >
                  {translations.filters.all}
                </button>
                <button
                  className={cn(
                    FILTER_BUTTON_CLASS_NAME,
                    selectedType === 'quotes'
                      ? ACTIVE_BUTTON_CLASS_NAME
                      : INACTIVE_BUTTON_CLASS_NAME
                  )}
                  onClick={() => setSelectedType('quotes')}
                >
                  {translations.filters.quotes}
                </button>
                <button
                  className={cn(
                    FILTER_BUTTON_CLASS_NAME,
                    selectedType === 'affirmations'
                      ? ACTIVE_BUTTON_CLASS_NAME
                      : INACTIVE_BUTTON_CLASS_NAME
                  )}
                  onClick={() => setSelectedType('affirmations')}
                >
                  {translations.filters.affirmations}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-[400px]">
        {isLoadingBookmarks ? (
          <div className="px-5 py-[60px] text-center text-theme-secondary md:px-5 md:py-[80px]">
            <BookmarkIcon className="mx-auto mb-6 h-16 w-16 text-[var(--theme-text-tertiary)]" />
            <h3 className="mb-3 font-plus-jakarta text-xl font-semibold text-theme-primary md:text-2xl">
              {translations.loading}
            </h3>
          </div>
        ) : filteredBookmarks.length === 0 ? (
          <div className="px-5 py-[60px] text-center text-theme-secondary md:px-5 md:py-[80px]">
            <BookmarkIcon className="mx-auto mb-6 h-16 w-16 text-[var(--theme-text-tertiary)]" />
            <h3 className="mb-3 font-plus-jakarta text-xl font-semibold text-theme-primary md:text-2xl">
              {totalBookmarks === 0
                ? translations.emptyState.noBookmarks.title
                : translations.emptyState.noResults.title}
            </h3>
            <p className="mx-auto max-w-[480px] text-sm leading-6 text-theme-secondary md:text-base">
              {totalBookmarks === 0
                ? translations.emptyState.noBookmarks.description
                : translations.emptyState.noResults.description}
            </p>
          </div>
        ) : (
          <motion.div
            className={cn(
              'mb-10 grid grid-cols-1 gap-4 md:gap-5 md:[grid-template-columns:repeat(auto-fill,minmax(320px,1fr))] xl:gap-6 xl:[grid-template-columns:repeat(auto-fill,minmax(380px,1fr))]',
              viewMode === 'list' && '[grid-template-columns:1fr]'
            )}
            layout
          >
            <AnimatePresence>
              {filteredBookmarks.map(bookmark => (
                <motion.div
                  key={`${bookmark.type}-${bookmark.id}`}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {bookmark.type === 'quote' ? (
                    <QuoteCard quote={bookmark} onRemove={handleRemoveBookmark} />
                  ) : (
                    <AffirmationCard affirmation={bookmark} onRemove={handleRemoveBookmark} />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;
