import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/react-query';
import { Header, Hero, Footer } from './components/layout';
import Features from './components/layout/Features/Features';
import Highlights from './components/layout/Highlights/Highlights';
import Tools from './components/layout/Tools/Tools';
import Showcase from './components/layout/Showcase/Showcase';
import Gallery from './components/layout/Gallery/Gallery';
import Community from './components/layout/Community/Community';
import Testimonies from './components/layout/Testimonies/Testimonies';
import Partners from './components/layout/Partners/Partners';
import PreFooter from './components/layout/PreFooter/PreFooter';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;