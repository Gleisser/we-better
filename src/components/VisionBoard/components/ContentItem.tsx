import React, { useState, useEffect, useRef } from 'react';
import { 
  VisionBoardContent, 
  VisionBoardContentType, 
  TextAlign
} from '../types';
import styles from '../VisionBoard.module.css';

interface ContentItemProps {
  content: VisionBoardContent;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (content: VisionBoardContent) => void;
  readOnly?: boolean;
  categoryColors?: Record<string, string>;
}

// Add a new CategoryIndicator component
interface CategoryIndicatorProps {
  categoryId?: string;
  categoryColors?: Record<string, string>;
}

const CategoryIndicator: React.FC<CategoryIndicatorProps> = ({ categoryId, categoryColors = {} }) => {
  if (!categoryId) return null;
  
  const color = categoryColors[categoryId] || '#999999';
  
  return (
    <div 
      className={styles.categoryIndicator}
      style={{ backgroundColor: color }}
      title="Category Indicator"
    >
      <span className={styles.categoryIcon}>🏷️</span>
    </div>
  );
};

/**
 * ContentItem component displays a single item on the vision board
 * It can be an image, text, audio, or AI-generated content
 */
export const ContentItem: React.FC<ContentItemProps> = ({
  content,
  isSelected,
  onSelect,
  onUpdate,
  readOnly = false,
  categoryColors = {}
}) => {
  // State
  const [text, setText] = useState(content.text || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Effect to update text when content changes
  useEffect(() => {
    setText(content.text || '');
  }, [content.text]);
  
  // CSS classes based on state
  const classNames = [
    styles.contentItem,
    isSelected ? styles.selected : '',
    isDragging ? styles.dragging : '',
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
    zIndex: isDragging ? 10 : (isSelected ? 5 : 2),
    cursor: readOnly ? 'default' : (isDragging ? 'grabbing' : 'grab'),
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
  
  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (readOnly) return;
    
    // Don't initiate drag when clicking on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'TEXTAREA' || 
      target.tagName === 'BUTTON' || 
      target.tagName === 'INPUT' ||
      target.tagName === 'AUDIO' ||
      target.classList.contains(styles.audioPlayer)
    ) {
      return;
    }
    
    // Prevent default browser drag behavior
    e.preventDefault();
    
    // Only initiate drag on main mouse button (left click)
    if (e.button !== 0) return;
    
    // Get the current element position
    const rect = contentRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    // Calculate the offset of the mouse pointer from the element's top-left corner
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    // Store the offset for use during drag
    setDragOffset({ x: offsetX, y: offsetY });
    
    // Start dragging
    setIsDragging(true);
    
    // Select this item if not already selected
    onSelect(content.id);
  };
  
  // Touch handlers for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    if (readOnly) return;
    
    // Don't initiate drag when touching interactive elements
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'TEXTAREA' || 
      target.tagName === 'BUTTON' || 
      target.tagName === 'INPUT' ||
      target.tagName === 'AUDIO' ||
      target.classList.contains(styles.audioPlayer)
    ) {
      return;
    }
    
    // Get the current element position
    const rect = contentRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    // Get the first touch point
    const touch = e.touches[0];
    
    // Calculate the offset of the touch point from the element's top-left corner
    const offsetX = touch.clientX - rect.left;
    const offsetY = touch.clientY - rect.top;
    
    // Store the offset for use during drag
    setDragOffset({ x: offsetX, y: offsetY });
    
    // Start dragging
    setIsDragging(true);
    
    // Select this item if not already selected
    onSelect(content.id);
  };
  
  // Handle touch move for dragging on mobile
  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    
    // Prevent scrolling while dragging
    e.preventDefault();
    
    // Get the parent container's position
    const canvasRect = contentRef.current?.parentElement?.getBoundingClientRect();
    if (!canvasRect) return;
    
    // Get the first touch point
    const touch = e.touches[0];
    
    // Calculate new position relative to canvas, accounting for the drag offset
    const newX = touch.clientX - canvasRect.left - dragOffset.x;
    const newY = touch.clientY - canvasRect.top - dragOffset.y;
    
    // Ensure the element stays within the canvas boundaries
    const maxX = canvasRect.width - content.size.width;
    const maxY = canvasRect.height - content.size.height;
    
    const boundedX = Math.max(0, Math.min(newX, maxX));
    const boundedY = Math.max(0, Math.min(newY, maxY));
    
    // Update the content position
    onUpdate({
      ...content,
      position: {
        x: boundedX,
        y: boundedY
      }
    });
  };
  
  // Handle touch end to stop dragging on mobile
  const handleTouchEnd = () => {
    setIsDragging(false);
  };
  
  // Handle mouse move for dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    // Get the parent container's position
    const canvasRect = contentRef.current?.parentElement?.getBoundingClientRect();
    if (!canvasRect) return;
    
    // Calculate new position relative to canvas, accounting for the drag offset
    const newX = e.clientX - canvasRect.left - dragOffset.x;
    const newY = e.clientY - canvasRect.top - dragOffset.y;
    
    // Ensure the element stays within the canvas boundaries
    const maxX = canvasRect.width - content.size.width;
    const maxY = canvasRect.height - content.size.height;
    
    const boundedX = Math.max(0, Math.min(newX, maxX));
    const boundedY = Math.max(0, Math.min(newY, maxY));
    
    // Update the content position
    onUpdate({
      ...content,
      position: {
        x: boundedX,
        y: boundedY
      }
    });
  };
  
  // Handle mouse up to end dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Add and remove event listeners for drag operations
  useEffect(() => {
    if (isDragging) {
      // Mouse events
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      // Touch events
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
      window.addEventListener('touchcancel', handleTouchEnd);
    }
    
    return () => {
      // Clean up mouse events
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      
      // Clean up touch events
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isDragging, dragOffset]);
  
  // Add render logic for content based on type
  const renderContent = () => {
    switch (content.type) {
      case VisionBoardContentType.TEXT:
        return (
          <div className={styles.textContent}>
            {isEditing ? (
              <textarea
                value={text}
                onChange={handleTextChange}
                onBlur={handleBlur}
                autoFocus
                className={styles.contentText}
              />
            ) : (
              <div 
                className={styles.contentText} 
                style={{
                  color: content.fontColor,
                  fontSize: `${content.fontSize || 16}px`,
                  fontFamily: content.fontFamily,
                  textAlign: (content.textAlign || 'center') as TextAlign,
                  fontWeight: content.fontWeight
                }}
              >
                {content.text}
              </div>
            )}
          </div>
        );
      
      case VisionBoardContentType.IMAGE:
        return (
          <div className={styles.polaroidContainer}>
            <div className={styles.imageWrapper}>
              <img 
                src={content.src} 
                alt={content.alt || 'Vision board image'} 
                className={styles.polaroidImage}
              />
            </div>
            {content.caption && (
              <div className={styles.polaroidCaption}>{content.caption}</div>
            )}
          </div>
        );
      
      case VisionBoardContentType.AI_GENERATED:
        return (
          <div className={styles.aiGeneratedContent}>
            <img 
              src={content.src} 
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
            <div className={styles.audioIcon}>🎵</div>
            {content.transcription && (
              <div className={styles.audioTranscription}>{content.transcription}</div>
            )}
            <div className={styles.audioPlayerWrapper}>
              <audio 
                controls 
                src={content.audioUrl} 
                className={styles.audioPlayer}
                preload="metadata"
              />
            </div>
          </div>
        );
      
      default:
        return <div>Unknown content type</div>;
    }
  };
  
  return (
    <div
      ref={contentRef}
      className={classNames}
      style={contentStyle}
      onClick={handleSelect}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onDoubleClick={handleDoubleClick}
    >
      {/* Render content based on type */}
      {renderContent()}
      
      {/* Show goal indicator if this is a goal */}
      {content.isGoal && (
        <div className={styles.goalIndicator} title="Goal">🎯</div>
      )}
      
      {/* Show category indicator if a category is assigned */}
      {content.categoryId && (
        <CategoryIndicator 
          categoryId={content.categoryId} 
          categoryColors={categoryColors}
        />
      )}
      
      {/* Resize handle for selected items, only if not read-only */}
      {isSelected && !readOnly && (
        <div className={styles.resizeHandle}></div>
      )}
    </div>
  );
}; 