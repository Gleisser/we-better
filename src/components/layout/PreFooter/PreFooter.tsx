import styles from './PreFooter.module.css';
import { usePrefooter } from '@/hooks/usePrefooter';
import { PREFOOTER_FALLBACK } from '@/constants/fallback';
import { renderHighlightedText } from '@/utils/textFormatting';
import { API_CONFIG } from '@/lib/api-config';
import { ButtonArrowIcon } from '@/components/common/icons';

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
    <section 
      className={styles.preFooterContainer}
      aria-labelledby="prefooter-title"
    >
      <div className={styles.preFooterContent}>
        {/* Left Column */}
        <div className={styles.leftColumn}>
          <h2 
            className={styles.title}
            id="prefooter-title"
          >
            {title}
          </h2>
          
          <div 
            className={styles.actionContainer}
            role="group"
            aria-label="Call to action"
          >
            <a 
              href="https://leonardo.ai" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.button}
              aria-label="Get started with Leonardo AI"
            >
              {prefooter?.buttonText}
              <ButtonArrowIcon className={styles.arrow} aria-hidden="true" />
            </a>
            <p className={styles.note}>{prefooter?.buttonDescription}</p>
          </div>
        </div>

        {/* Right Column */}
        <div 
          className={styles.rightColumn}
          role="presentation"
        >
          <div className={styles.imageContainer}>
            <img
              src={isAPI ? API_CONFIG.imageBaseURL + prefooter?.image.url : prefooter?.image.url}
              alt="Interactive preview of Leonardo AI platform showcasing creative tools and workspace"
              className={styles.image}
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PreFooter; 