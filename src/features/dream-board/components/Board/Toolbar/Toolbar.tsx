import React from 'react';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import styles from './Toolbar.module.css';
import { ToolbarMode } from '../../../types';

export interface ToolbarProps {
  mode: ToolbarMode;
  onModeChange: (mode: ToolbarMode) => void;
  onAddImage: () => void;
  onAutoArrange: () => void;
  onSave: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  onFilterByCategory?: (categoryId: string | null) => void;
  categories?: { id: string; name: string; color: string }[];
  selectedCategoryId?: string | null;
  isSaving?: boolean;
  imageCount?: number;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  mode,
  onModeChange,
  onAddImage,
  onAutoArrange,
  onSave,
  onDelete,
  onFilterByCategory,
  categories = [],
  selectedCategoryId = null,
  isSaving = false,
  imageCount = 0,
}) => {
  const { t } = useCommonTranslation();
  const imageLimit = 7;

  // Helper function to get translated category name
  const getTranslatedCategoryName = (categoryName: string): string => {
    // Try exact match first (for names with spaces)
    const exactKey = `dreamBoard.categories.names.${categoryName.toLowerCase()}`;
    const exactTranslated = t(exactKey) as string;

    if (exactTranslated !== exactKey) {
      return exactTranslated;
    }

    // Try with spaces removed
    const noSpaceKey = categoryName.toLowerCase().replace(/\s+/g, '');
    const noSpaceTranslationKey = `dreamBoard.categories.names.${noSpaceKey}`;
    const noSpaceTranslated = t(noSpaceTranslationKey) as string;

    // If translation key is returned as-is, fallback to original name
    return noSpaceTranslated !== noSpaceTranslationKey ? noSpaceTranslated : categoryName;
  };

  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarSection}>
        <button
          className={`${styles.toolbarButton} ${styles.modeButton} ${mode === ToolbarMode.ADD ? styles.active : ''}`}
          onClick={() => onModeChange(ToolbarMode.ADD)}
          title={t('dreamBoard.board.toolbar.tooltips.addContent') as string}
        >
          <span className={styles.buttonIcon}>➕</span>
          <span className={styles.buttonLabel}>{t('dreamBoard.board.toolbar.modes.add')}</span>
        </button>

        <button
          className={`${styles.toolbarButton} ${styles.modeButton} ${mode === ToolbarMode.FILTER ? styles.active : ''}`}
          onClick={() => onModeChange(ToolbarMode.FILTER)}
          title={t('dreamBoard.board.toolbar.tooltips.filterContent') as string}
        >
          <span className={styles.buttonIcon}>🔍</span>
          <span className={styles.buttonLabel}>{t('dreamBoard.board.toolbar.modes.filter')}</span>
        </button>

        <button
          className={`${styles.toolbarButton} ${styles.modeButton} ${mode === ToolbarMode.ARRANGE ? styles.active : ''}`}
          onClick={() => onModeChange(ToolbarMode.ARRANGE)}
          title={t('dreamBoard.board.toolbar.tooltips.arrangeContent') as string}
        >
          <span className={styles.buttonIcon}>📋</span>
          <span className={styles.buttonLabel}>{t('dreamBoard.board.toolbar.modes.arrange')}</span>
        </button>
      </div>

      {/* Mode-specific sections */}
      {mode === ToolbarMode.ADD && (
        <div className={styles.toolbarSection}>
          <button
            className={styles.toolbarButton}
            onClick={onAddImage}
            title={t('dreamBoard.board.toolbar.tooltips.uploadImage') as string}
            disabled={imageCount >= imageLimit}
          >
            <span className={styles.buttonIcon}>🖼️</span>
            <span className={styles.buttonLabel}>
              {t('dreamBoard.board.toolbar.buttons.uploadPhoto')}
              {imageCount > 0 && (
                <span className={styles.imageLimitIndicator}>
                  {t('dreamBoard.board.toolbar.imageLimitIndicator', {
                    current: imageCount,
                    limit: imageLimit,
                  })}
                </span>
              )}
            </span>
          </button>
        </div>
      )}

      {mode === ToolbarMode.FILTER && categories.length > 0 && (
        <div className={styles.toolbarSection}>
          <button
            className={`${styles.toolbarButton} ${styles.categoryButton} ${selectedCategoryId === null ? styles.active : ''}`}
            onClick={() => onFilterByCategory && onFilterByCategory(null)}
            title={t('dreamBoard.board.toolbar.tooltips.showAll') as string}
          >
            <span className={styles.buttonIcon}>🔄</span>
            <span className={styles.buttonLabel}>{t('dreamBoard.board.toolbar.buttons.all')}</span>
          </button>

          {categories.map(category => {
            const translatedName = getTranslatedCategoryName(category.name);
            return (
              <button
                key={category.id}
                className={`${styles.toolbarButton} ${styles.categoryButton} ${selectedCategoryId === category.id ? styles.active : ''}`}
                onClick={() => onFilterByCategory && onFilterByCategory(category.id)}
                title={
                  t('dreamBoard.board.toolbar.tooltips.showCategory', {
                    category: translatedName,
                  }) as string
                }
                style={{ '--category-color': category.color } as React.CSSProperties}
              >
                <span className={styles.categoryDot}></span>
                <span className={styles.buttonLabel}>{translatedName}</span>
              </button>
            );
          })}
        </div>
      )}

      {mode === ToolbarMode.ARRANGE && (
        <div className={styles.toolbarSection}>
          <button
            className={styles.toolbarButton}
            onClick={onAutoArrange}
            title={t('dreamBoard.board.toolbar.tooltips.autoArrange') as string}
          >
            <span className={styles.buttonIcon}>📊</span>
            <span className={styles.buttonLabel}>
              {t('dreamBoard.board.toolbar.buttons.autoArrange')}
            </span>
          </button>
        </div>
      )}

      {/* Action buttons - always visible */}
      <div className={styles.toolbarSection}>
        <button
          className={`${styles.toolbarButton} ${styles.saveButton}`}
          onClick={onSave}
          disabled={isSaving}
          title={t('dreamBoard.board.toolbar.tooltips.save') as string}
        >
          <span className={styles.buttonIcon}>{isSaving ? '⏳' : '💾'}</span>
          <span className={styles.buttonLabel}>
            {isSaving
              ? t('dreamBoard.board.toolbar.buttons.saving')
              : t('dreamBoard.board.toolbar.buttons.save')}
          </span>
        </button>

        {onDelete && (
          <button
            className={`${styles.toolbarButton} ${styles.deleteButton}`}
            onClick={onDelete}
            title={t('dreamBoard.board.toolbar.tooltips.delete') as string}
          >
            <span className={styles.buttonIcon}>🗑️</span>
            <span className={styles.buttonLabel}>
              {t('dreamBoard.board.toolbar.buttons.delete')}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
