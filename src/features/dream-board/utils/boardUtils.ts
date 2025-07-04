import { v4 as uuidv4 } from 'uuid';
import { DreamBoardContent, DreamBoardContentType, DreamBoardData } from '../types';
import { LifeCategory } from '@/features/life-wheel/types';

/**
 * Creates a new Vision Board with default content based on Life Wheel categories
 */
export const createNewVisionBoard = (
  userId: string,
  lifeWheelCategories: LifeCategory[],
  defaultTitle: string = 'My Dream Board'
): DreamBoardData => {
  const sortedCategories = [...lifeWheelCategories].sort((a, b) => a.value - b.value);
  const now = new Date();

  // Create default content (one text item per category)
  const content: DreamBoardContent[] = sortedCategories.map((category, index) => {
    const gridSize = Math.ceil(Math.sqrt(sortedCategories.length));
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;

    // Calculate position based on grid layout
    const x = 100 + col * 300;
    const y = 100 + row * 300;

    return createTextContent(
      category.id,
      `My ${category.name} Goals`,
      {
        x,
        y,
        z: 0,
      },
      {
        width: 250,
        height: 100,
      }
    );
  });

  return {
    id: uuidv4(),
    userId,
    title: defaultTitle,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    categories: lifeWheelCategories.map(category => category.id),
    content,
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
  size: { width: number; height: number }
): DreamBoardContent => {
  return {
    id: uuidv4(),
    type: DreamBoardContentType.IMAGE,
    categoryId,
    src,
    alt,
    position,
    size,
    rotation: 0,
  };
};

/**
 * Creates a new text content item
 */
export const createTextContent = (
  categoryId: string,
  text: string,
  position: { x: number; y: number; z: number },
  size: { width: number; height: number }
): DreamBoardContent => {
  return {
    id: uuidv4(),
    type: DreamBoardContentType.IMAGE,
    categoryId,
    src: 'text',
    alt: text,
    position,
    size,
    rotation: 0,
  };
};

/**
 * Calculate suggested layout positions based on content
 * This is a simple grid layout - a more advanced algorithm could be implemented
 */
export const calculateSuggestedLayout = (
  content: DreamBoardContent[],
  canvasWidth: number,
  canvasHeight: number
): DreamBoardContent[] => {
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
        y,
      },
      size: {
        width: itemWidth,
        height: itemHeight,
      },
    };
  });
};

/**
 * Filter content by category
 */
export const filterContentByCategory = (
  content: DreamBoardContent[],
  categoryId: string | null
): DreamBoardContent[] => {
  if (!categoryId) return content;
  return content.filter(item => item.categoryId === categoryId);
};
