import React from 'react';

const LazyReactQueryDevtools = import.meta.env.DEV
  ? React.lazy(() =>
      import('@tanstack/react-query-devtools').then(module => ({
        default: module.ReactQueryDevtools,
      }))
    )
  : null;

const ReactQueryDevtoolsLoader = (): JSX.Element | null => {
  if (!LazyReactQueryDevtools) {
    return null;
  }

  return (
    <React.Suspense fallback={null}>
      <LazyReactQueryDevtools initialIsOpen={false} />
    </React.Suspense>
  );
};

export default ReactQueryDevtoolsLoader;
