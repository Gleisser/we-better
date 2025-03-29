import React, { useState, useEffect } from 'react';
import { 
  VisionBoardContent, 
  VisionBoardContentType,
  Position,
  Size
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
  // State
  const [text, setText] = useState(content.text || '');
  const [isEditing, setIsEditing] = useState(false);
  
  // Effect to update text when content changes
  useEffect(() => {
    setText(content.text || '');
  }, [content.text]);
  
  // CSS classes based on state
  const classNames = [
    styles.contentItem,
    isSelected ? styles.selected : '',
    content.type === VisionBoardContentType.TEXT ? styles.textItem : '',
  ].filter(Boolean).join(' ');
  
  // Define animation delay and properties based on content ID
  // This ensures different items have slightly different animations
  const getAnimationStyle = () => {
    // Use hash of the content ID to create predictable but varied values
    const hash = content.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Use this to create values in certain ranges
    const angle = 7 + (hash % 8); // 7-15 degrees
    const duration = 1.8 + (hash % 10) / 10; // 1.8-2.8 seconds
    const delay = (hash % 5) / 10; // 0-0.4 seconds
    const direction = hash % 2 === 0 ? 1 : -1; // 1 or -1
    
    return {
      '--angle': `${angle}deg`,
      '--duration': `${duration}s`,
      '--delay': `${delay}s`,
      '--direction': direction,
      '--count': 2 + (hash % 3), // 2-4 iterations
    } as React.CSSProperties;
  };
  
  // Content style based on position and size
  const contentStyle = {
    width: `${content.size.width}px`,
    height: `${content.size.height}px`,
    left: `${content.position.x}px`,
    top: `${content.position.y}px`,
    transform: `rotate(${content.rotation || 0}deg)`,
    zIndex: isSelected ? 5 : 2,
    ...getAnimationStyle()
  };
  
  // Handle click to select
  const handleSelect = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent bubbling to avoid canvas click handler
    e.stopPropagation();
    
    // Only allow selection if not in read-only mode
    if (!readOnly) {
      onSelect(content.id);
    }
  };
  
  // Handle text input change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
  };
  
  // Handle blur for saving text changes
  const handleBlur = () => {
    setIsEditing(false);
    
    // Only update if text has changed
    if (text !== content.text) {
      onUpdate({
        ...content,
        text
      });
    }
  };
  
  // Handle double click for editing text
  const handleDoubleClick = () => {
    if (!readOnly && content.type === VisionBoardContentType.TEXT) {
      setIsEditing(true);
    }
  };
  
  // Render different content types
  const renderContent = () => {
    switch (content.type) {
      case VisionBoardContentType.TEXT:
        return (
          <textarea
            className={styles.contentText}
            value={text}
            onChange={handleTextChange}
            onBlur={handleBlur}
            readOnly={readOnly || !isEditing}
            onDoubleClick={() => !readOnly && setIsEditing(true)}
            style={{
              fontSize: `${content.fontSize || 16}px`,
              color: content.fontColor || '#000000',
              fontFamily: content.fontFamily || 'Arial, sans-serif',
              textAlign: (content.textAlign || 'center') as 'left' | 'center' | 'right',
              fontWeight: content.fontWeight || 'normal'
            }}
          />
        );
        
      case VisionBoardContentType.IMAGE:
        return (
          <img 
            src={content.src}
            alt={content.alt || 'Vision board image'}
            draggable={false}
          />
        );
        
      case VisionBoardContentType.AI_GENERATED:
        return (
          <>
            <img 
              src={content.src}
              alt={content.alt || 'AI generated image'}
              draggable={false}
            />
            <div className={styles.contentSubtitle}>
              AI: {content.prompt}
            </div>
          </>
        );
        
      case VisionBoardContentType.AUDIO:
        return (
          <>
            <div className={styles.audioPlayerWrapper} onClick={(e) => e.stopPropagation()}>
              <audio 
                className={styles.audioPlayer}
                src={content.audioUrl}
                controls
              />
            </div>
            <div className={styles.contentSubtitle}>
              {content.transcription || 'Voice note'}
            </div>
          </>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div
      className={classNames}
      style={contentStyle}
      onClick={handleSelect}
      onDoubleClick={handleDoubleClick}
    >
      {renderContent()}
      
      {/* Show isGoal indicator if set */}
      {content.isGoal && (
        <div className={styles.goalIndicator}>🎯</div>
      )}
    </div>
  );
}; 