import { LifeCategory } from "@/components/LifeWheel/types";

// Content types
export enum VisionBoardContentType {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  AI_GENERATED = 'ai_generated'
}

// Text alignment options
export enum TextAlign {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right'
}

// Font weight options
export enum FontWeight {
  NORMAL = 'normal',
  BOLD = 'bold'
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

// Goal details interface
export interface GoalDetails {
  title: string;
  description: string;
  dueDate?: Date | null;
  progress: number;
}

// Board Content interface
export interface VisionBoardContent {
  id: string;
  type: VisionBoardContentType;
  position: Position;
  size: Size;
  rotation: number;
  categoryId?: string;
  isGoal?: boolean;
  goalDetails?: GoalDetails;
  
  // Text specific properties
  text?: string;
  fontColor?: string;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: string;
  fontWeight?: string;
  
  // Image specific properties
  src?: string;
  alt?: string;
  caption?: string;
  
  // AI specific properties
  prompt?: string;
  
  // Audio specific properties
  audioUrl?: string;
  transcription?: string;
}

// Vision Board Data interface
export interface VisionBoardData {
  id?: string;
  title: string;
  description?: string;
  themeId: string;
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
  THEME = 'theme',
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

// Theme for vision board
export interface VisionBoardTheme {
  id: string;
  name: string;
  backgroundGradient: string;
  backgroundPattern?: string;
  fontFamily: string;
  accentColor: string;
  isDark: boolean;
} 