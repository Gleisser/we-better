# WE BETTER - Testing Guidelines

## Table of Contents
1. [Introduction](#introduction)
2. [Testing Philosophy](#testing-philosophy)
3. [Testing Stack](#testing-stack)
4. [Test Organization](#test-organization)
5. [Unit and Integration Testing with Vitest](#unit-and-integration-testing-with-vitest)
6. [End-to-End Testing with Playwright](#end-to-end-testing-with-playwright)
7. [Test-Driven Development (TDD)](#test-driven-development-tdd)
8. [Mocking Strategies](#mocking-strategies)
9. [Testing React Components](#testing-react-components)
10. [Testing Hooks](#testing-hooks)
11. [API and Service Testing](#api-and-service-testing)
12. [Performance Testing](#performance-testing)
13. [Testing in CI/CD](#testing-in-cicd)
14. [Test Coverage](#test-coverage)
15. [Best Practices](#best-practices)
16. [Common Pitfalls](#common-pitfalls)
17. [Resources](#resources)

## Introduction

This document outlines the testing guidelines for the We Better project. It serves as a comprehensive reference for our testing practices, conventions, and standards. By following these guidelines, we ensure consistent, maintainable, and effective tests across our codebase.

## Testing Philosophy

We believe in a balanced approach to testing that prioritizes:

- **Confidence over coverage**: Tests should give us confidence that our code works as expected, not just achieve high coverage numbers.
- **Maintainability**: Tests should be easy to understand and maintain.
- **Speed**: Tests should run quickly to provide fast feedback.
- **Reliability**: Tests should produce consistent results.

We adopt a testing pyramid approach:
- Many unit tests (fast, focused)
- Fewer integration tests (medium complexity)
- Fewer end-to-end tests (complex, slower)

## Testing Stack

Our testing stack consists of:

- **Vitest**: Fast, Vite-native unit and integration testing framework
- **React Testing Library**: Component testing utilities
- **Playwright**: End-to-end testing framework
- **MSW (Mock Service Worker)**: API mocking
- **@testing-library/user-event**: Realistic user interaction simulation

## Test Organization

We follow a co-located testing approach:

```
src/
  components/
    Button/
      Button.tsx
      Button.test.tsx
      Button.module.css
    Alert/
      Alert.tsx
      Alert.test.tsx
      Alert.module.css
  hooks/
    useAuth.ts
    useAuth.test.ts
  utils/
    format.ts
    format.test.ts
tests/
  e2e/
    specs/
      login.spec.ts
      dashboard.spec.ts
    fixtures/
      users.json
    utils/
      test-utils.ts
```

### Key Principles:

1. **Co-location**: Place test files next to the files they test
2. **Naming Convention**: Use `.test.ts(x)` suffix for unit/integration tests
3. **E2E Tests**: Keep all E2E tests in the `tests/e2e` directory
4. **Test Utils**: Common testing utilities should be in `src/test-utils`

## Unit and Integration Testing with Vitest

### Setup

Our Vitest configuration is in `vitest.config.ts`:

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
});
```

### Basic Test Structure

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  beforeEach(() => {
    // Setup code
  });

  it('should render correctly', () => {
    render(<ComponentName />);
    
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });
});
```

### Writing Effective Unit Tests

1. **Test behavior, not implementation**: Focus on what the code does, not how it does it.
2. **Single responsibility**: Each test should verify one specific behavior.
3. **Arrange-Act-Assert**: Structure tests with clear setup, action, and verification phases.
4. **Descriptive names**: Use clear, descriptive test names that explain the expected behavior.

Example:
```typescript
it('should display error message when API call fails', async () => {
  // Arrange
  mockApiCall.mockRejectedValue(new Error('Network error'));
  
  // Act
  render(<DataFetchingComponent />);
  
  // Assert
  expect(await screen.findByText('Failed to load data')).toBeInTheDocument();
});
```

## End-to-End Testing with Playwright

We use Playwright for end-to-end testing to verify that the entire application works as expected from a user's perspective.

### Setup

Our Playwright configuration is in `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    video: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      },
    },
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        viewport: { width: 375, height: 667 }
      },
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
});
```

### Page Object Model

We use the Page Object Model pattern to organize E2E tests:

```typescript
// tests/e2e/utils/page-objects.ts
import { Page } from '@playwright/test';

export class HomePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/');
  }

  async getMainNav() {
    return this.page.getByRole('navigation', { name: 'Main menu' });
  }
}

// tests/e2e/specs/home.spec.ts
import { test, expect } from '@playwright/test';
import { HomePage } from '../utils/page-objects';

test.describe('Home Page', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should display main navigation', async () => {
    const nav = await homePage.getMainNav();
    await expect(nav).toBeVisible();
  });
});
```

### E2E Testing Best Practices

1. **Focus on critical user journeys**: Test key user flows, not every possible interaction.
2. **Use realistic data**: Test with data that mimics real usage.
3. **Test across viewports**: Verify that the application works on both desktop and mobile.
4. **Minimize test interdependence**: Each test should be independent and not rely on the state from previous tests.
5. **Use page objects**: Abstract page interactions to maintain clean, readable tests.

## Test-Driven Development (TDD)

We encourage test-driven development when appropriate:

1. **Write a failing test**: Start by writing a test that defines the expected behavior.
2. **Write the minimum code**: Implement just enough code to make the test pass.
3. **Refactor**: Clean up the code while keeping the tests passing.

Benefits of TDD:
- Forces clear thinking about requirements before implementation
- Leads to more modular, testable code
- Provides immediate feedback during development
- Creates a safety net for refactoring

## Mocking Strategies

### Mocking Dependencies

We use Vitest's built-in mocking capabilities:

```typescript
import { vi } from 'vitest';
import { useApi } from './useApi';

// Manual mock
vi.mock('./useApi', () => ({
  useApi: vi.fn().mockReturnValue({
    data: { id: 1, name: 'Test' },
    isLoading: false,
    error: null
  })
}));

// Factory function mock
vi.mock('./calculator', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    add: vi.fn().mockReturnValue(10)
  };
});
```

### Mocking APIs

We use MSW (Mock Service Worker) for API mocking:

```typescript
// src/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' }
      ])
    );
  }),
];

// src/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### Test Setup for API Mocking

```typescript
// src/setupTests.ts
import { beforeAll, afterAll, afterEach } from 'vitest';
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Testing React Components

### Rendering Components

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

it('renders a button with text', () => {
  render(<Button>Click me</Button>);
  
  expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
});
```

### Testing User Interactions

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Counter } from './Counter';

it('increments counter when clicked', async () => {
  render(<Counter />);
  
  // Using userEvent (preferred for realistic interactions)
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Increment' }));
  
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

### Testing Components with Context

```typescript
import { render, screen } from '@testing-library/react';
import { UserContext } from '@/contexts/UserContext';
import { ProfilePage } from './ProfilePage';

it('displays user name when logged in', () => {
  render(
    <UserContext.Provider value={{ user: { name: 'John' }, isAuthenticated: true }}>
      <ProfilePage />
    </UserContext.Provider>
  );
  
  expect(screen.getByText('Welcome, John')).toBeInTheDocument();
});
```

### Testing Async Components

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { UserProfile } from './UserProfile';

it('loads and displays user data', async () => {
  render(<UserProfile userId="1" />);
  
  // Show loading state initially
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  
  // Wait for data to load
  await waitFor(() => {
    expect(screen.getByText('User: John Doe')).toBeInTheDocument();
  });
});
```

## Testing Hooks

Use the `renderHook` utility from React Testing Library:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

it('should increment counter', () => {
  const { result } = renderHook(() => useCounter());
  
  act(() => {
    result.current.increment();
  });
  
  expect(result.current.count).toBe(1);
});
```

For hooks that need context:

```typescript
import { renderHook } from '@testing-library/react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useTheme } from './useTheme';

it('should access theme from context', () => {
  const wrapper = ({ children }) => (
    <ThemeProvider initialTheme="dark">
      {children}
    </ThemeProvider>
  );
  
  const { result } = renderHook(() => useTheme(), { wrapper });
  
  expect(result.current.theme).toBe('dark');
});
```

## API and Service Testing

### Testing API Services

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchUsers } from './userService';

// Mock fetch globally
global.fetch = vi.fn();

describe('userService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should fetch users successfully', async () => {
    // Mock the fetch response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, name: 'John' }]
    });
    
    const users = await fetchUsers();
    
    expect(users).toEqual([{ id: 1, name: 'John' }]);
    expect(global.fetch).toHaveBeenCalledWith('/api/users');
  });

  it('should handle errors', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });
    
    await expect(fetchUsers()).rejects.toThrow('Failed to fetch users: 500 Internal Server Error');
  });
});
```

## Performance Testing

### Component Render Performance

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { DataGrid } from './DataGrid';

describe('DataGrid performance', () => {
  it('should render large dataset efficiently', () => {
    // Generate large dataset
    const rows = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      value: Math.random() * 1000
    }));
    
    // Measure render time
    const start = performance.now();
    render(<DataGrid rows={rows} />);
    const end = performance.now();
    
    // Assert render is under acceptable threshold
    expect(end - start).toBeLessThan(100); // 100ms threshold
  });
});
```

## Testing in CI/CD

Our CI/CD pipeline runs tests on every pull request and merge to main branches. We use GitHub Actions for this:

```yaml
# .github/workflows/test.yml
name: Tests
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Run E2E tests
        run: npm run test:e2e
```

## Test Coverage

We use Vitest's built-in coverage reporting:

```bash
npm run test:coverage
```

Coverage goals:
- Unit tests: >80% coverage
- Integration tests: >70% coverage
- Critical paths: 100% coverage

## Best Practices

1. **Test behavior, not implementation**: Focus on what the code does, not how it does it.
2. **Keep tests simple**: Each test should focus on a single behavior.
3. **Use descriptive test names**: Tests should clearly describe what they're testing.
4. **Avoid test interdependencies**: Tests should be independent and not rely on the state from other tests.
5. **Mock external dependencies**: Isolate tests from external systems.
6. **Cleanup after tests**: Reset mocks and state after each test.
7. **Test edge cases**: Include tests for error conditions, boundary values, and edge cases.
8. **Accessibility testing**: Include tests for accessibility where appropriate.
9. **Prefer realistic user interactions**: Use userEvent over fireEvent for more realistic user interactions.
10. **Test visually hidden content**: Use `screen.getByText()` with `{ hidden: true }` option.

## Common Pitfalls

1. **Overspecified tests**: Testing implementation details makes tests brittle.
2. **Missing error case tests**: Don't forget to test error conditions.
3. **Slow tests**: Tests that are too slow reduce developer productivity.
4. **Flaky tests**: Tests that sometimes pass and sometimes fail reduce confidence.
5. **Over-mocking**: Excessive mocking can lead to tests that pass but don't verify real behavior.
6. **Testing the wrong thing**: Make sure tests verify the important aspects of the code.
7. **Test duplication**: Avoid testing the same behavior multiple times.

## Resources

- [Vitest Documentation](https://vitest.dev/guide/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Kent C. Dodds Blog](https://kentcdodds.com/blog?q=testing)
- [MSW Documentation](https://mswjs.io/docs/)

---

This testing guide should be treated as a living document. As our codebase evolves and we learn more about best practices, we should update this guide accordingly. 