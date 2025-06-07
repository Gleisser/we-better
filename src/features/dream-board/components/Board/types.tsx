import { LifeCategory } from '@/features/life-wheel/types';

// Content types
export enum DreamBoardContentType {
  IMAGE = 'image',
}

// Position interface
export interface Position {
  x: number;
  y: number;
}

// Size interface
export interface Size {
  width: number;
  height: number;
}

// Board Content interface
export interface DreamBoardContent {
  id: string;
  type: DreamBoardContentType;
  position: Position;
  size: Size;
  rotation: number;
  categoryId?: string;

  // Image specific properties
  src?: string;
  alt?: string;
  caption?: string;

  // AI specific properties
  prompt?: string;
}
// Dream Board Data interface
export interface DreamBoardData {
  id?: string;
  title: string;
  description?: string;
  categories: string[];
  content: DreamBoardContent[];
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
}

// Toolbar modes
export enum ToolbarMode {
  ADD = 'add',
  FILTER = 'filter',
  ARRANGE = 'arrange',
}

// Dream Board Props
export interface DreamBoardProps {
  lifeWheelCategories: LifeCategory[];
  data?: DreamBoardData;
  loading?: boolean;
  error?: string;
  onSave: (data: DreamBoardData) => Promise<boolean>;
  onShare?: (data: DreamBoardData) => void;
  onDelete?: () => void;
  className?: string;
  readOnly?: boolean;
}
