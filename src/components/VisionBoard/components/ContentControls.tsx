import React, { useState, useEffect } from 'react';
import styles from '../VisionBoard.module.css';
import { VisionBoardContent, VisionBoardContentType } from '../types';

interface ContentControlsProps {
  selectedContent: VisionBoardContent;
  onUpdate: (content: VisionBoardContent) => void;
  onDelete: (id: string) => void;
  onClose?: () => void;
}

export const ContentControls: React.FC<ContentControlsProps> = ({
  selectedContent,
  onUpdate,
  onDelete,
  onClose
}) => {
  // Local state to manage form values
  const [localContent, setLocalContent] = useState<VisionBoardContent>(selectedContent);
  
  // Update local state when selected content changes
  useEffect(() => {
    setLocalContent(selectedContent);
  }, [selectedContent]);
  
  // Handler for form changes
  const handleChange = (changes: Partial<VisionBoardContent>) => {
    const updatedContent = { ...localContent, ...changes };
    setLocalContent(updatedContent);
    onUpdate(updatedContent);
  };
  
  // Toggle goal state
  const handleToggleGoal = () => {
    const isCurrentlyGoal = !!localContent.isGoal;
    handleChange({
      isGoal: !isCurrentlyGoal,
      goalDetails: !isCurrentlyGoal 
        ? { 
            title: localContent.text || "New Goal", 
            description: "", 
            progress: 0 
          } 
        : undefined
    });
  };
  
  // Content type-specific controls
  const renderTypeSpecificControls = () => {
    switch (localContent.type) {
      case VisionBoardContentType.TEXT:
        return (
          <div className={styles.controlGroup}>
            <h3 className={styles.controlLabel}>Text Settings</h3>
            <textarea
              className={styles.textInput}
              value={localContent.text || ''}
              onChange={(e) => handleChange({ text: e.target.value })}
              placeholder="Enter text..."
              rows={3}
            />
            <div className={styles.controlRow}>
              <input
                type="color"
                className={styles.colorPicker}
                value={localContent.fontColor || '#000000'}
                onChange={(e) => handleChange({ fontColor: e.target.value })}
              />
              <select
                className={styles.fontSelect}
                value={localContent.fontFamily || 'Arial, sans-serif'}
                onChange={(e) => handleChange({ fontFamily: e.target.value })}
              >
                <option value="Arial, sans-serif">Arial</option>
                <option value="Times New Roman, serif">Times New Roman</option>
                <option value="Courier New, monospace">Courier New</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="Verdana, sans-serif">Verdana</option>
                <option value="Impact, sans-serif">Impact</option>
              </select>
            </div>
            <div className={styles.controlRow}>
              <input
                type="number"
                className={styles.numberInput}
                value={localContent.fontSize || 16}
                onChange={(e) => handleChange({ fontSize: parseInt(e.target.value) || 16 })}
                min="8"
                max="72"
              />
              <select
                className={styles.alignSelect}
                value={localContent.textAlign || 'center'}
                onChange={(e) => handleChange({ textAlign: e.target.value as 'left' | 'center' | 'right' })}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
              <select
                className={styles.weightSelect}
                value={localContent.fontWeight || 'normal'}
                onChange={(e) => handleChange({ fontWeight: e.target.value })}
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="lighter">Light</option>
              </select>
            </div>
          </div>
        );
        
      case VisionBoardContentType.IMAGE:
        return (
          <div className={styles.controlGroup}>
            <h3 className={styles.controlLabel}>Image Settings</h3>
            <div className={styles.controlRow}>
              <input
                type="text"
                className={styles.textInput}
                value={localContent.src || ''}
                readOnly
              />
            </div>
            <div className={styles.controlRow}>
              <button
                className={styles.controlButton}
                onClick={() => {
                  // Trigger file input
                  const fileInput = document.createElement('input');
                  fileInput.type = 'file';
                  fileInput.accept = 'image/*';
                  fileInput.onchange = (e) => {
                    const target = e.target as HTMLInputElement;
                    if (target.files && target.files[0]) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        if (event.target && typeof event.target.result === 'string') {
                          handleChange({
                            src: event.target.result,
                            alt: target.files ? target.files[0].name : 'Uploaded image'
                          });
                        }
                      };
                      reader.readAsDataURL(target.files[0]);
                    }
                  };
                  fileInput.click();
                }}
              >
                Replace Image
              </button>
            </div>
          </div>
        );
        
      case VisionBoardContentType.AUDIO:
        return (
          <div className={styles.controlGroup}>
            <h3 className={styles.controlLabel}>Audio Settings</h3>
            <textarea
              className={styles.textInput}
              value={localContent.transcription || ''}
              onChange={(e) => handleChange({ transcription: e.target.value })}
              placeholder="Transcription or title for the audio"
            />
          </div>
        );
        
      case VisionBoardContentType.AI_GENERATED:
        return (
          <div className={styles.controlGroup}>
            <h3 className={styles.controlLabel}>AI Image Settings</h3>
            <textarea
              className={styles.textInput}
              value={localContent.prompt || ''}
              onChange={(e) => handleChange({ prompt: e.target.value })}
              placeholder="AI prompt..."
            />
            <div className={styles.controlRow}>
              <input
                type="text"
                className={styles.textInput}
                value={localContent.src || ''}
                readOnly
              />
            </div>
            <div className={styles.controlRow}>
              <button
                className={styles.controlButton}
                onClick={() => {
                  // Trigger file input for replacement
                  const fileInput = document.createElement('input');
                  fileInput.type = 'file';
                  fileInput.accept = 'image/*';
                  fileInput.onchange = (e) => {
                    const target = e.target as HTMLInputElement;
                    if (target.files && target.files[0]) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        if (event.target && typeof event.target.result === 'string') {
                          handleChange({
                            src: event.target.result,
                            alt: target.files ? target.files[0].name : 'Uploaded image'
                          });
                        }
                      };
                      reader.readAsDataURL(target.files[0]);
                    }
                  };
                  fileInput.click();
                }}
              >
                Replace Image
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className={styles.contentControls} onClick={(e) => e.stopPropagation()}>
      <div className={styles.controlHeader}>
        <h3>Edit Content</h3>
        <button 
          className={styles.controlCloseButton} 
          onClick={() => onClose && onClose()}
        >
          ×
        </button>
      </div>
      
      {/* Position and Size Controls */}
      <div className={styles.controlGroup}>
        <h3 className={styles.controlLabel}>Position & Size</h3>
        <div className={styles.controlRow}>
          <label>X:</label>
          <input
            type="number"
            className={styles.numberInput}
            value={Math.round(localContent.position.x)}
            onChange={(e) => handleChange({ 
              position: { 
                ...localContent.position, 
                x: parseInt(e.target.value) || 0 
              } 
            })}
            style={{ width: '60px' }}
          />
          <label>Y:</label>
          <input
            type="number"
            className={styles.numberInput}
            value={Math.round(localContent.position.y)}
            onChange={(e) => handleChange({ 
              position: { 
                ...localContent.position, 
                y: parseInt(e.target.value) || 0 
              } 
            })}
            style={{ width: '60px' }}
          />
        </div>
        <div className={styles.controlRow}>
          <label>W:</label>
          <input
            type="number"
            className={styles.numberInput}
            value={Math.round(localContent.size.width)}
            onChange={(e) => {
              const width = parseInt(e.target.value) || 50;
              handleChange({ 
                size: { 
                  ...localContent.size, 
                  width: Math.max(50, width) 
                } 
              });
            }}
            min="50"
            style={{ width: '60px' }}
          />
          <label>H:</label>
          <input
            type="number"
            className={styles.numberInput}
            value={Math.round(localContent.size.height)}
            onChange={(e) => {
              const height = parseInt(e.target.value) || 50;
              handleChange({ 
                size: { 
                  ...localContent.size, 
                  height: Math.max(50, height) 
                } 
              });
            }}
            min="50"
            style={{ width: '60px' }}
          />
        </div>
      </div>
      
      {/* Type-specific controls */}
      {renderTypeSpecificControls()}
      
      {/* Goal Tracking */}
      <div className={styles.controlGroup}>
        <h3 className={styles.controlLabel}>Goal Tracking</h3>
        <div className={styles.controlRow}>
          <button
            className={`${styles.controlButton} ${localContent.isGoal ? styles.active : ''}`}
            onClick={handleToggleGoal}
          >
            {localContent.isGoal ? 'Unset as Goal' : 'Set as Goal'}
          </button>
        </div>
      </div>
      
      {/* Delete button */}
      <div className={styles.controlGroup}>
        <button
          className={`${styles.controlButton} ${styles.dangerButton}`}
          onClick={() => onDelete(localContent.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}; 