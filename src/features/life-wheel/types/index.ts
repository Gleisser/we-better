export interface LifeCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  value: number; // Current value (1-10)
}

export interface LifeWheelData {
  categories: LifeCategory[];
  lastUpdated?: Date;
}

export interface RadarChartProps {
  data: LifeCategory[];
  size?: number;
  className?: string;
  animate?: boolean;
  onCategoryClick?: (category: LifeCategory) => void;
}

export interface LifeWheelProps {
  data?: LifeWheelData;
  isLoading?: boolean;
  error?: Error | null;
  onCategoryUpdate?: (categoryId: string, newValue: number) => void;
  onComplete?: () => void;
  className?: string;
  readOnly?: boolean;
}

export type CategoryUpdateFunction = (categoryId: string, newValue: number) => void; 