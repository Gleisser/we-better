import { motion, useScroll, useTransform } from 'framer-motion';
import { forwardRef, useEffect, useState } from 'react';
import { cn } from '@/utils/classnames';
import { FloatingImageProps } from './types';
import ResponsiveImage from '@/shared/components/common/ResponsiveImage/ResponsiveImage';

type IdleWindow = Window & {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  cancelIdleCallback?: (handle: number) => void;
};

const scheduleIdle = (callback: () => void): number => {
  if (typeof window === 'undefined') {
    return 0;
  }

  const idleWindow = window as IdleWindow;

  if (typeof idleWindow.requestIdleCallback === 'function') {
    return idleWindow.requestIdleCallback(callback, { timeout: 2000 });
  }

  return window.setTimeout(callback, 1200);
};

const cancelIdle = (id: number): void => {
  if (typeof window === 'undefined') {
    return;
  }

  const idleWindow = window as IdleWindow;

  if (typeof idleWindow.cancelIdleCallback === 'function') {
    idleWindow.cancelIdleCallback(id);
    return;
  }

  window.clearTimeout(id);
};

const FloatingImage = forwardRef<HTMLImageElement, FloatingImageProps>(
  ({ media, className = '' }, ref) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [shouldRenderVideo, setShouldRenderVideo] = useState(false);
    const { scrollY } = useScroll();

    // Extract position information from className
    const isTop = className.includes('-top-');
    const isLeft = className.includes('-left-');
    const isRight = className.includes('-right-');
    const isBottom = className.includes('bottom-0');

    // Calculate movement direction based on position
    const getMovementValues = (): { x: number[]; y: number[] } => {
      if (isTop && isLeft) return { x: [0, -100], y: [0, -100] };
      if (isTop && isRight) return { x: [0, 100], y: [-100, -100] };
      if (isBottom && isLeft) return { x: [0, -100], y: [200, 100] };
      if (isBottom && isRight) return { x: [0, 100], y: [200, 100] };
      return { x: [0, 0], y: [0, 0] };
    };

    const { x, y } = getMovementValues();

    // Extract rotation value from className
    const rotationMatch = className.match(/-?rotate-(\d+)/);
    const baseRotation = rotationMatch ? parseInt(rotationMatch[1]) : 0;
    const isNegative = className.includes('-rotate');
    const rotation = isNegative ? -baseRotation : baseRotation;

    // Create dynamic transforms based on scroll
    const translateX = useTransform(scrollY, [0, 800], x);
    const translateY = useTransform(scrollY, [0, 800], y);
    const rotate = useTransform(scrollY, [0, 800], [rotation, rotation * 1.5]);

    useEffect(() => {
      if (!media.video?.length) {
        return;
      }

      const idleId = scheduleIdle(() => {
        setShouldRenderVideo(true);
      });

      return () => {
        cancelIdle(idleId);
      };
    }, [media.video]);

    return (
      <motion.div
        className={cn('absolute z-10', className)}
        style={{ x: translateX, y: translateY, rotate }}
        initial={{ opacity: 0, x: x[0], y: y[0], scale: 0.8 }}
        animate={{ opacity: 1, x: x[0], y: y[0], scale: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
        role="presentation"
        aria-hidden="true"
      >
        <div className="relative w-[250px] h-[250px] group">
          <motion.div
            className="absolute -inset-4 bg-gradient-to-r from-white/5 to-white/10 rounded-[2rem] backdrop-blur-[2px] border border-white/20"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          />

          <div className="relative h-full">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary-blue/20 to-primary-purple/20 rounded-3xl backdrop-blur-sm border border-white/20"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            />

            {shouldRenderVideo && media.video?.length ? (
              <video
                autoPlay
                className={cn(
                  'relative h-full w-full rounded-3xl object-cover shadow-2xl transition-opacity duration-300',
                  isLoaded ? 'opacity-100' : 'opacity-0'
                )}
                loop
                muted
                playsInline
                poster={media.poster}
                onCanPlay={() => setIsLoaded(true)}
              >
                {media.video.map(source => (
                  <source key={source.src} src={source.src} type={source.type} />
                ))}
              </video>
            ) : (
              <ResponsiveImage
                ref={ref}
                media={media}
                alt=""
                className={cn(
                  'relative h-full w-full rounded-3xl object-cover shadow-2xl transition-opacity duration-300',
                  isLoaded ? 'opacity-100' : 'opacity-0'
                )}
                loading="lazy"
                onLoad={() => setIsLoaded(true)}
              />
            )}
          </div>
        </div>
      </motion.div>
    );
  }
);

FloatingImage.displayName = 'FloatingImage';

export default FloatingImage;
