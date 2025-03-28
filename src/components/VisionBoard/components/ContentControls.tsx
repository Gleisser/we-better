import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { VisionBoardContent, VisionBoardContentType, TextAlign, FontWeight } from '../types';
import styles from '../VisionBoard.module.css';

interface ContentControlsProps {
  selectedContent: VisionBoardContent | null;
  onUpdate: (updatedContent: VisionBoardContent) => void;
  onDelete: (id: string) => void;
  className?: string;
}

export const ContentControls: React.FC<ContentControlsProps> = ({
  selectedContent,
  onUpdate,
  onDelete,
  className = ''
}) => {
  const [isGoalExpanded, setIsGoalExpanded] = useState(false);
  const [content, setContent] = useState<VisionBoardContent>(selectedContent || {
    type: VisionBoardContentType.TEXT,
    text: '',
    fontColor: '#000000',
    fontFamily: 'Arial, sans-serif',
    fontSize: 16,
    textAlign: 'left',
    fontWeight: 'normal',
    isGoal: false,
    goalDetails: undefined,
    position: { x: 0, y: 0 },
    size: { width: 200, height: 100 },
    rotation: 0,
    alt: '',
    transcription: '',
    audioUrl: '',
    prompt: ''
  });
  
  useEffect(() => {
    if (selectedContent) {
      setContent(selectedContent);
    }
  }, [selectedContent]);
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      onDelete(content.id);
    }
  };
  
  const handleToggleGoal = () => {
    if (content.isGoal) {
      onUpdate({
        ...content,
        isGoal: false,
        goalDetails: undefined
      });
    } else {
      onUpdate({
        ...content,
        isGoal: true,
        goalDetails: {
          title: '',
          description: '',
          dueDate: null,
          progress: 0
        }
      });
    }
  };
  
  const handleGoalDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (!content.goalDetails) return;
    
    onUpdate({
      ...content,
      goalDetails: {
        ...content.goalDetails,
        [name]: value
      }
    });
  };
  
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!content.goalDetails) return;
    
    onUpdate({
      ...content,
      goalDetails: {
        ...content.goalDetails,
        progress: Number(e.target.value)
      }
    });
  };
  
  const handleCommonChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setContent({
        ...content,
        [name]: parseFloat(value)
      });
    } else {
      setContent({
        ...content,
        [name]: value
      });
    }
  };
  
  const handlePositionChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    
    setContent({
      ...content,
      position: {
        ...content.position,
        [name]: parseFloat(value)
      }
    });
  };
  
  const handleSizeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    
    setContent({
      ...content,
      size: {
        ...content.size,
        [name]: parseFloat(value)
      }
    });
  };
  
  const handleGoalToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isGoal = e.target.checked;
    
    setContent({
      ...content,
      isGoal,
      goalDetails: isGoal 
        ? content.goalDetails || { 
            title: content.type === VisionBoardContentType.TEXT ? content.text : 'My Goal',
            description: 'Describe your goal here',
            progress: 0
          }
        : undefined
    });
  };
  
  const handleApplyChanges = () => {
    onUpdate(content);
  };
  
  const renderTypeSpecificControls = () => {
    switch (content.type) {
      case VisionBoardContentType.TEXT:
        return (
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>Text Style</label>
            <div className={styles.controlRow}>
              <input
                type="color"
                value={content.fontColor}
                onChange={handleCommonChange}
                className={styles.colorPicker}
                title="Font Color"
              />
              
              <select
                value={content.fontFamily}
                onChange={handleCommonChange}
                className={styles.fontSelect}
                title="Font Family"
              >
                <option value="Arial, sans-serif">Sans-serif</option>
                <option value="Times New Roman, serif">Serif</option>
                <option value="Courier New, monospace">Monospace</option>
                <option value="Brush Script MT, cursive">Cursive</option>
              </select>
              
              <input
                type="number"
                min="8"
                max="72"
                value={content.fontSize}
                onChange={handleCommonChange}
                className={styles.numberInput}
                title="Font Size"
              />
            </div>
            
            <div className={styles.controlRow}>
              <select
                value={content.textAlign}
                onChange={handleCommonChange}
                className={styles.alignSelect}
                title="Text Alignment"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
              
              <select
                value={content.fontWeight}
                onChange={handleCommonChange}
                className={styles.weightSelect}
                title="Font Weight"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
              </select>
            </div>
            
            <textarea
              value={content.text}
              onChange={handleCommonChange}
              className={styles.textInput}
              placeholder="Enter text..."
            />
          </div>
        );
        
      case VisionBoardContentType.IMAGE:
      case VisionBoardContentType.AI_GENERATED:
        return (
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>Image Details</label>
            <input
              type="text"
              value={content.alt}
              onChange={handleCommonChange}
              className={styles.textInput}
              placeholder="Alt text / description..."
            />
          </div>
        );
        
      case VisionBoardContentType.AUDIO:
        return (
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>Audio Details</label>
            <input
              type="text"
              value={content.transcription || ''}
              onChange={handleCommonChange}
              className={styles.textInput}
              placeholder="Transcription or notes..."
            />
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <motion.div 
      className={`${styles.contentControls} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.controlHeader}>
        <h3>Edit Content</h3>
        <button 
          className={styles.controlCloseButton}
          onClick={() => onUpdate({ ...content })}
          title="Close Controls"
        >
          ✕
        </button>
      </div>
      
      {renderTypeSpecificControls()}
      
      <div className={styles.controlGroup}>
        <div className={styles.controlRow}>
          <button 
            className={`${styles.controlButton} ${content.isGoal ? styles.active : ''}`}
            onClick={handleToggleGoal}
          >
            {content.isGoal ? 'Remove Goal' : 'Make a Goal'}
          </button>
          
          <button 
            className={`${styles.controlButton} ${styles.dangerButton}`}
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </div>
      
      {content.isGoal && content.goalDetails && (
        <motion.div 
          className={styles.goalDetails}
          initial={{ height: 0, opacity: 0 }}
          animate={{ 
            height: isGoalExpanded ? 'auto' : 'auto',
            opacity: 1 
          }}
          transition={{ duration: 0.3 }}
        >
          <div className={styles.goalDetailsHeader} onClick={() => setIsGoalExpanded(!isGoalExpanded)}>
            <h4>Goal Details</h4>
            <span>{isGoalExpanded ? '▼' : '▶'}</span>
          </div>
          
          {isGoalExpanded && (
            <div className={styles.goalDetailsContent}>
              <div className={styles.formGroup}>
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={content.goalDetails.title}
                  onChange={handleGoalDetailsChange}
                  placeholder="Goal title"
                  className={styles.textInput}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  name="description"
                  value={content.goalDetails.description}
                  onChange={handleGoalDetailsChange}
                  placeholder="Goal description"
                  className={styles.textInput}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Progress: {content.goalDetails.progress}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={content.goalDetails.progress}
                  onChange={handleProgressChange}
                  className={styles.rangeInput}
                />
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}; 