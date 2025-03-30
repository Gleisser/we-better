import { v4 as uuidv4 } from 'uuid';
import { 
  VisionBoardContent, 
  VisionBoardContentType,
  VisionBoardData,
} from '../types';
import { LifeCategory } from '../../LifeWheel/types';

/**
 * Creates a new Vision Board with default content based on Life Wheel categories
 */
export const createNewVisionBoard = (
  userId: string,
  lifeWheelCategories: LifeCategory[]
): VisionBoardData => {
  const sortedCategories = [...lifeWheelCategories].sort((a, b) => a.value - b.value);
  const now = new Date();
  
  // Create default content (one text item per category)
  const content: VisionBoardContent[] = sortedCategories.map((category, index) => {
    const gridSize = Math.ceil(Math.sqrt(sortedCategories.length));
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    
    // Calculate position based on grid layout
    const x = 100 + (col * 300);
    const y = 100 + (row * 300);
    
    return createTextContent(
      category.id,
      `My ${category.name} Goals`,
      {
        x,
        y,
        z: 0
      },
      {
        width: 250,
        height: 100
      }
    );
  });
  
  return {
    id: uuidv4(),
    userId,
    title: 'My Vision Board',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    categories: lifeWheelCategories.map(category => category.id),
    content,
    themeId: DEFAULT_VISION_BOARD_THEME_ID
  };
};

/**
 * Creates a new image content item
 */
export const createImageContent = (
  categoryId: string,
  src: string,
  alt: string,
  position: { x: number; y: number; z: number },
  size: { width: number; height: number },
  isGoal: boolean = false
): VisionBoardImageContent => {
  const now = new Date();
  
  return {
    id: uuidv4(),
    type: VisionBoardContentType.IMAGE,
    categoryId,
    src,
    alt,
    position,
    size,
    rotation: 0,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    isGoal,
    goalDetails: isGoal ? {
      title: alt,
      description: alt,
      progress: 0
    } : undefined
  };
};

/**
 * Creates a new text content item
 */
export const createTextContent = (
  categoryId: string,
  text: string,
  position: { x: number; y: number; z: number },
  size: { width: number; height: number },
  fontSize: number = 24,
  fontColor: string = '#000000'
): VisionBoardTextContent => {
  const now = new Date();
  
  return {
    id: uuidv4(),
    type: VisionBoardContentType.TEXT,
    categoryId,
    text,
    fontSize,
    fontFamily: 'Inter, sans-serif',
    fontColor,
    textAlign: 'center',
    fontWeight: 'bold',
    position,
    size,
    rotation: 0,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };
};

/**
 * Creates a new AI-generated content item
 */
export const createAIGeneratedContent = (
  categoryId: string,
  prompt: string,
  src: string,
  alt: string,
  position: { x: number; y: number; z: number },
  size: { width: number; height: number }
): VisionBoardAIGeneratedContent => {
  const now = new Date();
  
  return {
    id: uuidv4(),
    type: VisionBoardContentType.AI_GENERATED,
    categoryId,
    prompt,
    src,
    alt,
    position,
    size,
    rotation: 0,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };
};

/**
 * Creates a new audio content item
 */
export const createAudioContent = (
  categoryId: string,
  audioUrl: string,
  duration: number,
  transcription: string,
  position: { x: number; y: number; z: number },
  size: { width: number; height: number }
): VisionBoardAudioContent => {
  const now = new Date();
  
  return {
    id: uuidv4(),
    type: VisionBoardContentType.AUDIO,
    categoryId,
    audioUrl,
    duration,
    transcription,
    position,
    size,
    rotation: 0,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };
};

/**
 * Gets theme by ID
 */
export const getThemeById = (themeId: string) => {
  return themes.find(theme => theme.id === themeId) || 
    themes.find(theme => theme.id === DEFAULT_VISION_BOARD_THEME_ID)!;
};

/**
 * Calculate suggested layout positions based on content
 * This is a simple grid layout - a more advanced algorithm could be implemented
 */
export const calculateSuggestedLayout = (
  content: VisionBoardContent[],
  canvasWidth: number,
  canvasHeight: number
): VisionBoardContent[] => {
  const itemsPerRow = Math.ceil(Math.sqrt(content.length));
  const itemWidth = Math.min(300, canvasWidth / itemsPerRow - 40);
  const itemHeight = Math.min(300, canvasHeight / itemsPerRow - 40);
  
  return content.map((item, index) => {
    const row = Math.floor(index / itemsPerRow);
    const col = index % itemsPerRow;
    
    const x = 20 + col * (itemWidth + 40) + itemWidth / 2;
    const y = 20 + row * (itemHeight + 40) + itemHeight / 2;
    
    return {
      ...item,
      position: {
        ...item.position,
        x,
        y
      },
      size: {
        width: itemWidth,
        height: itemHeight
      }
    };
  });
};

/**
 * Filter content by category
 */
export const filterContentByCategory = (
  content: VisionBoardContent[],
  categoryId: string | null
): VisionBoardContent[] => {
  if (!categoryId) return content;
  return content.filter(item => item.categoryId === categoryId);
}; 