import { useState, useRef, useEffect } from 'react';
import styles from './Tools.module.css';
import { TOOLS_FALLBACK } from '@/constants/fallback';
import { useTool } from '@/hooks/useTool';
import { Tool, ToolTab } from '@/types/tool';
import { API_CONFIG } from '@/lib/api-config';

const Tools = () => {
  const { data } = useTool();
  const tabs = data?.data?.tabs || TOOLS_FALLBACK;
  const [activeTab, setActiveTab] = useState<ToolTab | Tool>(tabs[0]);
  const [loadedVideos, setLoadedVideos] = useState<Set<string>>(new Set());
  const videoRef = useRef<HTMLVideoElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const gradientText = data?.data?.title.split(' ')[0];
  const toolName = data?.data?.title.split(' ')[1];

  // Setup Intersection Observer for video container
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && videoRef.current) {
            const videoId = activeTab.videoSrc.id;
            if (!loadedVideos.has(videoId)) {
              const videoUrl = data?.data 
                ? API_CONFIG.imageBaseURL + activeTab.videoSrc.video[0].url 
                : activeTab.videoSrc.video[0].url;
              
              videoRef.current.src = videoUrl;
              videoRef.current.load();
              setLoadedVideos(prev => new Set(prev).add(videoId));
            }
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    );

    if (containerRef.current) {
      observerRef.current.observe(containerRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [activeTab, data?.data, loadedVideos]);

  // Preload next video when tab changes
  useEffect(() => {
    if (videoRef.current) {
      const videoId = activeTab.videoSrc.id;
      if (!loadedVideos.has(videoId)) {
        const videoUrl = data?.data 
          ? API_CONFIG.imageBaseURL + activeTab.videoSrc.video[0].url 
          : activeTab.videoSrc.video[0].url;
        
        videoRef.current.src = videoUrl;
        videoRef.current.load();
        setLoadedVideos(prev => new Set(prev).add(videoId));
      }
    }
  }, [activeTab, data?.data, loadedVideos]);

  return (
    <section className={styles.toolsContainer}>
      <div className={styles.toolsContent}>
        {/* Title Section */}
        <div className={styles.titleContainer}>
          <h2 className={styles.mainTitle}>
            <span className={styles.gradientText}>{gradientText || 'WeBetter'}</span> {toolName || 'Toolkit'}
            <svg 
              className={styles.toolIcon} 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none"
            >
              <path 
                d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </h2>
        </div>

        <div className={styles.contentWrapper}>
          {/* Tabs Navigation */}
          <div className={styles.tabsContainer}>
            {tabs.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTab(tool)}
                className={`${styles.tab} ${tool.id === activeTab.id ? styles.activeTab : ''}`}
              >
                {tool.title}
              </button>
            ))}
          </div>

          {/* Content Section */}
          <div className={styles.contentContainer}>
            <div className={styles.textContent}>
              <h3 className={styles.title}>{activeTab.title}</h3>
              <h3 className={styles.subtitle}>{activeTab.subtitle}</h3>
              <p className={styles.description}>{activeTab.description}</p>
            </div>

            <div className={styles.videoContainer} ref={containerRef}>
              <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                className={styles.video}
                key={activeTab.videoSrc.id}
                poster={`/assets/images/tools/${activeTab.id}-poster.webp`}
              >
                {/* Source will be set dynamically when in view */}
              </video>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Tools; 