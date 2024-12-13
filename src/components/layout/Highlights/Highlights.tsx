import { useEffect, useState } from 'react';
import styles from './Highlights.module.css';
import { HIGHLIGHTS } from '../../../constants/highlights';

const Highlights = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % HIGHLIGHTS.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className={styles.highlightsContainer}>
      <h2 className={styles.highlightsTitle}>
        <span>Use Leonardo today for</span>
        <span className={styles.gradientText}>{HIGHLIGHTS[activeIndex]}</span>
      </h2>
      <div className={styles.sliderContainer}>
        {HIGHLIGHTS.map((highlight, index) => {
          const imageFileName = highlight === "and much more" 
            ? "Much-More" 
            : highlight.replace(" ", "-");
      
          return (
            <div 
              key={highlight}
              className={`${styles.slide} ${index === activeIndex ? styles.activeSlide : ''}`}
            >
              <img
                src={`/assets/images/highlights/${imageFileName}.webp`}
                alt={highlight}
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