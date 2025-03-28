import React from 'react';
import styles from '../VisionBoard.module.css';

// Toolbar modes
export enum ToolbarMode {
  ADD = 'add',
  ARRANGE = 'arrange',
  FILTER = 'filter'
}

interface ToolbarProps {
  mode: ToolbarMode;
  onModeChange: (mode: ToolbarMode) => void;
  onAddImage: () => void;
  onAddText: () => void;
  onGenerateAI: () => void;
  onAddAudio: () => void;
  onAutoArrange: () => void;
  onToggleThemes: () => void;
  onSave: () => void;
  onShare?: () => void;
  onFilterByCategory?: (categoryId: string | null) => void;
  categories?: { id: string; name: string }[];
  selectedCategoryId?: string | null;
  isSaving?: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  mode,
  onModeChange,
  onAddImage,
  onAddText,
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
  const renderModeButtons = () => (
    <div className={styles.toolbarModes}>
      <button 
        className={`${styles.toolbarButton} ${mode === ToolbarMode.ADD ? styles.active : ''}`}
        onClick={() => onModeChange(ToolbarMode.ADD)}
      >
        Add
      </button>
      <button 
        className={`${styles.toolbarButton} ${mode === ToolbarMode.ARRANGE ? styles.active : ''}`}
        onClick={() => onModeChange(ToolbarMode.ARRANGE)}
      >
        Arrange
      </button>
      <button 
        className={`${styles.toolbarButton} ${mode === ToolbarMode.FILTER ? styles.active : ''}`}
        onClick={() => onModeChange(ToolbarMode.FILTER)}
      >
        Filter
      </button>
    </div>
  );
  
  const renderContentArea = () => {
    switch (mode) {
      case ToolbarMode.ADD:
        return (
          <div className={styles.addTools}>
            <button 
              className={styles.toolbarButton} 
              onClick={onAddText}
            >
              Add Text
            </button>
            <button 
              className={styles.toolbarButton} 
              onClick={onAddImage}
            >
              Add Image
            </button>
            <button 
              className={styles.toolbarButton} 
              onClick={onGenerateAI}
            >
              AI Image
            </button>
            <button 
              className={styles.toolbarButton} 
              onClick={onAddAudio}
            >
              Voice Note
            </button>
          </div>
        );
        
      case ToolbarMode.ARRANGE:
        return (
          <div className={styles.arrangeTools}>
            <button 
              className={styles.toolbarButton}
              onClick={onAutoArrange}
            >
              Auto Arrange
            </button>
            <button 
              className={styles.toolbarButton}
              onClick={onToggleThemes}
            >
              Change Theme
            </button>
          </div>
        );
        
      case ToolbarMode.FILTER:
        return (
          <div className={styles.filterTools}>
            <span style={{ marginRight: '10px' }}>Filter by category:</span>
            <button 
              className={`${styles.toolbarButton} ${selectedCategoryId === null ? styles.active : ''}`}
              onClick={() => onFilterByCategory && onFilterByCategory(null)}
            >
              All Categories
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                className={`${styles.toolbarButton} ${selectedCategoryId === category.id ? styles.active : ''}`}
                onClick={() => onFilterByCategory && onFilterByCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className={styles.toolbar}>
      {renderModeButtons()}
      <div className={styles.toolbarContent}>
        {renderContentArea()}
      </div>
      <div className={styles.toolbarActions}>
        <button 
          className={`${styles.toolbarButton} ${styles.saveButton}`}
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        {onShare && (
          <button 
            className={`${styles.toolbarButton} ${styles.shareButton}`}
            onClick={onShare}
          >
            Share
          </button>
        )}
      </div>
    </div>
  );
}; 