# We Better - AI-Powered Self Improvement Platform

## Overview

We Better is an AI-powered self-improvement platform that helps users achieve personal and professional growth through various tools and features like Dream Boards, Life Wheel assessments, and personalized learning paths.

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development](#development)
- [Project Architecture](#project-architecture)
  - [Directory Structure](#directory-structure)
  - [Core Technologies](#core-technologies)
  - [Key Features](#key-features)
- [Contributing](#contributing)
  - [For Human Contributors](#for-human-contributors)
  - [For AI Agents](#for-ai-agents)
- [Development Guidelines](#development-guidelines)
  - [Code Style](#code-style)
  - [Testing](#testing)
  - [State Management](#state-management)
  - [Component Guidelines](#component-guidelines)
- [Common Utilities](#common-utilities)
  - [Toast Notifications](#toast-notifications)
  - [API Client](#api-client)
- [Deployment](#deployment)
- [License](#license)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher)
- Git

### Installation

```bash
# Install pnpm if you haven't already
npm install -g pnpm

# Clone the repository
git clone https://github.com/your-username/we-better.git
cd we-better

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Development Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build           # Build for production
pnpm preview         # Preview production build

# Testing
pnpm test           # Run tests
pnpm test:ui        # Run tests with UI
pnpm test:coverage  # Run tests with coverage
pnpm test:e2e       # Run end-to-end tests
pnpm test:e2e:ui    # Run end-to-end tests with UI
pnpm test:e2e:debug # Debug end-to-end tests

# Code Quality
pnpm lint          # Run ESLint
pnpm lint:fix      # Fix ESLint issues
pnpm format        # Format code with Prettier
pnpm format:check  # Check code formatting
pnpm type-check    # Run TypeScript checks

# Assets
pnpm optimize-svgs # Optimize SVG assets
```

## Project Architecture

### Directory Structure

```
src/
├── features/           # Feature modules
│   ├── auth/          # Authentication feature
│   ├── dashboard/     # Dashboard feature
│   ├── dream-board/  # Dream board feature
│   ├── life-wheel/    # Life wheel feature
│   ├── courses/       # Courses feature
│   ├── podcasts/      # Podcasts feature
│   ├── videos/        # Videos feature
│   └── articles/      # Articles feature
├── shared/            # Shared components and hooks
│   ├── components/    # Reusable UI components
│   │   ├── common/    # Common UI elements
│   │   ├── layout/    # Layout components
│   │   └── widgets/   # Widget components
│   ├── hooks/         # Custom React hooks
│   └── contexts/      # React contexts
├── core/              # Core app functionality
│   ├── router/        # Routing configuration
│   ├── services/      # API services
│   │   ├── api-client.ts
│   │   └── rate-limiter.ts
│   ├── config/        # App configuration
│   │   ├── api-config.ts
│   │   └── react-query.ts
│   └── middleware/    # Middleware
├── utils/             # Utility functions
│   ├── helpers/       # Helper functions
│   ├── constants/     # Constants and enums
│   └── types/         # TypeScript types
├── assets/            # Static assets
├── styles/            # Global styles
│   ├── globals.css
│   └── index.css
└── test/             # Test utilities
    ├── mocks/        # Test mocks
    └── utils/        # Test helpers
```

### Core Technologies

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: React Router
- **UI Components**: Custom components with Tailwind CSS
- **Notifications**: React Hot Toast
- **Testing**:
  - Unit/Integration: Vitest
  - E2E: Playwright
- **Code Quality**:
  - ESLint for linting
  - Prettier for formatting
  - TypeScript for type safety
- **State Management**:
  - React Query for server state
  - React Context for global state
  - Local state for component state

### External Dependencies

This frontend application depends on two backend services:

#### 1. User Service (@webetter-user-service v1.0.0)

A Next.js-based microservice handling user management and authentication.

**Key Features**:

- User authentication and authorization
- Profile management
- User preferences and settings
- Integration with Supabase

**Tech Stack**:

- Next.js
- tRPC
- Supabase
- React Query
- Express
- MongoDB (via Mongoose)

**Required Environment Variables**:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

#### 2. Content Management (@webetter-backend v0.1.0)

A Strapi-based CMS handling all content-related operations.

**Key Features**:

- Content management for articles, videos, and podcasts
- Category management
- Media handling
- Content curation and scheduling
- Integration with external content providers:
  - YouTube videos
  - Spotify podcasts
  - Udemy courses
  - Various article sources (Better Humans, Tiny Buddha, etc.)

**Tech Stack**:

- Strapi v5.12.6
- PostgreSQL
- Node.js
- Express
- Google AI for content processing
- Various content fetching scripts

**Required Environment Variables**:

```env
STRAPI_API_URL=your_strapi_url
STRAPI_API_TOKEN=your_api_token
```

**Integration Points**:

```typescript
// Example API client configuration
import { apiClient } from '@/core/services/api-client';

// User service endpoints
const USER_SERVICE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL;
const userApi = apiClient.create({
  baseURL: USER_SERVICE_URL,
});

// Content service endpoints
const CONTENT_SERVICE_URL = process.env.NEXT_PUBLIC_CONTENT_SERVICE_URL;
const contentApi = apiClient.create({
  baseURL: CONTENT_SERVICE_URL,
});
```

### Key Features

#### 1. Dream Board

The Dream Board feature allows users to create interactive visual representations of their goals and aspirations.

**Key Components**:

```typescript
// Example Dream Board usage
import { DreamBoard } from '@/features/dream-board';

<DreamBoard
  data={dreamBoardData}
  onSave={handleSave}
  onShare={handleShare}
/>
```

**Features**:

- Interactive canvas for creating dream boards
- Image upload and manipulation
- Category-based organization
- Real-time collaboration
- Share functionality

#### 2. Life Wheel

The Life Wheel feature helps users assess and track different areas of their life.

**Key Components**:

```typescript
// Example Life Wheel usage
import { LifeWheel } from '@/features/life-wheel';

<LifeWheel
  categories={lifeCategories}
  onAssessment={handleAssessment}
/>
```

**Features**:

- Interactive wheel visualization
- Progress tracking
- Historical data comparison
- Goal setting

## Contributing

### For Human Contributors

#### 1. Getting Started

1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes
4. Run tests and linting:
   ```bash
   pnpm test
   pnpm lint
   ```
5. Commit your changes using conventional commits:
   ```bash
   git commit -m "feat: add new feature"
   ```

#### 2. Pull Request Process

1. Update documentation
2. Ensure all tests pass
3. Update the changelog
4. Get code review
5. Squash commits
6. Merge to main branch

#### 3. Code Review Guidelines

- Review for functionality
- Check code style
- Verify test coverage
- Review documentation
- Check performance implications

### For AI Agents

#### 1. Context Understanding

Before making changes, ensure you:

- Review the project structure
- Understand feature organization
- Check existing patterns
- Review type definitions

#### 2. Code Generation Guidelines

When generating code:

```typescript
// 1. Use TypeScript with strict types
interface Props {
  data: SomeType;
  onAction: (data: SomeType) => Promise<void>;
}

// 2. Follow existing patterns
export const Component: React.FC<Props> = ({ data, onAction }) => {
  // Implementation
};

// 3. Include error handling
try {
  await onAction(data);
} catch (error) {
  showToast.error(getErrorMessage(error));
}

// 4. Add JSDoc comments
/**
 * Component description
 * @param props - The component props
 * @returns JSX element
 */
```

#### 3. Integration Points

- Use established services from `core/services`
- Follow error handling patterns
- Maintain type safety
- Use shared components from `shared/components`

## Development Guidelines

### Code Style

```typescript
// 1. Use functional components
import { FC } from 'react';

interface Props {
  // Props definition
}

export const ComponentName: FC<Props> = ({ prop }) => {
  // Implementation
};

// 2. Use hooks for side effects
useEffect(() => {
  // Side effect
}, [dependencies]);

// 3. Use custom hooks for shared logic
const useCustomHook = () => {
  // Hook implementation
};
```

### Testing

```typescript
// Component test example
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const onAction = vi.fn();
    render(<ComponentName onAction={onAction} />);

    await userEvent.click(screen.getByRole('button'));
    expect(onAction).toHaveBeenCalled();
  });
});
```

### State Management

```typescript
// 1. React Query for server state
const { data, isLoading } = useQuery({
  queryKey: ['key'],
  queryFn: fetchData,
});

// 2. Context for global state
export const AppContext = createContext<AppContextType | undefined>(undefined);

// 3. Local state for component data
const [state, setState] = useState<StateType>(initialState);
```

## Common Utilities

### Toast Notifications

```typescript
import showToast from '@/utils/toast';

// Success notification
showToast.success('Operation completed!');

// Error notification
showToast.error('An error occurred');

// Loading notification
const loadingToast = showToast.loading('Processing...');
// Dismiss loading toast
toast.dismiss(loadingToast);

// Promise handling
showToast.promise(asyncOperation(), {
  loading: 'Processing...',
  success: 'Operation completed!',
  error: 'An error occurred',
});
```

### API Client

```typescript
import { apiClient } from '@/core/services/api-client';

// GET request
const getData = async () => {
  const response = await apiClient.get('/endpoint');
  return response.data;
};

// POST request with error handling
const createData = async (data: DataType) => {
  try {
    const response = await apiClient.post('/endpoint', data);
    return response.data;
  } catch (error) {
    showToast.error(getErrorMessage(error));
    throw error;
  }
};
```

## Deployment

### Build Process

1. Run type checking:

   ```bash
   pnpm type-check
   ```

2. Run tests:

   ```bash
   pnpm test
   ```

3. Build the application:
   ```bash
   pnpm build
   ```

### Environment Variables

Required environment variables:

```env
VITE_API_URL=your_api_url
VITE_AUTH_DOMAIN=your_auth_domain
```

### Deployment Checklist

- [ ] Run all tests
- [ ] Check bundle size
- [ ] Verify environment variables
- [ ] Run build process
- [ ] Test production build locally
- [ ] Deploy to staging
- [ ] Run smoke tests
- [ ] Deploy to production

### Monitoring and Logging

- Application monitoring through custom logging service
- Error tracking with error boundaries
- Performance monitoring with Web Vitals

## License

MIT License - See LICENSE file for details
