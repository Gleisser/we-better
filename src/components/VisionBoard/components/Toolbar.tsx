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
  isSaving: boolean;
  className?: string;
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
  isSaving,
  className = ''
}) => {
  return (
    <div className={`${styles.toolbar} ${className}`}>
      {/* Mode Switcher */}
      <div className={styles.toolbarModes}>
        <button
          className={`${styles.toolbarButton} ${mode === ToolbarMode.ADD ? styles.active : ''}`}
          onClick={() => onModeChange(ToolbarMode.ADD)}
          title="Add Content"
        >
          <span className={styles.iconAdd}>+</span>
          <span className={styles.buttonLabel}>Add</span>
        </button>
        
        <button
          className={`${styles.toolbarButton} ${mode === ToolbarMode.ARRANGE ? styles.active : ''}`}
          onClick={() => onModeChange(ToolbarMode.ARRANGE)}
          title="Arrange Content"
        >
          <span className={styles.iconArrange}>⊞</span>
          <span className={styles.buttonLabel}>Arrange</span>
        </button>
        
        <button
          className={`${styles.toolbarButton} ${mode === ToolbarMode.FILTER ? styles.active : ''}`}
          onClick={() => onModeChange(ToolbarMode.FILTER)}
          title="Filter Content"
        >
          <span className={styles.iconFilter}>⊲</span>
          <span className={styles.buttonLabel}>Filter</span>
        </button>
      </div>
      
      {/* Mode-specific content */}
      <div className={styles.toolbarContent}>
        {mode === ToolbarMode.ADD && (
          <div className={styles.addTools}>
            <button 
              className={styles.toolbarButton}
              onClick={onAddImage}
              title="Add Image"
            >
              <span className={styles.iconImage}>🖼️</span>
              <span className={styles.buttonLabel}>Image</span>
            </button>
            
            <button 
              className={styles.toolbarButton}
              onClick={onAddText}
              title="Add Text"
            >
              <span className={styles.iconText}>T</span>
              <span className={styles.buttonLabel}>Text</span>
            </button>
            
            <button 
              className={styles.toolbarButton}
              onClick={onGenerateAI}
              title="AI Generated Image"
            >
              <span className={styles.iconAI}>🤖</span>
              <span className={styles.buttonLabel}>AI</span>
            </button>
            
            <button 
              className={styles.toolbarButton}
              onClick={onAddAudio}
              title="Add Voice Note"
            >
              <span className={styles.iconAudio}>🎵</span>
              <span className={styles.buttonLabel}>Audio</span>
            </button>
          </div>
        )}
        
        {mode === ToolbarMode.ARRANGE && (
          <div className={styles.arrangeTools}>
            <button 
              className={styles.toolbarButton}
              onClick={onAutoArrange}
              title="Auto Arrange"
            >
              <span className={styles.iconAutoArrange}>📏</span>
              <span className={styles.buttonLabel}>Auto Arrange</span>
            </button>
            
            <button 
              className={styles.toolbarButton}
              onClick={onToggleThemes}
              title="Change Theme"
            >
              <span className={styles.iconTheme}>🎨</span>
              <span className={styles.buttonLabel}>Themes</span>
            </button>
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className={styles.toolbarActions}>
        <button 
          className={`${styles.toolbarButton} ${styles.saveButton}`}
          onClick={onSave}
          disabled={isSaving}
          title="Save Vision Board"
        >
          <span className={styles.iconSave}>💾</span>
          <span className={styles.buttonLabel}>
            {isSaving ? 'Saving...' : 'Save'}
          </span>
        </button>
        
        {onShare && (
          <button 
            className={`${styles.toolbarButton} ${styles.shareButton}`}
            onClick={onShare}
            title="Share Vision Board"
          >
            <span className={styles.iconShare}>🔗</span>
            <span className={styles.buttonLabel}>Share</span>
          </button>
        )}
      </div>
    </div>
  );
}; 