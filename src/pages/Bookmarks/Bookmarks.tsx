import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBookmarkedQuotes } from '@/shared/hooks/useBookmarkedQuotes';
import { useBookmarkedAffirmations } from '@/shared/hooks/useBookmarkedAffirmations';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import { BookmarkIcon, SearchIcon, ChevronDownIcon } from '@/shared/components/common/icons';
import QuoteCard from './components/QuoteCard/QuoteCard';
import AffirmationCard from './components/AffirmationCard/AffirmationCard';
import styles from './Bookmarks.module.css';

type BookmarkType = 'all' | 'quotes' | 'affirmations';
type SortOption = 'newest' | 'oldest' | 'alphabetical';
type ViewMode = 'grid' | 'list';

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
  const { bookmarkedQuotes } = useBookmarkedQuotes();
  const { bookmarkedAffirmations } = useBookmarkedAffirmations();
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
    let filtered = allBookmarks;

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(bookmark => {
        if (selectedType === 'quotes') return bookmark.type === 'quote';
        if (selectedType === 'affirmations') return bookmark.type === 'affirmation';
        return true;
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(bookmark => {
        const searchLower = searchTerm.toLowerCase();
        if (bookmark.type === 'quote') {
          return (
            bookmark.text.toLowerCase().includes(searchLower) ||
            bookmark.author.toLowerCase().includes(searchLower) ||
            bookmark.theme.toLowerCase().includes(searchLower)
          );
        } else {
          return (
            bookmark.text.toLowerCase().includes(searchLower) ||
            bookmark.category.toLowerCase().includes(searchLower)
          );
        }
      });
    }

    // Sort bookmarks
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

  // Memoize translated values to prevent infinite re-renders
  const translations = useMemo(
    () => ({
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
    <div className={styles.bookmarksPage}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <div className={styles.iconTitle}>
            <BookmarkIcon className={styles.headerIcon} filled />
            <h1 className={styles.title}>{translations.title}</h1>
          </div>
          <p className={styles.subtitle}>
            {translations.subtitle} • {translations.itemCount}
          </p>
        </div>

        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{quotesCount}</span>
            <span className={styles.statLabel}>{translations.stats.quotes}</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{affirmationsCount}</span>
            <span className={styles.statLabel}>{translations.stats.affirmations}</span>
          </div>
        </div>
      </div>

      {/* Search and Controls */}
      <div className={styles.controls}>
        {/* Search Bar */}
        <div className={styles.searchContainer}>
          <SearchIcon className={styles.searchIcon} />
          <input
            type="text"
            placeholder={translations.search.placeholder}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          {/* View Mode Toggle */}
          <div className={styles.viewModeToggle}>
            <button
              className={`${styles.viewModeButton} ${viewMode === 'grid' ? styles.active : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label={translations.controls.gridView}
            >
              <GridIcon className={styles.viewIcon} />
            </button>
            <button
              className={`${styles.viewModeButton} ${viewMode === 'list' ? styles.active : ''}`}
              onClick={() => setViewMode('list')}
              aria-label={translations.controls.listView}
            >
              <ListIcon className={styles.viewIcon} />
            </button>
          </div>

          {/* Filter Button */}
          <button
            className={`${styles.controlButton} ${showFilters ? styles.active : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FilterIcon className={styles.controlIcon} />
            {translations.controls.filter}
          </button>

          {/* Sort Button */}
          <div className={styles.sortContainer}>
            <button
              className={`${styles.controlButton} ${showSortMenu ? styles.active : ''}`}
              onClick={() => setShowSortMenu(!showSortMenu)}
            >
              <SortIcon className={styles.controlIcon} />
              {translations.controls.sort}
              <ChevronDownIcon className={styles.chevronIcon} />
            </button>

            {showSortMenu && (
              <motion.div
                className={styles.sortMenu}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                <button
                  className={`${styles.sortMenuItem} ${sortBy === 'newest' ? styles.active : ''}`}
                  onClick={() => {
                    setSortBy('newest');
                    setShowSortMenu(false);
                  }}
                >
                  {translations.sorting.newest}
                </button>
                <button
                  className={`${styles.sortMenuItem} ${sortBy === 'oldest' ? styles.active : ''}`}
                  onClick={() => {
                    setSortBy('oldest');
                    setShowSortMenu(false);
                  }}
                >
                  {translations.sorting.oldest}
                </button>
                <button
                  className={`${styles.sortMenuItem} ${sortBy === 'alphabetical' ? styles.active : ''}`}
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

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            className={styles.filtersPanel}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>{translations.filters.typeLabel}</span>
              <div className={styles.filterButtons}>
                <button
                  className={`${styles.filterButton} ${selectedType === 'all' ? styles.active : ''}`}
                  onClick={() => setSelectedType('all')}
                >
                  {translations.filters.all}
                </button>
                <button
                  className={`${styles.filterButton} ${selectedType === 'quotes' ? styles.active : ''}`}
                  onClick={() => setSelectedType('quotes')}
                >
                  {translations.filters.quotes}
                </button>
                <button
                  className={`${styles.filterButton} ${selectedType === 'affirmations' ? styles.active : ''}`}
                  onClick={() => setSelectedType('affirmations')}
                >
                  {translations.filters.affirmations}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className={styles.content}>
        {filteredBookmarks.length === 0 ? (
          <div className={styles.emptyState}>
            <BookmarkIcon className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>
              {totalBookmarks === 0
                ? translations.emptyState.noBookmarks.title
                : translations.emptyState.noResults.title}
            </h3>
            <p className={styles.emptyDescription}>
              {totalBookmarks === 0
                ? translations.emptyState.noBookmarks.description
                : translations.emptyState.noResults.description}
            </p>
          </div>
        ) : (
          <motion.div
            className={`${styles.bookmarksGrid} ${viewMode === 'list' ? styles.listView : ''}`}
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
