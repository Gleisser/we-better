# Dream Challenge Components - Backend Integration

This directory contains the fully integrated Dream Challenge components that work with the backend API.

## Components

### `DreamChallengeContainer`

The main container component that handles all state management and API integration. Use this in your pages.

### `DreamChallenge`

The display component that shows active challenges and allows users to mark progress.

### `ChallengeModal`

The modal for creating new challenges.

## API Integration

The components are integrated with:

- **API Service**: `dreamChallengesApi.ts` - Handles all HTTP requests
- **Custom Hook**: `useDreamChallenges.ts` - Manages state and API calls
- **Authentication**: Uses Supabase auth tokens automatically
- **Error Handling**: Built-in error states and retry logic

## Usage

```tsx
import { DreamChallengeContainer } from '@/features/dream-board/components/DreamChallenge';
import { Dream } from '@/features/dream-board/types';

interface MyPageProps {
  dreams: Dream[];
}

const MyPage: React.FC<MyPageProps> = ({ dreams }) => {
  return (
    <div>
      {/* Other content */}

      <DreamChallengeContainer dreams={dreams} />

      {/* Other content */}
    </div>
  );
};
```

## Features

- ✅ **Create Challenges**: Create new challenges with full configuration
- ✅ **Progress Tracking**: Mark days as complete with automatic progress updates
- ✅ **Challenge Completion**: Automatic completion when duration is reached
- ✅ **Real-time Updates**: State updates immediately reflect API changes
- ✅ **Error Handling**: Graceful error handling with user feedback
- ✅ **Loading States**: Loading indicators during API operations
- ✅ **Authentication**: Automatic auth token handling via Supabase
- ✅ **Responsive Design**: Works on mobile and desktop

## API Endpoints Used

- `GET /api/dream-challenges?type=active` - Get active challenges
- `GET /api/dream-challenges?type=completed` - Get completed challenges
- `POST /api/dream-challenges` - Create new challenge
- `PUT /api/dream-challenges` - Update challenge
- `DELETE /api/dream-challenges?id={id}` - Delete challenge
- `POST /api/dream-challenges/progress` - Record daily progress

## Configuration

The API URL is automatically configured using:

```typescript
const API_URL = `${import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:3000'}/api/dream-challenges`;
```

Make sure your environment variables are set correctly:

- `VITE_API_BACKEND_URL` - Your backend API URL (defaults to localhost:3000)

## Database Schema

The components work with the following database tables:

- `dream_challenges` - Main challenge data
- `dream_challenge_progress` - Daily completion tracking

See the migration file for full schema details.
