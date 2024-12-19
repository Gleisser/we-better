import styles from './Testimonies.module.css';
import { useTestimony } from '@/hooks/useTestimony';
import { TESTIMONIALS } from '@/constants/testimony';
import { TestimonyItem } from '@/types/testimony';
import { API_CONFIG } from '@/lib/api-config';




const Testimonies = () => {
  const { data } = useTestimony();
  const isAPI = data?.data;
  const testimony = data?.data || TESTIMONIALS;

  return (
    <section className={styles.testimoniesContainer}>
      <div className={styles.testimoniesContent}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            A community of over{' '}
            <span className={styles.highlight}>4 million</span>
            {' '}is waiting for you
          </h2>
          <p className={styles.description}>
            Leonardo's power extends beyond our revolutionary tools — we are anchored in one of the largest and most supportive AI communities worldwide, and we're deeply committed to it.
          </p>
        </div>

        <div className={styles.testimonials}>
          {testimony.testimonies.map((item: TestimonyItem ) => (
            <div key={item.id} className={styles.testimonialCard}>
              <p className={styles.testimonialText}>"{item.testimony}"</p>
              <div className={styles.author}>
                <img 
                  src={isAPI ? API_CONFIG.imageBaseURL + item.profilePic.url : item.profilePic.url} 
                  alt={item.username}
                  className={styles.avatar}
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