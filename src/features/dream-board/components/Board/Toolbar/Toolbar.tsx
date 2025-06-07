import React from 'react';
import styles from './Toolbar.module.css';
import { ToolbarMode } from '../types';

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
  const imageLimit = 7;

  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarSection}>
        <button
          className={`${styles.toolbarButton} ${styles.modeButton} ${mode === ToolbarMode.ADD ? styles.active : ''}`}
          onClick={() => onModeChange(ToolbarMode.ADD)}
          title="Add Content"
        >
          <span className={styles.buttonIcon}>➕</span>
          <span className={styles.buttonLabel}>Add</span>
        </button>

        <button
          className={`${styles.toolbarButton} ${styles.modeButton} ${mode === ToolbarMode.FILTER ? styles.active : ''}`}
          onClick={() => onModeChange(ToolbarMode.FILTER)}
          title="Filter Content"
        >
          <span className={styles.buttonIcon}>🔍</span>
          <span className={styles.buttonLabel}>Filter</span>
        </button>

        <button
          className={`${styles.toolbarButton} ${styles.modeButton} ${mode === ToolbarMode.ARRANGE ? styles.active : ''}`}
          onClick={() => onModeChange(ToolbarMode.ARRANGE)}
          title="Arrange Content"
        >
          <span className={styles.buttonIcon}>📋</span>
          <span className={styles.buttonLabel}>Arrange</span>
        </button>
      </div>

      {/* Mode-specific sections */}
      {mode === ToolbarMode.ADD && (
        <div className={styles.toolbarSection}>
          <button
            className={styles.toolbarButton}
            onClick={onAddImage}
            title="Upload Image"
            disabled={imageCount >= imageLimit}
          >
            <span className={styles.buttonIcon}>🖼️</span>
            <span className={styles.buttonLabel}>
              Upload Photo
              {imageCount > 0 && (
                <span className={styles.imageLimitIndicator}>
                  {imageCount}/{imageLimit}
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
            title="Show All Categories"
          >
            <span className={styles.buttonIcon}>🔄</span>
            <span className={styles.buttonLabel}>All</span>
          </button>

          {categories.map(category => (
            <button
              key={category.id}
              className={`${styles.toolbarButton} ${styles.categoryButton} ${selectedCategoryId === category.id ? styles.active : ''}`}
              onClick={() => onFilterByCategory && onFilterByCategory(category.id)}
              title={`Show ${category.name} Items`}
              style={{ '--category-color': category.color } as React.CSSProperties}
            >
              <span className={styles.categoryDot}></span>
              <span className={styles.buttonLabel}>{category.name}</span>
            </button>
          ))}
        </div>
      )}

      {mode === ToolbarMode.ARRANGE && (
        <div className={styles.toolbarSection}>
          <button className={styles.toolbarButton} onClick={onAutoArrange} title="Auto Arrange">
            <span className={styles.buttonIcon}>📊</span>
            <span className={styles.buttonLabel}>Auto Arrange</span>
          </button>
        </div>
      )}

      {/* Action buttons - always visible */}
      <div className={styles.toolbarSection}>
        <button
          className={`${styles.toolbarButton} ${styles.saveButton}`}
          onClick={onSave}
          disabled={isSaving}
          title="Save Vision Board"
        >
          <span className={styles.buttonIcon}>{isSaving ? '⏳' : '💾'}</span>
          <span className={styles.buttonLabel}>{isSaving ? 'Saving...' : 'Save'}</span>
        </button>

        {onDelete && (
          <button
            className={`${styles.toolbarButton} ${styles.deleteButton}`}
            onClick={onDelete}
            title="Delete Dream Board"
          >
            <span className={styles.buttonIcon}>🗑️</span>
            <span className={styles.buttonLabel}>Delete</span>
          </button>
        )}
      </div>
    </div>
  );
};
