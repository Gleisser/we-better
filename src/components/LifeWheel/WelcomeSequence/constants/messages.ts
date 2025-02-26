import { WelcomeMessage } from '../types';

export const WELCOME_SEQUENCE: WelcomeMessage[] = [
  {
    id: 'welcome',
    text: 'Welcome {name}!',
    duration: 2500,
    animation: 'fadeUp',
  },
  {
    id: 'purpose',
    text: 'The Life Wheel helps you visualize balance in your life',
    duration: 3000,
    animation: 'fadeIn',
    highlightWords: ['Life Wheel', 'balance'],
  },
  {
    id: 'assessment',
    text: 'You\'ll rate 8 key areas of your life from 1-10',
    duration: 3000,
    animation: 'fadeIn',
    highlightWords: ['8 key areas', '1-10'],
  },
  {
    id: 'insights',
    text: 'This creates a visual map showing where to focus your energy',
    duration: 3000,
    animation: 'fadeIn',
    highlightWords: ['visual map', 'focus'],
  },
  {
    id: 'personalized',
    text: 'Your results help us personalize your experience',
    duration: 3000,
    animation: 'fadeIn',
    highlightWords: ['personalize'],
  },
  {
    id: 'ready',
    text: 'Ready to bring more balance to your life?',
    duration: 3000,
    animation: 'fadeUp',
    highlightWords: ['Ready', 'balance'],
  },
]; 