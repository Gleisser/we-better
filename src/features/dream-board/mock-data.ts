import {
  Challenge,
  Dream,
  JournalEntry,
  Resource,
  AI_Insight,
  WeatherStatus,
  NotificationItem,
  DashboardData,
} from './types';

// Mock dreams
export const mockDreams: Dream[] = [
  {
    id: '1',
    title: 'Travel to Japan',
    description: 'Experience the culture, food, and landscapes of Japan',
    category: 'Travel',
    timeframe: 'mid-term',
    progress: 0.3,
    createdAt: '2023-02-15T12:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?ixlib=rb-4.0.3',
    milestones: [
      {
        id: 'm1',
        title: 'Save $3,000',
        completed: true,
        date: '2023-05-10T00:00:00Z',
      },
      {
        id: 'm2',
        title: 'Research top locations',
        completed: true,
        date: '2023-06-20T00:00:00Z',
      },
      {
        id: 'm3',
        title: 'Book flights',
        completed: false,
        date: '2023-09-15T00:00:00Z',
      },
      {
        id: 'm4',
        title: 'Learn basic Japanese phrases',
        completed: false,
        date: '2023-11-01T00:00:00Z',
      },
    ],
    isShared: false,
  },
  {
    id: '2',
    title: 'Learn Piano',
    description: 'Master playing piano at an intermediate level',
    category: 'Skills',
    timeframe: 'short-term',
    progress: 0.7,
    createdAt: '2023-03-10T10:00:00Z',
    milestones: [
      {
        id: 'm5',
        title: 'Find a teacher',
        completed: true,
        date: '2023-03-15T00:00:00Z',
      },
      {
        id: 'm6',
        title: 'Practice 30 min daily for 30 days',
        completed: true,
        date: '2023-04-20T00:00:00Z',
      },
      {
        id: 'm7',
        title: 'Learn first complete song',
        completed: true,
        date: '2023-05-30T00:00:00Z',
      },
      {
        id: 'm8',
        title: 'Perform for friends/family',
        completed: false,
        date: '2023-08-01T00:00:00Z',
      },
    ],
    isShared: true,
    sharedWith: ['user123', 'user456'],
  },
  {
    id: '3',
    title: 'Buy a House',
    description: 'Purchase first home in a nice neighborhood',
    category: 'Finance',
    timeframe: 'long-term',
    progress: 0.1,
    createdAt: '2023-01-05T14:30:00Z',
    milestones: [
      {
        id: 'm9',
        title: 'Save 20% for down payment',
        completed: false,
        date: '2024-06-15T00:00:00Z',
      },
      {
        id: 'm10',
        title: 'Research neighborhoods',
        completed: true,
        date: '2023-04-10T00:00:00Z',
      },
      {
        id: 'm11',
        title: 'Get pre-approved for mortgage',
        completed: false,
        date: '2024-07-01T00:00:00Z',
      },
    ],
    isShared: false,
  },
  {
    id: '4',
    title: 'Run a Marathon',
    description: 'Train and complete a full marathon',
    category: 'Health',
    timeframe: 'mid-term',
    progress: 0.5,
    createdAt: '2023-02-20T09:15:00Z',
    milestones: [
      {
        id: 'm12',
        title: 'Run 5K without stopping',
        completed: true,
        date: '2023-03-15T00:00:00Z',
      },
      {
        id: 'm13',
        title: 'Complete 10K race',
        completed: true,
        date: '2023-05-20T00:00:00Z',
      },
      {
        id: 'm14',
        title: 'Run half marathon',
        completed: false,
        date: '2023-08-10T00:00:00Z',
      },
      {
        id: 'm15',
        title: 'Complete full marathon',
        completed: false,
        date: '2023-11-05T00:00:00Z',
      },
    ],
    isShared: true,
    sharedWith: ['user789'],
    voiceMemo: 'https://example.com/voice-memos/marathon-motivation.mp3',
  },
  {
    id: '5',
    title: 'Start a Successful Business',
    description: 'Launch and grow a profitable online business',
    category: 'Career',
    timeframe: 'long-term',
    progress: 0.2,
    createdAt: '2022-11-10T11:00:00Z',
    milestones: [
      {
        id: 'm16',
        title: 'Validate business idea',
        completed: true,
        date: '2023-01-15T00:00:00Z',
      },
      {
        id: 'm17',
        title: 'Create business plan',
        completed: true,
        date: '2023-03-01T00:00:00Z',
      },
      {
        id: 'm18',
        title: 'Build MVP',
        completed: false,
        date: '2023-07-30T00:00:00Z',
      },
      {
        id: 'm19',
        title: 'Launch and acquire first 10 customers',
        completed: false,
        date: '2023-10-15T00:00:00Z',
      },
    ],
    isShared: false,
  },
  {
    id: '6',
    title: 'Improve Relationship with Family',
    description: 'Spend more quality time with family members',
    category: 'Relationships',
    timeframe: 'short-term',
    progress: 0.4,
    createdAt: '2023-04-01T16:45:00Z',
    milestones: [
      {
        id: 'm20',
        title: 'Weekly family dinner',
        completed: true,
        date: '2023-04-15T00:00:00Z',
      },
      {
        id: 'm21',
        title: 'Plan family vacation',
        completed: false,
        date: '2023-07-10T00:00:00Z',
      },
    ],
    isShared: false,
  },
];

export const mockCategories = [
  'Travel',
  'Skills',
  'Finances',
  'Health',
  'Relationships',
  'Career',
  'Education',
  'Spirituality',
];

// Mock journal entries
export const mockJournalEntries: JournalEntry[] = [
  {
    id: 'j1',
    dreamId: '2',
    content: 'Started taking online piano lessons today. Feeling excited about the journey!',
    date: '2023-03-15T18:30:00Z',
    emotion: 'excited',
  },
  {
    id: 'j2',
    dreamId: '2',
    content: 'Practiced for an hour today. My fingers are sore but I can feel progress happening.',
    date: '2023-04-10T19:15:00Z',
    emotion: 'optimistic',
  },
  {
    id: 'j3',
    dreamId: '4',
    content: 'Completed my first 5K run without stopping! It was tough but so rewarding.',
    date: '2023-03-15T08:45:00Z',
    emotion: 'excited',
  },
  {
    id: 'j4',
    dreamId: '1',
    content: 'Reached my savings goal for Japan! Now I need to start planning the actual trip.',
    date: '2023-05-10T21:00:00Z',
    emotion: 'excited',
  },
];

// Mock resources
export const mockResources: Resource[] = [
  {
    id: 'r1',
    title: 'Marathon Training for Beginners',
    type: 'article',
    link: '/articles/marathon-training-beginners',
    relevantDreamIds: ['4'],
  },
  {
    id: 'r2',
    title: 'Financial Planning for Homebuyers',
    type: 'course',
    link: '/courses/financial-planning-homebuyers',
    relevantDreamIds: ['3'],
  },
  {
    id: 'r3',
    title: 'Learn Piano: Complete Beginner Course',
    type: 'course',
    link: '/courses/piano-beginners',
    relevantDreamIds: ['2'],
  },
  {
    id: 'r4',
    title: 'Japan Travel Guide 2023',
    type: 'article',
    link: '/articles/japan-travel-guide',
    relevantDreamIds: ['1'],
  },
];

// Mock challenges
export const mockChallenges: Challenge[] = [
  {
    id: 'c1',
    title: '30-Day Piano Practice',
    description: 'Practice piano for at least 30 minutes every day for 30 days',
    dreamId: '2',
    duration: 30,
    frequency: 'daily',
    selectedDays: [],
    difficultyLevel: 'medium',
    enableReminders: true,
    reminderTime: '09:00',
    startDate: '2023-06-01T00:00:00Z',
    currentDay: 12,
    completed: false,
  },
  {
    id: 'c2',
    title: '10K Steps Challenge',
    description: 'Walk at least 10,000 steps every day for 21 days',
    dreamId: '4',
    duration: 21,
    frequency: 'daily',
    selectedDays: [],
    difficultyLevel: 'easy',
    enableReminders: false,
    reminderTime: null,
    startDate: '2023-05-15T00:00:00Z',
    currentDay: 21,
    completed: true,
  },
  {
    id: 'c3',
    title: 'Japan Trip Savings',
    description: 'Save $100 every week towards your Japan trip',
    dreamId: '1',
    duration: 20,
    frequency: 'weekly',
    selectedDays: [],
    difficultyLevel: 'medium',
    enableReminders: true,
    reminderTime: '18:00',
    startDate: '2023-07-01T00:00:00Z',
    currentDay: 8,
    completed: false,
  },
  {
    id: 'c4',
    title: 'House Down Payment',
    description: 'Save $500 monthly for house down payment',
    dreamId: '3',
    duration: 24,
    frequency: 'custom',
    selectedDays: [0, 2, 4], // Monday, Wednesday, Friday
    difficultyLevel: 'hard',
    enableReminders: true,
    reminderTime: '20:00',
    startDate: '2023-06-15T00:00:00Z',
    currentDay: 3,
    completed: false,
  },
  {
    id: 'c5',
    title: 'Family Dinner Nights',
    description: 'Have a family dinner at least once a week',
    dreamId: '6',
    duration: 12,
    frequency: 'weekly',
    selectedDays: [],
    difficultyLevel: 'easy',
    enableReminders: true,
    reminderTime: '17:00',
    startDate: '2023-07-05T00:00:00Z',
    currentDay: 4,
    completed: false,
  },
];

// Mock AI insights
export const mockInsights: AI_Insight[] = [
  {
    id: 'i1',
    type: 'pattern',
    title: 'Pattern Analysis',
    description: 'Your dreams show a strong focus on personal growth and new experiences.',
    relatedCategories: ['Skills', 'Travel', 'Health'],
  },
  {
    id: 'i2',
    type: 'balance',
    title: 'Balance Suggestion',
    description:
      'Consider adding more dreams in the Relationships category to achieve better life balance.',
    relatedCategories: ['Relationships'],
  },
  {
    id: 'i3',
    type: 'progress',
    title: 'Progress Insight',
    description: "You're making excellent progress on your Skills goals. Keep up the momentum!",
    relatedCategories: ['Skills'],
  },
];

// Mock weather status
export const mockWeather: WeatherStatus = {
  overall: 'partly-cloudy',
  categoryStatus: {
    Travel: 'sunny',
    Skills: 'sunny',
    Finance: 'cloudy',
    Health: 'partly-cloudy',
    Relationships: 'partly-cloudy',
    Career: 'cloudy',
  },
  message: 'Your dream forecast is looking good! 3 dreams have recent progress.',
};

// Mock notifications
export const mockNotifications: NotificationItem[] = [
  {
    id: 'n1',
    type: 'milestone',
    title: 'Upcoming Milestone',
    description: 'Book flights for Japan trip by next week',
    date: '2023-09-15T00:00:00Z',
    dreamId: '1',
    read: false,
  },
  {
    id: 'n2',
    type: 'challenge',
    title: 'Challenge Update',
    description: "You're on day 12 of your 30-day piano practice challenge!",
    date: '2023-06-12T00:00:00Z',
    dreamId: '2',
    read: true,
  },
  {
    id: 'n3',
    type: 'inspiration',
    title: 'Daily Inspiration',
    description: '"The only way to do great work is to love what you do." - Steve Jobs',
    date: '2023-06-15T08:00:00Z',
    read: false,
  },
];

// Mock dashboard data that combines everything
export const mockDashboardData: DashboardData = {
  insights: mockInsights,
  weather: mockWeather,
  notifications: mockNotifications,
  upcomingMilestones: [
    mockDreams[0].milestones[2], // Book flights
    mockDreams[1].milestones[3], // Perform for friends
    mockDreams[3].milestones[2], // Run half marathon
  ],
  activeChallenges: mockChallenges.filter(c => !c.completed),
};
