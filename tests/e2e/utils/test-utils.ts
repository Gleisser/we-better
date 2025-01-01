import { test as base } from '@playwright/test';

// Just re-export the base test and expect
export const test = base;
export { expect } from '@playwright/test';

// General test utilities and helper functions
// Will be useful for:
// - Common assertions
// - Setup/teardown helpers
// - Shared test behaviors