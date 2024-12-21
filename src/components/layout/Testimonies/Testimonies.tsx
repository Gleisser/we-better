import styles from './Testimonies.module.css';
import { useTestimony } from '@/hooks/useTestimony';
import { TESTIMONY_FALLBACK } from '@/constants/fallback';
import { API_CONFIG } from '@/lib/api-config';
import { TestimonyItem } from '@/types/testimony';
import { renderHighlightedText } from '@/utils/textFormatting';

const Testimonies = () => {
  const { data } = useTestimony();
  const isAPI = data?.data;
  const testimony = data?.data || TESTIMONY_FALLBACK;
  const defaultTitle = <>A community of over <span className={styles.highlight}>4 million</span> is waiting for you</>;

  return (
    <section 
      className={styles.testimoniesContainer}
      aria-labelledby="testimonies-title"
    >
      <div className={styles.testimoniesContent}>
        <div className={styles.header}>
          <h2 
            className={styles.title}
            id="testimonies-title"
          >
            {renderHighlightedText({
              text: testimony?.title,
              highlightClassName: styles.highlight,
              fallback: defaultTitle
            })}
          </h2>
          <p className={styles.description}>
            {testimony?.subtitle}
          </p>
        </div>

        <div 
          className={styles.testimonials}
          role="region"
          aria-label="User testimonials"
        >
          {testimony.testimonies.map((item: TestimonyItem) => (
            <div 
              key={item.id} 
              className={styles.testimonialCard}
              role="article"
            >
              <p className={styles.testimonialText}>"{item.testimony}"</p>
              <div className={styles.author}>
                <img
                  src={isAPI ? API_CONFIG.imageBaseURL + item.profilePic.url : item.profilePic.url} 
                  alt={item.username}
                  className={styles.avatar}
                  loading="lazy"
                  decoding="async"
                />
                <span className={styles.authorName}>{item.username}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonies; 