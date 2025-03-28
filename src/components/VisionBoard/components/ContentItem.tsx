import React from 'react';
import { motion } from 'framer-motion';
import { 
  VisionBoardContent, 
  VisionBoardContentType,
  Position
} from '../types';
import styles from '../VisionBoard.module.css';

interface ContentItemProps {
  content: VisionBoardContent;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (content: VisionBoardContent) => void;
  readOnly?: boolean;
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
  readOnly = false
}) => {
  const handleDragEnd = (info: any) => {
    if (readOnly) return;
    
    const newPosition: Position = {
      x: content.position.x + info.offset.x,
      y: content.position.y + info.offset.y
    };
    
    onUpdate({
      ...content,
      position: newPosition
    });
  };
  
  const renderContentBasedOnType = () => {
    switch (content.type) {
      case VisionBoardContentType.TEXT:
        return (
          <div 
            className={styles.textContent}
            style={{
              fontSize: `${content.fontSize || 16}px`,
              color: content.fontColor || '#000000',
              fontFamily: content.fontFamily || 'Arial, sans-serif',
              textAlign: content.textAlign as any || 'center',
              fontWeight: content.fontWeight || 'normal'
            }}
          >
            {content.text || 'Text content'}
          </div>
        );
        
      case VisionBoardContentType.IMAGE:
        return (
          <img 
            src={content.src || 'https://via.placeholder.com/200'}
            alt={content.alt || 'Vision board image'}
            className={styles.imageContent}
          />
        );
        
      case VisionBoardContentType.AI_GENERATED:
        return (
          <div className={styles.aiGeneratedContent}>
            <img 
              src={content.src || 'https://via.placeholder.com/200'}
              alt={content.alt || 'AI generated image'}
              className={styles.imageContent}
            />
            {content.prompt && (
              <div className={styles.aiPromptOverlay}>
                <span className={styles.aiPromptLabel}>Prompt:</span>
                <p className={styles.aiPromptText}>{content.prompt}</p>
              </div>
            )}
          </div>
        );
        
      case VisionBoardContentType.AUDIO:
        return (
          <div className={styles.audioContent}>
            <div className={styles.audioIcon}>🔊</div>
            {content.transcription && (
              <div className={styles.audioTranscription}>
                {content.transcription}
              </div>
            )}
            {content.audioUrl && (
              <audio
                controls
                src={content.audioUrl}
                className={styles.audioPlayer}
              />
            )}
          </div>
        );
        
      default:
        return <div>Unknown content type</div>;
    }
  };
  
  // Render the goal indicator if this content is marked as a goal
  const renderGoalIndicator = () => {
    if (!content.isGoal || !content.goalDetails) return null;
    
    const { progress } = content.goalDetails;
    
    return (
      <div className={styles.goalIndicator}>
        <div className={styles.goalProgressBar}>
          <div 
            className={styles.goalProgressFill} 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  };
  
  return (
    <motion.div
      className={`${styles.contentItem} ${isSelected ? styles.selected : ''}`}
      style={{
        width: content.size.width,
        height: content.size.height,
        x: content.position.x,
        y: content.position.y,
        rotate: content.rotation || 0,
        zIndex: isSelected ? 10 : 1
      }}
      drag={!readOnly}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      onClick={() => onSelect(content.id)}
      whileDrag={{ scale: 1.02, opacity: 0.9 }}
      transition={{ type: 'spring', damping: 15 }}
    >
      {renderContentBasedOnType()}
      {renderGoalIndicator()}
      
      {isSelected && !readOnly && (
        <div className={styles.contentItemControls}>
          <div 
            className={styles.resizeHandle} 
            onMouseDown={(e) => {
              e.stopPropagation();
              // Resize logic would go here in a more complex implementation
            }}
          />
        </div>
      )}
    </motion.div>
  );
}; 