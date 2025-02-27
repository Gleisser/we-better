export interface WelcomeMessage {
  id: string;
  text: string;
  duration: number;
  animation: 'fadeUp' | 'fadeIn' | 'slideIn';
  highlightWords?: string[];
  visualStage?: 'intro' | 'platform' | 'wheel-intro' | 'segments' | 'completion' | 'benefits-1' | 'benefits-2' | 'benefits-3' | 'finale';
}

export interface WelcomeSequenceProps {
  onComplete: () => void;
  onSkip: () => void;
  userName?: string;
  isLoading?: boolean;
}

export interface MessageAnimationProps {
  message: WelcomeMessage;
  onComplete: () => void;
  userName?: string;
}

export interface ProgressIndicatorProps {
  total: number;
  current: number;
}

export interface BackgroundAnimationProps {
  intensity?: 'low' | 'medium' | 'high';
} 