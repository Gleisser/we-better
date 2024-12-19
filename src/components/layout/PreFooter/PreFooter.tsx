import styles from './PreFooter.module.css';
import { usePrefooter } from '@/hooks/usePrefooter';
import { PREFOOTER_FALLBACK } from '@/constants/fallback';
import { renderHighlightedText } from '@/utils/textFormatting';
import { API_CONFIG } from '@/lib/api-config';

const PreFooter = () => {
  const { data } = usePrefooter();
  const prefooter = data?.data || PREFOOTER_FALLBACK;
  const defaultTitle = <>Create your next <span className={styles.highlight}>artwork</span>, with the power of Leonardo Ai</>;
  const title = renderHighlightedText({
    text: prefooter?.title,
    highlightClassName: styles.highlight,
    fallback: defaultTitle
  });
  const isAPI = data !== undefined;

  return (
    <section className={styles.preFooterContainer}>
      <div className={styles.preFooterContent}>
        {/* Left Column */}
        <div className={styles.leftColumn}>
          <h2 className={styles.title}>
            {title}
          </h2>
          
          <div className={styles.actionContainer}>
            <a 
              href="https://leonardo.ai" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.button}
            >
              {prefooter?.buttonText}
              <svg 
                className={styles.arrow} 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none"
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </a>
            <p className={styles.note}>{prefooter?.buttonDescription}</p>
          </div>
        </div>

        {/* Right Column */}
        <div className={styles.rightColumn}>
          <div className={styles.imageContainer}>
            <img
              src={isAPI ? API_CONFIG.imageBaseURL + prefooter?.image.url : prefooter?.image.url}
              alt="Leonardo AI Platform"
              className={styles.image}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PreFooter; 