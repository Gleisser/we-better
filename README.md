# we-better

## Development

This project uses pnpm for dependency management. If you don't have pnpm installed:

```bash
npm install -g pnpm
```

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```
```

### 7. Create a pnpm-workspace.yaml (Optional, for Monorepos)

If you have multiple packages in the same repository:

```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

## Benefits You'll Get

1. **Faster installations**: CI builds and developer environment setup will be much faster
2. **More disk space**: Less duplication of node_modules across projects
3. **Safer dependencies**: Stricter dependency resolution prevents unexpected bugs
4. **Better for monorepos**: If you ever split your project into multiple packages, pnpm handles this much better

This change is infrastructure-focused and won't directly impact your codebase, but it will improve the development experience and build times.

# Toast Notifications

We use `react-hot-toast` for toast notifications. Import and use the utility:

```typescript
import showToast from '@/utils/toast';

// Show a success toast
showToast.success('Operation completed successfully!');

// Show an error toast
showToast.error('An error occurred');

// Show a loading toast
const loadingToast = showToast.loading('Processing...');
// Later dismiss it
toast.dismiss(loadingToast);
```
```

## Side Effects and Considerations

1. **Bundle Size**: You'll reduce your bundle size by removing react-toastify.

2. **Styling**: Ensure consistent styling across all toasts by using the utility function.

3. **Animation**: There might be slight differences in animation, but react-hot-toast has good defaults.

4. **Usage in VisionBoard.tsx**: This is the only component that needs significant changes.

This standardization will make your codebase more consistent, easier to maintain, and slightly improve performance.