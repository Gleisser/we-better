import React, { useState } from 'react';
import { 
  VisionBoardContent, 
  VisionBoardContentType,
  Position,
  Size,
  GoalDetails
} from '../types';
import styles from '../VisionBoard.module.css';

interface ContentControlsProps {
  selectedContent: VisionBoardContent;
  onUpdate: (content: VisionBoardContent) => void;
  onDelete: (id: string) => void;
}

export const ContentControls: React.FC<ContentControlsProps> = ({
  selectedContent,
  onUpdate,
  onDelete
}) => {
  // Local state for the selected content
  const [localContent, setLocalContent] = useState<VisionBoardContent>(selectedContent);
  
  // Update the local content and propagate changes
  const handleChange = (changes: Partial<VisionBoardContent>) => {
    const updatedContent = { ...localContent, ...changes };
    setLocalContent(updatedContent);
    onUpdate(updatedContent);
  };
  
  // Handle common property changes
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    handleChange({ text: e.target.value });
  };
  
  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange({ fontSize: parseInt(e.target.value, 10) });
  };
  
  const handleFontColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange({ fontColor: e.target.value });
  };
  
  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleChange({ fontFamily: e.target.value });
  };
  
  const handleTextAlignChange = (align: string) => {
    handleChange({ textAlign: align });
  };
  
  const handleFontWeightChange = (weight: string) => {
    handleChange({ fontWeight: weight });
  };
  
  // Handle position and size adjustments
  const handlePositionChange = (axis: 'x' | 'y', value: number) => {
    const newPosition: Position = {
      ...localContent.position,
      [axis]: value
    };
    handleChange({ position: newPosition });
  };
  
  const handleSizeChange = (dimension: 'width' | 'height', value: number) => {
    const newSize: Size = {
      ...localContent.size,
      [dimension]: value
    };
    handleChange({ size: newSize });
  };
  
  // Handle goal tracking
  const handleToggleGoal = () => {
    if (localContent.isGoal) {
      handleChange({ isGoal: false, goalDetails: undefined });
    } else {
      const goalDetails: GoalDetails = {
        title: localContent.text || 'New Goal',
        description: '',
        progress: 0
      };
      handleChange({ isGoal: true, goalDetails });
    }
  };
  
  const handleGoalProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!localContent.goalDetails) return;
    
    const progress = parseInt(e.target.value, 10);
    const updatedGoalDetails: GoalDetails = {
      ...localContent.goalDetails,
      progress
    };
    handleChange({ goalDetails: updatedGoalDetails });
  };
  
  const handleGoalTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!localContent.goalDetails) return;
    
    const updatedGoalDetails: GoalDetails = {
      ...localContent.goalDetails,
      title: e.target.value
    };
    handleChange({ goalDetails: updatedGoalDetails });
  };
  
  const handleGoalDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!localContent.goalDetails) return;
    
    const updatedGoalDetails: GoalDetails = {
      ...localContent.goalDetails,
      description: e.target.value
    };
    handleChange({ goalDetails: updatedGoalDetails });
  };
  
  // Render different controls based on content type
  const renderTypeSpecificControls = () => {
    switch (localContent.type) {
      case VisionBoardContentType.TEXT:
        return (
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>Text Content</label>
            <textarea
              className={styles.textInput}
              value={localContent.text || ''}
              onChange={handleTextChange}
              placeholder="Enter text..."
              rows={3}
            />
            
            <div className={styles.controlRow}>
              <input
                type="color"
                className={styles.colorPicker}
                value={localContent.fontColor || '#000000'}
                onChange={handleFontColorChange}
              />
              
              <select
                className={styles.fontSelect}
                value={localContent.fontFamily || 'Arial, sans-serif'}
                onChange={handleFontFamilyChange}
              >
                <option value="Arial, sans-serif">Arial</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="Verdana, sans-serif">Verdana</option>
                <option value="Courier New, monospace">Courier New</option>
              </select>
              
              <input
                type="number"
                className={styles.numberInput}
                value={localContent.fontSize || 16}
                onChange={handleFontSizeChange}
                min={8}
                max={72}
              />
            </div>
            
            <div className={styles.controlRow}>
              <button
                className={`${styles.controlButton} ${localContent.textAlign === 'left' ? styles.active : ''}`}
                onClick={() => handleTextAlignChange('left')}
              >
                Left
              </button>
              <button
                className={`${styles.controlButton} ${localContent.textAlign === 'center' ? styles.active : ''}`}
                onClick={() => handleTextAlignChange('center')}
              >
                Center
              </button>
              <button
                className={`${styles.controlButton} ${localContent.textAlign === 'right' ? styles.active : ''}`}
                onClick={() => handleTextAlignChange('right')}
              >
                Right
              </button>
            </div>
            
            <div className={styles.controlRow}>
              <button
                className={`${styles.controlButton} ${localContent.fontWeight === 'normal' ? styles.active : ''}`}
                onClick={() => handleFontWeightChange('normal')}
              >
                Normal
              </button>
              <button
                className={`${styles.controlButton} ${localContent.fontWeight === 'bold' ? styles.active : ''}`}
                onClick={() => handleFontWeightChange('bold')}
              >
                Bold
              </button>
            </div>
          </div>
        );
        
      case VisionBoardContentType.IMAGE:
        return (
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>Image Settings</label>
            <input
              type="text"
              className={styles.textInput}
              value={localContent.alt || ''}
              onChange={(e) => handleChange({ alt: e.target.value })}
              placeholder="Image description..."
            />
            <div className={styles.controlRow}>
              <button
                className={styles.controlButton}
                onClick={() => {
                  // Implement image replacement logic
                  const fileInput = document.createElement('input');
                  fileInput.type = 'file';
                  fileInput.accept = 'image/*';
                  fileInput.onchange = (e) => {
                    const target = e.target as HTMLInputElement;
                    if (target.files && target.files[0]) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        if (event.target && typeof event.target.result === 'string') {
                          handleChange({ src: event.target.result });
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
            <label className={styles.controlLabel}>Audio Settings</label>
            <textarea
              className={styles.textInput}
              value={localContent.transcription || ''}
              onChange={(e) => handleChange({ transcription: e.target.value })}
              placeholder="Audio transcription or notes..."
              rows={3}
            />
            <div className={styles.controlRow}>
              <button
                className={styles.controlButton}
                onClick={() => {
                  // Implement audio recording logic
                  alert('Audio recording feature coming soon!');
                }}
              >
                Record New Audio
              </button>
            </div>
          </div>
        );
        
      case VisionBoardContentType.AI_GENERATED:
        return (
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>AI Image Settings</label>
            <textarea
              className={styles.textInput}
              value={localContent.prompt || ''}
              onChange={(e) => handleChange({ prompt: e.target.value })}
              placeholder="Enter prompt for AI generation..."
              rows={3}
            />
            <div className={styles.controlRow}>
              <button
                className={styles.controlButton}
                onClick={() => {
                  // Implement AI image generation logic
                  if (localContent.prompt) {
                    alert(`AI generation for prompt: "${localContent.prompt}" coming soon!`);
                  } else {
                    alert('Please enter a prompt first.');
                  }
                }}
              >
                Generate New Image
              </button>
            </div>
          </div>
        );
        
      default:
        return <div>No settings available for this content type.</div>;
    }
  };
  
  return (
    <div className={styles.contentControls}>
      <div className={styles.controlHeader}>
        <h3>Edit Content</h3>
        <button 
          className={styles.controlCloseButton}
          onClick={() => onUpdate(localContent)}
        >
          ×
        </button>
      </div>
      
      {/* Position and Size Controls */}
      <div className={styles.controlGroup}>
        <label className={styles.controlLabel}>Position & Size</label>
        <div className={styles.controlRow}>
          <label>X:</label>
          <input
            type="number"
            className={styles.numberInput}
            value={Math.round(localContent.position.x)}
            onChange={(e) => handlePositionChange('x', parseInt(e.target.value, 10))}
          />
          <label>Y:</label>
          <input
            type="number"
            className={styles.numberInput}
            value={Math.round(localContent.position.y)}
            onChange={(e) => handlePositionChange('y', parseInt(e.target.value, 10))}
          />
        </div>
        <div className={styles.controlRow}>
          <label>W:</label>
          <input
            type="number"
            className={styles.numberInput}
            value={Math.round(localContent.size.width)}
            onChange={(e) => handleSizeChange('width', parseInt(e.target.value, 10))}
            min={50}
          />
          <label>H:</label>
          <input
            type="number"
            className={styles.numberInput}
            value={Math.round(localContent.size.height)}
            onChange={(e) => handleSizeChange('height', parseInt(e.target.value, 10))}
            min={50}
          />
        </div>
      </div>
      
      {/* Type-specific controls */}
      {renderTypeSpecificControls()}
      
      {/* Goal Tracking */}
      <div className={styles.controlGroup}>
        <label className={styles.controlLabel}>Goal Tracking</label>
        <div className={styles.controlRow}>
          <button
            className={`${styles.controlButton} ${localContent.isGoal ? styles.active : ''}`}
            onClick={handleToggleGoal}
          >
            {localContent.isGoal ? 'Remove Goal' : 'Set as Goal'}
          </button>
        </div>
        
        {localContent.isGoal && localContent.goalDetails && (
          <div className={styles.goalDetails}>
            <div className={styles.formGroup}>
              <label>Goal Title</label>
              <input
                type="text"
                className={styles.textInput}
                value={localContent.goalDetails.title}
                onChange={handleGoalTitleChange}
                placeholder="Goal title..."
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea
                className={styles.textInput}
                value={localContent.goalDetails.description}
                onChange={handleGoalDescriptionChange}
                placeholder="Goal description..."
                rows={2}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Progress: {localContent.goalDetails.progress}%</label>
              <input
                type="range"
                className={styles.rangeInput}
                value={localContent.goalDetails.progress}
                onChange={handleGoalProgressChange}
                min={0}
                max={100}
                step={5}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Delete Button */}
      <div className={styles.controlGroup}>
        <button
          className={`${styles.controlButton} ${styles.dangerButton}`}
          onClick={() => onDelete(localContent.id)}
        >
          Delete Content
        </button>
      </div>
    </div>
  );
}; 