import { useEffect, useState } from 'react';
import styles from './Highlights.module.css';
import { HIGHLIGHTS } from '../../../constants/highlights';
import { useHighlight } from '@/hooks/useHighlight';
import { API_CONFIG } from '@/lib/api-config';

const Highlights = () => {
  const { data, isLoading } = useHighlight();
  const [activeIndex, setActiveIndex] = useState(0);

  // Get highlights from API or use fallback
  const highlights = data?.data?.slides || HIGHLIGHTS;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % highlights.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [highlights.length]); // Update dependency to use dynamic length

  if (isLoading) return <div>Loading...</div>;

  return (
    <section className={styles.highlightsContainer}>
      <h2 className={styles.highlightsTitle}>
        <span>{data?.data?.title || 'Use Leonardo today for'}</span>
        <span className={styles.gradientText}>{highlights[activeIndex]?.title}</span>
      </h2>
      <div className={styles.sliderContainer}>
        {highlights.map((highlight, index) => {
          // const imageFileName = highlight === "and much more" 
          //   ? "Much-More" 
          //   : highlight.replace(" ", "-");
      
          return (
            <div 
              key={highlight.id}
              className={`${styles.slide} ${index === activeIndex ? styles.activeSlide : ''}`}
            >
              <img
                src={data?.data?.slides && API_CONFIG.imageBaseURL + highlights[activeIndex]?.image?.img?.formats?.large?.url || highlights[activeIndex]?.image?.img?.formats?.large?.url}
                alt={highlights[activeIndex]?.title}
                className={styles.slideImage}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Highlights; 