import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import { IntroScreen } from './components/IntroScreen';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
  const [showIntro, setShowIntro] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [toolbarMode, setToolbarMode] = useState<ToolbarMode>(ToolbarMode.ADD);
  
  // Create a mapping of category IDs to their colors for easier access
  const categoryColors = lifeWheelCategories.reduce((map, category) => {
    map[category.id] = category.color;
    return map;
  }, {} as Record<string, string>);
  
  // Initialize board data
  useEffect(() => {
    if (data) {
      setBoardData(data);
    } else {
      setBoardData({
        title: 'My Dream Board',
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
  
  // Filter content based on selected category
  const filteredContent = useMemo(() => {
    if (!selectedCategoryId) {
      return boardData.content;
    }
    return boardData.content.filter(item => 
      item.categoryId === selectedCategoryId
    );
  }, [boardData.content, selectedCategoryId]);
  
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
        toast.success('Vision board saved successfully!');
      } else {
        toast.error('Failed to save vision board');
      }
    } catch (error) {
      console.error('Error saving vision board:', error);
      toast.error('An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle share function - only defined if onShare prop is provided
  const shareHandler = onShare 
    ? () => onShare(boardData) 
    : undefined;
  
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
  };
  
  // Modify the handleImageUpload function to use correct handleAddContent call
  const handleImageUpload = () => {
    // Count the number of image and AI-generated content items
    const imageCount = boardData.content.filter(item => 
      item.type === VisionBoardContentType.IMAGE || 
      item.type === VisionBoardContentType.AI_GENERATED
    ).length;
    
    // Check if the limit has been reached
    if (imageCount >= 7) {
      toast.warning('You can only add up to 7 images to your vision board.');
      return;
    }
    
    // Rest of the existing upload logic
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e) => {
      if (e.target && (e.target as HTMLInputElement).files && (e.target as HTMLInputElement).files?.length) {
        const file = (e.target as HTMLInputElement).files![0];
        const reader = new FileReader();
        
        reader.onload = (event) => {
          if (event.target?.result) {
            // Use handleAddContent correctly with type first, then content details
            handleAddContent(VisionBoardContentType.IMAGE, { 
              src: event.target.result as string,
              alt: file.name,
              caption: ''
            });
          }
        };
        
        reader.readAsDataURL(file);
      }
    };
    
    fileInput.click();
  };
  
  // Handle AI image generation
  const handleGenerateAIImage = () => {
    toast.info('AI image generation is coming soon! Stay tuned for updates.');
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
  
  const handleDreamSymbolClick = (symbolType: string) => {
    const messages: Record<string, string> = {
      briefcase: "Your career is a path to greatness. Keep striving for excellence!",
      money: "Financial abundance is flowing into your life. Embrace wealth mindfully!",
      health: "Health is true wealth. Nurture your body, mind, and spirit daily.",
      house: "Your ideal home awaits. Create your perfect sanctuary and living space.",
      growth: "Growth happens outside your comfort zone. Embrace change and challenges!",
      heart: "Love deeply and authentically. Meaningful connections bring true joy.",
      recreation: "Balance work with play. Leisure time recharges your creative energy!",
      meditation: "Inner peace creates outer harmony. Take time for spiritual reflection.",
      graduation: "Knowledge empowers. Continue learning throughout your entire life.",
      travel: "Adventure awaits! New places bring fresh perspectives and memories.",
      cloud: "Dream without limits. Your imagination creates your future reality!",
      trophy: "Success is a journey of small wins. Celebrate each victory along the way!"
    };

    toast.info(messages[symbolType] || "Dream it, believe it, achieve it!");
  };
  
  // Inside the VisionBoard component, add a useMemo to calculate the image count
  const imageCount = useMemo(() => {
    return boardData.content.filter(item => 
      item.type === VisionBoardContentType.IMAGE || 
      item.type === VisionBoardContentType.AI_GENERATED
    ).length;
  }, [boardData.content]);
  
  // Render loading state
  if (loading) {
    return (
      <div className={`${styles.fullScreenContainer} ${className}`}>
        <div className={styles.backgroundImage} />
        <div className={styles.contentWrapper}>
          <div className={styles.glassCard}>
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Loading your vision board...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className={`${styles.fullScreenContainer} ${className}`}>
        <div className={styles.backgroundImage} />
        <div className={styles.contentWrapper}>
          <div className={styles.glassCard}>
            <div className={styles.errorContainer}>
              <div className={styles.errorIcon}>⚠️</div>
              <h3>Something went wrong</h3>
              <p>{error}</p>
              <button className={styles.retryButton} onClick={() => window.location.reload()}>
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`${styles.fullScreenContainer} ${className}`}>
      {/* Background image - using the same as login page */}
      <div className={styles.backgroundImage} />
      
      {/* Main content container */}
      <div className={styles.contentWrapper}>
        <div className={styles.glassCard}>
          {/* Vision Board Title */}
          <h1 className={styles.visionBoardTitle}>{boardData.title || 'Vision Board'}</h1>
          {boardData.description && (
            <p className={styles.visionBoardSubtitle}>{boardData.description}</p>
          )}
          
          {/* Floating 3D Dream Symbols */}
          <div className={styles.dreamSymbols}>
            <div 
              className={`${styles.dreamSymbol} ${styles.briefcase}`} 
              onClick={() => handleDreamSymbolClick('briefcase')}
            ></div>
            <div 
              className={`${styles.dreamSymbol} ${styles.money}`} 
              onClick={() => handleDreamSymbolClick('money')}
            ></div>
            <div 
              className={`${styles.dreamSymbol} ${styles.health}`} 
              onClick={() => handleDreamSymbolClick('health')}
            ></div>
            <div 
              className={`${styles.dreamSymbol} ${styles.house}`} 
              onClick={() => handleDreamSymbolClick('house')}
            ></div>
            <div 
              className={`${styles.dreamSymbol} ${styles.growth}`} 
              onClick={() => handleDreamSymbolClick('growth')}
            ></div>
            <div 
              className={`${styles.dreamSymbol} ${styles.heart}`} 
              onClick={() => handleDreamSymbolClick('heart')}
            ></div>
            <div 
              className={`${styles.dreamSymbol} ${styles.recreation}`} 
              onClick={() => handleDreamSymbolClick('recreation')}
            ></div>
            <div 
              className={`${styles.dreamSymbol} ${styles.meditation}`} 
              onClick={() => handleDreamSymbolClick('meditation')}
            ></div>
            <div 
              className={`${styles.dreamSymbol} ${styles.graduation}`} 
              onClick={() => handleDreamSymbolClick('graduation')}
            ></div>
            <div 
              className={`${styles.dreamSymbol} ${styles.travel}`} 
              onClick={() => handleDreamSymbolClick('travel')}
            ></div>
            <div 
              className={`${styles.dreamSymbol} ${styles.cloud}`} 
              onClick={() => handleDreamSymbolClick('cloud')}
            ></div>
            <div 
              className={`${styles.dreamSymbol} ${styles.trophy}`} 
              onClick={() => handleDreamSymbolClick('trophy')}
            ></div>
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
                categoryColors={categoryColors}
              />
            ))}
          </div>
          
          {/* Toolbar container - at the bottom */}
          <div className={styles.actionButtons}>
            {!readOnly && (
              <Toolbar
                mode={toolbarMode}
                onModeChange={setToolbarMode}
                onAddImage={handleImageUpload}
                onGenerateAI={handleGenerateAIImage}
                onAutoArrange={handleAutoArrange}
                onSave={handleSave}
                onShare={shareHandler}
                onFilterByCategory={handleFilterByCategory}
                categories={lifeWheelCategories}
                selectedCategoryId={selectedCategoryId}
                isSaving={isSaving}
                imageCount={imageCount}
              />
            )}
          </div>
          
          {/* Attribution footer */}
          <div className={styles.attributionFooter}>
            <a href="https://icons8.com" target="_blank" rel="noopener noreferrer">3D icons by Icons8</a>
          </div>
        </div>
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
          lifeWheelCategories={lifeWheelCategories}
        />
      )}
      
      {/* Intro screen */}
      {showIntro && !readOnly && (
        <IntroScreen onClose={() => setShowIntro(false)} />
      )}
      
      {/* Toast notifications */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};