import { LifeCategory } from "@/components/LifeWheel/types";

// Content types
export enum VisionBoardContentType {
  IMAGE = 'image',
  AI_GENERATED = 'ai_generated'
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
export interface VisionBoardContent {
  id: string;
  type: VisionBoardContentType;
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
// Vision Board Data interface
export interface VisionBoardData {
  id?: string;
  title: string;
  description?: string;
  categories: string[];
  content: VisionBoardContent[];
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
}

// Toolbar modes
export enum ToolbarMode {
  ADD = 'add',
  FILTER = 'filter',
  ARRANGE = 'arrange'
}

// Vision Board Props
export interface VisionBoardProps {
  lifeWheelCategories: LifeCategory[];
  data?: VisionBoardData;
  loading?: boolean;
  error?: string;
  onSave: (data: VisionBoardData) => Promise<boolean>;
  onShare?: (data: VisionBoardData) => void;
  className?: string;
  readOnly?: boolean;
} 