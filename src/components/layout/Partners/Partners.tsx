import { usePartner } from '@/hooks/usePartner';
import styles from './Partners.module.css';
import { API_CONFIG } from '@/lib/api-config';
import { renderHighlightedText } from '@/utils/textFormatting';
import { PARTNERS_FALLBACK } from '@/constants/fallback';
const defaultTitle = (
  <>
    Our <span className={styles.highlight}>Partners</span>
  </>
);

const Partners = () => {
  const { data } = usePartner();
  const partners = data?.data || PARTNERS_FALLBACK;
  const isAPI = data !== undefined;
  
  return (
    <section 
      className={styles.partnersContainer}
      aria-labelledby="partners-title"
    >
      <div className={styles.partnersContent}>
        <h2 
          className={styles.title}
          id="partners-title"
        >
          {renderHighlightedText({
            text: partners?.title,
            highlightClassName: styles.highlight,
            fallback: defaultTitle
          })}
        </h2>
        
        <div 
          className={styles.logoGrid}
          role="region"
          aria-label="Partner logos"
        >
          {partners.brands.map((brand) => (
            <div 
              key={brand.id} 
              className={styles.logoContainer}
              role="article"
            >
              <img
                src={isAPI ? API_CONFIG.imageBaseURL + brand.logo.img.url : brand.logo.img.url}
                alt={`${brand.name} logo`}
                className={`${styles.logo} ${brand.name === 'Dedium' ? styles.largeLogo : ''}`}
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners; 