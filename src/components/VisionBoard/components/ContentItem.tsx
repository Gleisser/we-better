import React from 'react';
import { motion, useDragControls } from 'framer-motion';
import { VisionBoardContent, VisionBoardContentType } from '../types';
import styles from '../VisionBoard.module.css';

interface ContentItemProps {
  content: VisionBoardContent;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (content: VisionBoardContent) => void;
  readOnly: boolean;
}

/**
 * ContentItem component displays a single item on the vision board
 * It can be an image, text, audio, or AI-generated content
 */
export const ContentItem: React.FC<ContentItemProps> = ({
  content,
  isSelected,
  onSelect,
  onUpdate,
  readOnly
}) => {
  const dragControls = useDragControls();
  
  // Handle item drag
  const handleDragEnd = (info: any) => {
    if (readOnly) return;
    
    const newContent = {
      ...content,
      position: {
        ...content.position,
        x: content.position.x + info.offset.x,
        y: content.position.y + info.offset.y
      }
    };
    
    onUpdate(newContent);
  };

  // Handle click on the content item
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!readOnly) {
      onSelect(content.id);
    }
  };

  // Render content based on type
  const renderContent = () => {
    switch (content.type) {
      case VisionBoardContentType.TEXT:
        return (
          <div 
            className={styles.textContent}
            style={{
              fontSize: `${content.fontSize}px`,
              fontFamily: content.fontFamily,
              color: content.fontColor,
              textAlign: content.textAlign as any,
              fontWeight: content.fontWeight as any
            }}
          >
            {content.text}
          </div>
        );
        
      case VisionBoardContentType.IMAGE:
        return (
          <img 
            src={content.src} 
            alt={content.alt}
            className={styles.imageContent}
            draggable={false}
          />
        );
        
      case VisionBoardContentType.AI_GENERATED:
        return (
          <div className={styles.aiGeneratedContent}>
            <img 
              src={content.src} 
              alt={content.alt}
              className={styles.imageContent}
              draggable={false}
            />
            <div className={styles.aiPromptOverlay}>
              <span className={styles.aiPromptLabel}>AI Prompt:</span>
              <p className={styles.aiPromptText}>{content.prompt}</p>
            </div>
          </div>
        );
        
      case VisionBoardContentType.AUDIO:
        return (
          <div className={styles.audioContent}>
            <div className={styles.audioIcon}>🎵</div>
            <div className={styles.audioTranscription}>
              {content.transcription || "Voice note"}
            </div>
            <audio controls src={content.audioUrl} className={styles.audioPlayer} />
          </div>
        );
        
      default:
        return <div>Unknown content type</div>;
    }
  };

  return (
    <motion.div
      className={`${styles.contentItem} ${isSelected ? styles.selected : ''}`}
      style={{
        width: `${content.size.width}px`,
        height: `${content.size.height}px`,
        transform: `rotate(${content.rotation}deg)`,
        zIndex: isSelected ? 10 : 1
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        x: content.position.x,
        y: content.position.y,
        rotate: content.rotation
      }}
      transition={{ duration: 0.3 }}
      drag={!readOnly}
      dragControls={dragControls}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.02, zIndex: 20 }}
      onClick={handleClick}
    >
      {renderContent()}
      
      {isSelected && !readOnly && (
        <div className={styles.contentItemControls}>
          <div className={styles.resizeHandle}></div>
        </div>
      )}
      
      {content.isGoal && (
        <div className={styles.goalIndicator}>
          <div className={styles.goalProgressBar}>
            <div 
              className={styles.goalProgressFill}
              style={{ width: `${content.goalDetails?.progress || 0}%` }}
            ></div>
          </div>
        </div>
      )}
    </motion.div>
  );
}; 