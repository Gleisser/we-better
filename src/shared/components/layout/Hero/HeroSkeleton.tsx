import { motion } from 'framer-motion';

const HeroSkeleton = (): JSX.Element => {
  return (
    <div
      className="relative isolate z-[1] flex min-h-screen w-full max-w-full flex-col items-center justify-center overflow-visible overflow-x-hidden bg-black pb-16 md:px-4 md:pb-[20rem]"
      data-testid="hero-skeleton"
    >
      {/* Keep the background blur effect */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <motion.div
        className="relative z-[2] mt-20 flex w-full flex-col items-center justify-center gap-4 px-4 text-center md:mx-auto md:max-w-7xl md:px-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Title skeleton */}
        <div className="space-y-4 w-full max-w-3xl mx-auto">
          <div className="h-14 bg-white/5 rounded-lg animate-pulse w-3/4 mx-auto" />
          <div className="h-14 bg-white/5 rounded-lg animate-pulse w-1/2 mx-auto" />
        </div>

        {/* Subtitle skeleton */}
        <div className="h-6 bg-white/5 rounded-lg animate-pulse w-2/3 mx-auto mt-6" />

        {/* CTA buttons skeleton */}
        <div className="mb-16 flex flex-col justify-center gap-5 md:mb-24 md:flex-row md:gap-4">
          <div className="h-12 bg-white/5 rounded-full animate-pulse w-40" />
          <div className="h-12 bg-white/5 rounded-full animate-pulse w-40" />
        </div>
      </motion.div>

      {/* Preview container skeleton */}
      <div className="relative z-[3] mt-8 w-full max-w-6xl">
        <div className="relative z-[3] mb-4 w-full px-4 md:mb-0 md:px-0">
          {/* Main dashboard preview skeleton */}
          <div className="relative w-full max-w-4xl mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-r from-white/5 to-white/10 rounded-[2rem] backdrop-blur-[2px] border border-white/20" />
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden backdrop-blur-sm bg-black/30 animate-pulse" />
          </div>
        </div>

        {/* Floating images skeleton */}
        <div className="absolute -top-20 -left-10 w-[250px] h-[250px] rounded-3xl bg-white/5 animate-pulse" />
        <div className="absolute -top-20 -right-10 w-[250px] h-[250px] rounded-3xl bg-white/5 animate-pulse" />
        <div className="absolute bottom-0 -left-32 w-[250px] h-[250px] rounded-3xl bg-white/5 animate-pulse" />
        <div className="absolute bottom-0 -right-32 w-[250px] h-[250px] rounded-3xl bg-white/5 animate-pulse" />
      </div>
    </div>
  );
};

export default HeroSkeleton;
