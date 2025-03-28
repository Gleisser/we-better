import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  VisionBoardProps, 
  VisionBoardData, 
  VisionBoardContentType,
  VisionBoardContent,
  Position,
} from './types';
import { ContentItem } from './components/ContentItem';
import { ContentControls } from './components/ContentControls';
import { Toolbar, ToolbarMode } from './components/Toolbar';
import { ThemeSelector } from './components/ThemeSelector';
import { IntroScreen } from './components/IntroScreen';
import { Toast } from './components/Toast';
import { themes } from './constants/themes';
import styles from './VisionBoard.module.css';

export const VisionBoard: React.FC<VisionBoardProps> = ({
  lifeWheelCategories,
  data,
  loading = false,
  error,
  onSave,
  onShare,
  className = '',
  readOnly = false
}) => {
  // Canvas state
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  
  // Board data state
  const [boardData, setBoardData] = useState<VisionBoardData>({
    title: 'My Vision Board',
    description: 'Based on my Life Wheel assessment',
    themeId: 'light',
    categories: lifeWheelCategories.map(cat => cat.id),
    content: []
  });
  
  // UI state
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [firstVisit, setFirstVisit] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ 
    visible: false, 
    message: '', 
    type: 'info' as 'success' | 'error' | 'info' | 'warning' 
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [toolbarMode, setToolbarMode] = useState<ToolbarMode>(ToolbarMode.ADD);
  
  // Initialize board data
  useEffect(() => {
    if (data) {
      setBoardData(data);
    } else {
      setBoardData({
        title: 'My Vision Board',
        description: 'Based on my Life Wheel assessment',
        themeId: 'light',
        categories: lifeWheelCategories.map(cat => cat.id),
        content: []
      });
    }
  }, [data, lifeWheelCategories]);
  
  // Update canvas size on window resize
  useEffect(() => {
    const updateDimensions = () => {
      const container = document.querySelector(`.${styles.canvasContainer}`);
      if (container) {
        setCanvasSize({
          width: container.clientWidth,
          height: container.clientHeight
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);
  
  // Check if it's the first visit
  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem('visionBoardVisited');
    if (!hasVisitedBefore) {
      setFirstVisit(true);
      localStorage.setItem('visionBoardVisited', 'true');
    } else {
      setFirstVisit(false);
    }
  }, []);
  
  // Get the selected content
  const selectedContent = boardData.content.find(item => item.id === selectedContentId);
  
  // Get the active theme
  const activeTheme = themes.find(theme => theme.id === boardData.themeId) || themes[0];
  
  // Filter content by selected category
  const filteredContent = selectedCategoryId
    ? boardData.content.filter(item => item.categoryId === selectedCategoryId)
    : boardData.content;
  
  // Handle content selection
  const handleSelectContent = (id: string) => {
    setSelectedContentId(id);
    setShowControls(true);
  };
  
  // Handle content update
  const handleUpdateContent = (updatedContent: VisionBoardContent) => {
    setBoardData(prev => ({
      ...prev,
      content: prev.content.map(item => 
        item.id === updatedContent.id ? updatedContent : item
      )
    }));
  };
  
  // Handle content deletion
  const handleDeleteContent = (id: string) => {
    setBoardData(prev => ({
      ...prev,
      content: prev.content.filter(item => item.id !== id)
    }));
    setSelectedContentId(null);
    setShowControls(false);
  };
  
  // Handle save
  const handleSave = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    
    try {
      const success = await onSave(boardData);
      
      if (success) {
        setToast({
          visible: true,
          message: 'Vision board saved successfully!',
          type: 'success'
        });
      } else {
        setToast({
          visible: true,
          message: 'Failed to save vision board',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error saving vision board:', error);
      setToast({
        visible: true,
        message: 'An error occurred while saving',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle share function - only defined if onShare prop is provided
  const shareHandler = onShare 
    ? () => onShare(boardData) 
    : undefined;
  
  // Handle theme change
  const handleThemeChange = (themeId: string) => {
    setBoardData(prev => ({
      ...prev,
      themeId
    }));
    setShowThemeSelector(false);
  };
  
  // Handle adding content
  const handleAddContent = (type: VisionBoardContentType, contentData?: Record<string, unknown>) => {
    const newPosition: Position = {
      x: Math.random() * (canvasSize.width - 200) || 50,
      y: Math.random() * (canvasSize.height - 200) || 50
    };
    
    let newContent: VisionBoardContent = {
      id: uuidv4(),
      type,
      position: newPosition,
      size: { 
        width: type === VisionBoardContentType.TEXT ? 300 : 200, 
        height: type === VisionBoardContentType.TEXT ? 100 : 200 
      },
      rotation: 0,
      categoryId: selectedCategoryId || undefined
    };
    
    // Set default properties based on type
    switch (type) {
      case VisionBoardContentType.TEXT:
        newContent = {
          ...newContent,
          text: 'Click to edit this text',
          fontSize: 16,
          fontColor: '#000000',
          fontFamily: 'Arial, sans-serif',
          textAlign: 'center',
          fontWeight: 'normal'
        };
        break;
        
      case VisionBoardContentType.IMAGE:
        newContent = {
          ...newContent,
          src: contentData?.src as string || 'https://via.placeholder.com/200',
          alt: contentData?.alt as string || 'Vision board image'
        };
        break;
        
      case VisionBoardContentType.AI_GENERATED:
        newContent = {
          ...newContent,
          src: contentData?.src as string || 'https://via.placeholder.com/200',
          alt: contentData?.alt as string || 'AI generated image',
          prompt: contentData?.prompt as string || 'AI generated image'
        };
        break;
        
      case VisionBoardContentType.AUDIO:
        newContent = {
          ...newContent,
          audioUrl: contentData?.audioUrl as string || '',
          transcription: contentData?.transcription as string || 'Voice note'
        };
        break;
    }
    
    setBoardData(prev => ({
      ...prev,
      content: [...prev.content, newContent]
    }));
    
    // Select the newly added content
    setSelectedContentId(newContent.id);
    setShowControls(true);
  };
  
  // Handle canvas click (deselect content)
  const handleCanvasClick = (e: React.MouseEvent) => {
    // Don't deselect if clicking on a content item, controls, or toolbar
    if ((e.target as HTMLElement).closest(`.${styles.contentItem}`) || 
        (e.target as HTMLElement).closest(`.${styles.contentControls}`) ||
        (e.target as HTMLElement).closest(`.${styles.toolbar}`) ||
        (e.target as HTMLElement).closest(`.${styles.toolbarContainer}`)) {
      return;
    }
    
    setSelectedContentId(null);
    setShowControls(false);
  };
  
  // Handle filter by category
  const handleFilterByCategory = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
  };
  
  // Handle real image upload
  const handleImageUpload = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target && typeof event.target.result === 'string') {
            handleAddContent(VisionBoardContentType.IMAGE, { 
              src: event.target.result,
              alt: target.files ? target.files[0].name : 'Uploaded image'
            });
          }
        };
        reader.readAsDataURL(target.files[0]);
      }
    };
    fileInput.click();
  };
  
  // Handle audio recording
  const handleRecordAudio = () => {
    // Basic check for audio recording support
    if (navigator.mediaDevices && 'getUserMedia' in navigator.mediaDevices) {
      // Since full implementation is complex, we'll show a notification for now
      setToast({
        visible: true,
        message: 'Audio recording feature coming soon!',
        type: 'info'
      });
    } else {
      setToast({
        visible: true,
        message: 'Audio recording is not supported in your browser',
        type: 'error'
      });
    }
  };
  
  // Handle AI image generation
  const handleGenerateAIImage = () => {
    // Show dialog to enter prompt
    const prompt = window.prompt('Enter a prompt for AI image generation:', 'A beautiful sunset');
    if (prompt) {
      // For now, we'll just add a placeholder image with the prompt
      handleAddContent(VisionBoardContentType.AI_GENERATED, { 
        src: 'https://via.placeholder.com/200?text=AI+Generated',
        prompt: prompt
      });
      
      setToast({
        visible: true,
        message: 'Real AI image generation coming soon!',
        type: 'info'
      });
    }
  };
  
  // Handle auto arrange
  const handleAutoArrange = () => {
    // Place items in a grid
    const itemWidth = 220;
    const itemHeight = 220;
    const columns = Math.floor(canvasSize.width / itemWidth) || 3;
    const gutter = 20;
    
    const arrangedContent = boardData.content.map((item, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;
      
      return {
        ...item,
        position: {
          x: col * (itemWidth + gutter),
          y: row * (itemHeight + gutter)
        }
      };
    });
    
    setBoardData(prev => ({
      ...prev,
      content: arrangedContent
    }));
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className={`${styles.visionBoardContainer} ${className}`}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading your vision board...</p>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className={`${styles.visionBoardContainer} ${className}`}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button className={styles.retryButton} onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={`${styles.visionBoardContainer} ${className}`}
      style={{ fontFamily: activeTheme.fontFamily }}
    >
      {/* Background layers - apply to canvas area only */}
      <div 
        className={styles.backgroundLayer}
        style={{ 
          background: activeTheme.backgroundGradient,
          opacity: 0.8,
          height: 'calc(100% - 60px)' // Subtract toolbar height
        }}
      ></div>
      
      {/* Canvas container */}
      <div 
        className={styles.canvasContainer}
        onClick={handleCanvasClick}
      >
        {/* Content items */}
        {filteredContent.map(item => (
          <ContentItem
            key={item.id}
            content={item}
            isSelected={item.id === selectedContentId}
            onSelect={handleSelectContent}
            onUpdate={handleUpdateContent}
            readOnly={readOnly}
          />
        ))}
        
        {/* Content controls */}
        {showControls && selectedContent && !readOnly && (
          <ContentControls
            selectedContent={selectedContent}
            onUpdate={handleUpdateContent}
            onDelete={handleDeleteContent}
          />
        )}
      </div>
      
      {/* Toolbar container - separate from canvas */}
      <div 
        className={styles.toolbarContainer} 
        onClick={(e) => e.stopPropagation()}
      >
        {!readOnly && (
          <Toolbar
            mode={toolbarMode}
            onModeChange={setToolbarMode}
            onAddImage={handleImageUpload}
            onAddText={() => handleAddContent(VisionBoardContentType.TEXT)}
            onGenerateAI={handleGenerateAIImage}
            onAddAudio={handleRecordAudio}
            onAutoArrange={handleAutoArrange}
            onToggleThemes={() => setShowThemeSelector(true)}
            onSave={handleSave}
            onShare={shareHandler}
            onFilterByCategory={handleFilterByCategory}
            categories={lifeWheelCategories}
            selectedCategoryId={selectedCategoryId}
            isSaving={isSaving}
          />
        )}
      </div>
      
      {/* Theme selector */}
      <ThemeSelector
        currentThemeId={boardData.themeId}
        onThemeChange={handleThemeChange}
        visible={showThemeSelector}
        onClose={() => setShowThemeSelector(false)}
      />
      
      {/* Intro screen */}
      {firstVisit && !readOnly && (
        <IntroScreen onClose={() => setFirstVisit(false)} />
      )}
      
      {/* Toast notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />
    </div>
  );
};