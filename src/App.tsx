import { QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/react-query';
import { useEffect } from 'react';
import { prefetchHero } from '@/hooks/useHero';
import ErrorBoundary from './components/common/ErrorBoundary/ErrorBoundary';
import { Header, Hero, Footer } from './components/layout';
import Features from './components/layout/Features/Features';
import Highlights from './components/layout/Highlights/Highlights';
import { Tools } from './components/layout/Tools';
import { Showcase } from './components/layout/Showcase';
import { Gallery } from './components/layout/Gallery';
import { Community } from './components/layout/Community';
import { Testimonies } from './components/layout/Testimonies';
import { Partners } from './components/layout/Partners';
import PreFooter from './components/layout/PreFooter/PreFooter';

function AppContent() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Prefetch hero data on app mount
    prefetchHero(queryClient);
  }, [queryClient]);

  return (
    <ErrorBoundary>
      <div className="h-full w-full max-w-[100%] overflow-x-hidden bg-black">
        <Header />
        <main className="w-full max-w-[100%] overflow-x-hidden">
          <Hero />
          <Features />
          <Highlights />
          <Tools />
          <Showcase />
          <Gallery />
          <Community />
          <Testimonies />
          <Partners />
          <PreFooter />
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;