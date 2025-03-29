import React from 'react';
import styles from './Toolbar.module.css';
import visionBoardStyles from '../VisionBoard.module.css';
import { ToolbarMode } from '../types';

export interface ToolbarProps {
  mode: ToolbarMode;
  onModeChange: (mode: ToolbarMode) => void;
  onAddText: () => void;
  onAddImage: () => void;
  onGenerateAI: () => void;
  onAddAudio: () => void;
  onAutoArrange: () => void;
  onToggleThemes: () => void;
  onSave: () => void;
  onShare?: () => void;
  onFilterByCategory?: (categoryId: string | null) => void;
  categories?: { id: string; name: string; color: string }[];
  selectedCategoryId?: string | null;
  isSaving?: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  mode,
  onModeChange,
  onAddText,
  onAddImage,
  onGenerateAI,
  onAddAudio,
  onAutoArrange,
  onToggleThemes,
  onSave,
  onShare,
  onFilterByCategory,
  categories = [],
  selectedCategoryId = null,
  isSaving = false
}) => {
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
        
        <button
          className={`${styles.toolbarButton} ${styles.modeButton} ${mode === ToolbarMode.THEME ? styles.active : ''}`}
          onClick={() => onModeChange(ToolbarMode.THEME)}
          title="Change Theme"
        >
          <span className={styles.buttonIcon}>🎨</span>
          <span className={styles.buttonLabel}>Theme</span>
        </button>
      </div>
      
      {/* Mode-specific sections */}
      {mode === ToolbarMode.ADD && (
        <div className={styles.toolbarSection}>
          <button
            className={styles.toolbarButton}
            onClick={onAddText}
            title="Add Text"
          >
            <span className={styles.buttonIcon}>📝</span>
            <span className={styles.buttonLabel}>Text</span>
          </button>
          
          <button
            className={styles.toolbarButton}
            onClick={onAddImage}
            title="Add Image"
          >
            <span className={styles.buttonIcon}>🖼️</span>
            <span className={styles.buttonLabel}>Image</span>
          </button>
          
          <button
            className={styles.toolbarButton}
            onClick={onGenerateAI}
            title="Generate AI Image"
          >
            <span className={styles.buttonIcon}>🤖</span>
            <span className={styles.buttonLabel}>AI Image</span>
          </button>
          
          <button
            className={styles.toolbarButton}
            onClick={onAddAudio}
            title="Record Audio"
          >
            <span className={styles.buttonIcon}>🎙️</span>
            <span className={styles.buttonLabel}>Audio</span>
          </button>
        </div>
      )}
      
      {mode === ToolbarMode.FILTER && onFilterByCategory && (
        <div className={styles.toolbarSection}>
          <button
            className={`${styles.toolbarButton} ${styles.categoryButton} ${selectedCategoryId === null ? styles.active : ''}`}
            onClick={() => onFilterByCategory(null)}
          >
            <span className={styles.buttonIcon}>🔎</span>
            <span className={styles.buttonLabel}>All Categories</span>
          </button>
          
          {categories.map(category => (
            <button
              key={category.id}
              className={`${styles.toolbarButton} ${styles.categoryButton} ${selectedCategoryId === category.id ? styles.active : ''}`}
              onClick={() => onFilterByCategory(category.id)}
              style={{ 
                '--category-color': category.color
              } as React.CSSProperties}
            >
              <span className={styles.categoryDot} style={{ backgroundColor: category.color }}></span>
              <span className={styles.buttonLabel}>{category.name}</span>
            </button>
          ))}
        </div>
      )}
      
      {mode === ToolbarMode.ARRANGE && (
        <div className={styles.toolbarSection}>
          <button
            className={styles.toolbarButton}
            onClick={onAutoArrange}
            title="Auto Arrange"
          >
            <span className={styles.buttonIcon}>📊</span>
            <span className={styles.buttonLabel}>Auto Arrange</span>
          </button>
          
          <button
            className={styles.toolbarButton}
            onClick={() => {
              // Apply the swaying animation effect
              const canvasContainer = document.querySelector(`.${visionBoardStyles.canvasContainer}`);
              if (canvasContainer) {
                canvasContainer.classList.add(visionBoardStyles.animate);
                setTimeout(() => {
                  canvasContainer.classList.remove(visionBoardStyles.animate);
                }, 10000); // Animation duration
              }
            }}
            title="Animate"
          >
            <span className={styles.buttonIcon}>🎬</span>
            <span className={styles.buttonLabel}>Animate</span>
          </button>
        </div>
      )}
      
      {mode === ToolbarMode.THEME && (
        <div className={styles.toolbarSection}>
          <button
            className={styles.toolbarButton}
            onClick={onToggleThemes}
            title="Choose Theme"
          >
            <span className={styles.buttonIcon}>🎭</span>
            <span className={styles.buttonLabel}>Change Theme</span>
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
        
        {onShare && (
          <button
            className={`${styles.toolbarButton} ${styles.shareButton}`}
            onClick={onShare}
            title="Share Vision Board"
          >
            <span className={styles.buttonIcon}>📤</span>
            <span className={styles.buttonLabel}>Share</span>
          </button>
        )}
      </div>
    </div>
  );
}; 