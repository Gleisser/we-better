import { usePartner } from '@/hooks/usePartner';
import styles from './Partners.module.css';
import { Partner } from '@/types/partner';
import { API_CONFIG } from '@/lib/api-config';
import { renderHighlightedText } from '@/utils/textFormatting';

const PARTNERS : Partner = {
  id: 1,
  documentId: '1',
  title: 'Our [highlight]Partners[/highlight]',
  brands: [
    {
      id: 1,
      documentId: '1',
      name: 'Lambda',
      logo: {
        img: {
            url: '/assets/images/partners/partner_1.svg',
        },
      },
    },
  {
    id: 2,
    documentId: '2',
    name: 'AWS',
    logo: {
      img: {
        url: '/assets/images/partners/partner_2.svg',
      },
    },
  },
  {
    id: 3,
    documentId: '3',
    name: 'Dedium',
    logo: {
      img: {
        url: '/assets/images/partners/partner_3.svg',
      },
    },
  },
  {
    id: 4,
    documentId: '4',
    name: 'IQ',
    logo: {
      img: {
        url: '/assets/images/partners/partner_4.svg',
      },
    },
  }
]} as const;

const defaultTitle = (
  <>
    Our <span className={styles.highlight}>Partners</span>
  </>
);

const Partners = () => {
  const { data } = usePartner();
  const partners = data?.data || PARTNERS;
  const isAPI = data !== undefined;
  
  return (
    <section className={styles.partnersContainer}>
      <div className={styles.partnersContent}>
        <h2 className={styles.title}>
          {renderHighlightedText({
            text: partners?.title,
            highlightClassName: styles.highlight,
            fallback: defaultTitle
          })}
        </h2>
        
        <div className={styles.logoGrid}>
          {partners.brands.map((brand) => (
            <div key={brand.id} className={styles.logoContainer}>
              <img
                src={isAPI ? API_CONFIG.imageBaseURL + brand.logo.img.url : brand.logo.img.url}
                alt={`${brand.name} logo`}
                className={`${styles.logo} ${brand.name === 'Dedium' ? styles.largeLogo : ''}`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners; 