import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  VisionBoardProps, 
  VisionBoardData, 
  VisionBoardContentType,
  VisionBoardContent,
  Position,
  ToolbarMode
} from './types';
import { ContentItem } from './components/ContentItem';
import { ContentControls } from './components/ContentControls';
import { Toolbar } from './components/Toolbar';
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
  const canvasRef = useRef<HTMLDivElement>(null);
  const [animating, setAnimating] = useState(false);
  
  // Board data state
  const [boardData, setBoardData] = useState<VisionBoardData>({
    title: 'My Dream Board',
    description: 'Visualize • Believe • Achieve',
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
        description: 'Visualize • Believe • Achieve',
        themeId: 'light',
        categories: lifeWheelCategories.map(cat => cat.id),
        content: []
      });
    }
  }, [data, lifeWheelCategories]);
  
  // Update canvas size on window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        setCanvasSize({
          width: canvasRef.current.clientWidth,
          height: canvasRef.current.clientHeight
        });
        // Trigger animation on resize
        startAnimation();
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
  
  // Handle animation on scroll
  useEffect(() => {
    const handleScroll = () => {
      startAnimation();
    };

    // Initial animation
    startAnimation();
    
    const canvasElement = canvasRef.current;
    if (canvasElement) {
      canvasElement.addEventListener('scroll', handleScroll);
    }
    
    document.addEventListener('scroll', handleScroll);
    
    return () => {
      if (canvasElement) {
        canvasElement.removeEventListener('scroll', handleScroll);
      }
      document.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Trigger animation
  const startAnimation = () => {
    if (canvasRef.current && !animating) {
      setAnimating(true);
      canvasRef.current.classList.add(styles.animate);
      
      setTimeout(() => {
        if (canvasRef.current) {
          canvasRef.current.classList.remove(styles.animate);
          setAnimating(false);
        }
      }, 10000); // Animation duration from the original CodePen
    }
  };
  
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
    // Calculate safe placement area, avoiding the right side where the content panel appears
    const CONTENT_PANEL_WIDTH = 350; // Width of the edit panel plus some margin
    const CONTENT_ITEM_WIDTH = type === VisionBoardContentType.TEXT ? 300 : 200;
    const CONTENT_ITEM_HEIGHT = type === VisionBoardContentType.TEXT ? 100 : 200;
    
    // Calculate safe area width, ensuring items don't spawn behind the panel
    const safeAreaWidth = Math.max(200, canvasSize.width - CONTENT_PANEL_WIDTH);
    
    // Calculate random position within safe area
    const newPosition: Position = {
      x: Math.floor(Math.random() * (safeAreaWidth - CONTENT_ITEM_WIDTH)) || 50,
      y: Math.floor(Math.random() * (canvasSize.height - CONTENT_ITEM_HEIGHT - 100)) || 50
    };
    
    let newContent: VisionBoardContent = {
      id: uuidv4(),
      type,
      position: newPosition,
      size: { 
        width: CONTENT_ITEM_WIDTH, 
        height: CONTENT_ITEM_HEIGHT 
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
    
    // Trigger animation when adding new content
    startAnimation();
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
    
    // Trigger animation when filtering
    startAnimation();
  };
  
  // Handle image upload
  const handleImageUpload = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const file = target.files[0];
        
        // Check file size - if too large, compress or warn
        if (file.size > 5000000) { // 5MB
          setToast({
            visible: true,
            message: 'Large images may impact performance. Compressing...',
            type: 'info'
          });
        }
        
        try {
          const reader = new FileReader();
          
          reader.onload = (event) => {
            if (event.target && typeof event.target.result === 'string') {
              // Create a blob URL from the data URL for better memory management
              const img = new Image();
              img.onload = () => {
                // Create a canvas to potentially resize the image
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1200; // Max width for the image
                const MAX_HEIGHT = 1200; // Max height for the image
                let width = img.width;
                let height = img.height;
                
                // Resize if needed
                if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                  if (width > height) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                  } else {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                  }
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                
                if (ctx) {
                  ctx.drawImage(img, 0, 0, width, height);
                  // Get the compressed data URL
                  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                  
                  // Add to vision board
                  handleAddContent(VisionBoardContentType.IMAGE, { 
                    src: dataUrl,
                    alt: file.name || 'Uploaded image',
                    caption: '' // Empty caption by default
                  });
                } else {
                  // Fallback if canvas context fails
                  handleAddContent(VisionBoardContentType.IMAGE, { 
                    src: event.target?.result as string || '',
                    alt: file.name || 'Uploaded image',
                    caption: '' // Empty caption by default
                  });
                }
              };
              
              img.onerror = () => {
                // Fallback for image load error
                setToast({
                  visible: true,
                  message: 'Error processing image. Using original file.',
                  type: 'warning'
                });
                
                handleAddContent(VisionBoardContentType.IMAGE, { 
                  src: event.target?.result as string || '',
                  alt: file.name || 'Uploaded image',
                  caption: '' // Empty caption by default
                });
              };
              
              // Start loading the image
              img.src = event.target.result;
            }
          };
          
          reader.onerror = () => {
            setToast({
              visible: true,
              message: 'Error reading file',
              type: 'error'
            });
          };
          
          reader.readAsDataURL(file);
        } catch (error) {
          console.error('Error processing image:', error);
          setToast({
            visible: true,
            message: 'Error processing image',
            type: 'error'
          });
        }
      }
    };
    fileInput.click();
  };
  
  // Handle AI image generation
  const handleGenerateAIImage = () => {
    // Show dialog to enter prompt
    const prompt = window.prompt('Enter a prompt for AI image generation:', 'A beautiful sunset');
    if (prompt) {
      try {
        // For now, we'll just add a placeholder image with the prompt
        const placeholderUrl = `https://via.placeholder.com/200?text=${encodeURIComponent(prompt.slice(0, 20))}`;
        
        // Create an image element to ensure it loads
        const img = new Image();
        img.onload = () => {
          handleAddContent(VisionBoardContentType.AI_GENERATED, { 
            src: placeholderUrl,
            prompt: prompt,
            caption: '', // Empty caption by default
            alt: 'AI generated image: ' + prompt
          });
          
          setToast({
            visible: true,
            message: 'Real AI image generation coming soon!',
            type: 'info'
          });
        };
        
        img.onerror = () => {
          // Fallback for image load error
          setToast({
            visible: true,
            message: 'Error creating AI image. Using default placeholder.',
            type: 'warning'
          });
          
          handleAddContent(VisionBoardContentType.AI_GENERATED, { 
            src: 'https://via.placeholder.com/200?text=AI+Generated',
            prompt: prompt,
            caption: '', // Empty caption by default
            alt: 'AI generated image: ' + prompt
          });
        };
        
        // Start loading the image
        img.src = placeholderUrl;
      } catch (error) {
        console.error('Error generating AI image:', error);
        setToast({
          visible: true,
          message: 'Error generating AI image',
          type: 'error'
        });
      }
    }
  };
  
  // Handle auto arrange
  const handleAutoArrange = () => {
    // Define safe area parameters
    const CONTENT_PANEL_WIDTH = 350; // Width of the edit panel plus some margin
    const safeAreaWidth = Math.max(300, canvasSize.width - CONTENT_PANEL_WIDTH);
    
    // Place items in a grid pattern like in the reference design
    const itemWidth = 220;
    const itemHeight = 220;
    const columns = Math.floor(safeAreaWidth / (itemWidth + 20)) || 2; // Ensure at least 2 columns
    const gutter = 20;
    
    const arrangedContent = boardData.content.map((item, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;
      
      // Ensure items stay within safe area (away from the right edge)
      const x = Math.min(col * (itemWidth + gutter), safeAreaWidth - itemWidth);
      
      return {
        ...item,
        position: {
          x,
          y: row * (itemHeight + gutter) + 50 // Add some top margin
        }
      };
    });
    
    setBoardData(prev => ({
      ...prev,
      content: arrangedContent
    }));
    
    // Trigger animation after arranging
    startAnimation();
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
      {/* Background layers - apply to entire board */}
      <div 
        className={styles.backgroundLayer}
        style={{ 
          background: `url('https://images.unsplash.com/photo-1531685250784-7569952593d2?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2OTMyOTE2OTh8&ixlib=rb-4.0.3&q=100&w=3000')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.9,
          height: '100%' // Cover entire container
        }}
      ></div>
      
      {/* Vision Board Title */}
      <div className={styles.visionBoardHeader}>
        <h1 className={styles.visionBoardTitle}>{boardData.title || 'Vision Board'}</h1>
        {boardData.description && (
          <p className={styles.visionBoardSubtitle}>{boardData.description}</p>
        )}
      </div>
      
      {/* Canvas container */}
      <div 
        ref={canvasRef}
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
      </div>
      
      {/* Content controls - floating sidebar */}
      {showControls && selectedContent && !readOnly && (
        <ContentControls
          selectedContent={selectedContent}
          onUpdate={handleUpdateContent}
          onDelete={handleDeleteContent}
          onClose={() => {
            setSelectedContentId(null);
            setShowControls(false);
          }}
        />
      )}
      
      {/* Toolbar container - floating at bottom */}
      <div className={styles.toolbarContainer}>
        {!readOnly && (
          <Toolbar
            mode={toolbarMode}
            onModeChange={setToolbarMode}
            onAddImage={handleImageUpload}
            onGenerateAI={handleGenerateAIImage}
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