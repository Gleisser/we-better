import styles from './Partners.module.css';

const PARTNERS = [
  {
    id: 1,
    name: 'Lambda',
    logo: '/assets/images/partners/partner_1.svg',
    className: ''
  },
  {
    id: 2,
    name: 'AWS',
    logo: '/assets/images/partners/partner_2.svg',
    className: ''
  },
  {
    id: 3,
    name: 'Dedium',
    logo: '/assets/images/partners/partner_3.svg',
    className: styles.largeLogo
  },
  {
    id: 4,
    name: 'IQ',
    logo: '/assets/images/partners/partner_4.svg',
    className: ''
  }
] as const;

const Partners = () => {
  return (
    <section className={styles.partnersContainer}>
      <div className={styles.partnersContent}>
        <h2 className={styles.title}>
          Our <span className={styles.highlight}>Partners</span>
        </h2>
        
        <div className={styles.logoGrid}>
          {PARTNERS.map((partner) => (
            <div key={partner.id} className={styles.logoContainer}>
              <img
                src={partner.logo}
                alt={`${partner.name} logo`}
                className={`${styles.logo} ${partner.className}`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners; 