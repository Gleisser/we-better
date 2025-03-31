export interface WelcomeMessage {
  id: string;
  text: string;
  duration: number;
  animation: 'fadeUp' | 'fadeIn' | 'slideIn';
  highlightWords?: string[];
  visualStage?: 'intro' | 'platform-1' | 'platform-2' | 'wheel-intro-1' | 'wheel-intro-2' | 'segments-1' | 'segments-2' | 'completion' | 'benefits-1' | 'benefits-2' | 'benefits-3' | 'benefits-4' | 'finale';
}

export interface UserProfileData {
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  ageRange?: 'under-18' | '18-24' | '25-34' | '35-44' | '45-54' | '55-64' | '65+';
  interests?: string[];
  primaryGoal?: string;
  sleepQuality?: 'poor' | 'fair' | 'good' | 'excellent';
  stressLevel?: 'low' | 'moderate' | 'high' | 'severe';
}

export interface UserProfileFormProps {
  onSubmit: (data: UserProfileData) => void;
  onCancel?: () => void;
  initialData?: Partial<UserProfileData>;
}

export interface WelcomeSequenceProps {
  onComplete: (profileData?: UserProfileData) => void;
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