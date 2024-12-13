import styles from './Footer.module.css';

const FOOTER_LINKS = {
  Solutions: [
    'AI Art Generator',
    'AI Video Generator',
    'Transparent PNG Generator',
    'AI Marketing Tools',
    'AI Graphic Design',
    'AI Print on Demand',
    'AI Photography',
    'AI Interior Design',
    'AI Architecture'
  ],
  About: [
    'API',
    'FAQ',
    'Blog',
    'Support',
    'Contact us',
    'Careers',
    'Affiliate Program',
    'Leonardo Creator Program'
  ]
};

const SOCIAL_LINKS = [
  { name: 'Facebook', icon: '/assets/images/footer/facebook-icon.svg' },
  { name: 'Instagram', icon: '/assets/images/footer/instagram-icon.svg' },
  { name: 'Discord', icon: '/assets/images/footer/discord-icon.svg' },
  { name: 'X', icon: '/assets/images/footer/x-icon.svg' },
  { name: 'YouTube', icon: '/assets/images/footer/youtube-icon.svg' },
  { name: 'Fanbook', icon: '/assets/images/footer/fanbook-icon.svg' }
];

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.topSection}>
          {/* Menu Links */}
          <div className={styles.menuLinks}>
            {Object.entries(FOOTER_LINKS).map(([category, links]) => (
              <div key={category} className={styles.linkColumn}>
                <h3 className={styles.categoryTitle}>{category}</h3>
                <ul className={styles.linkList}>
                  {links.map((link) => (
                    <li key={link}>
                      <a href="#" className={styles.link}>
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* App Downloads & Social */}
          <div className={styles.rightSection}>
            <div className={styles.getApp}>
              <h3 className={styles.categoryTitle}>Get the App</h3>
              <div className={styles.storeButtons}>
                <a href="#" className={styles.storeLink}>
                  <img src="/assets/images/footer/appstore.svg" alt="App Store" />
                </a>
                <a href="#" className={styles.storeLink}>
                  <img src="/assets/images/footer/play.svg" alt="Google Play" />
                </a>
              </div>
            </div>

            <div className={styles.social}>
              <h3 className={styles.categoryTitle}>Stay Tuned</h3>
              <div className={styles.socialIcons}>
                {SOCIAL_LINKS.map((social) => (
                  <a 
                    key={social.name}
                    href="#"
                    className={styles.socialLink}
                    aria-label={social.name}
                  >
                    <img src={social.icon} alt={social.name} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className={styles.bottomSection}>
          <div className={styles.companyInfo}>
            <img 
              src="/assets/images/footer/logo-leonardo-ai.svg" 
              alt="Leonardo.AI" 
              className={styles.logo}
            />
            <p className={styles.companyDetails}>
              Leonardo Interactive Pty Ltd<br />
              ABN: 56 662 209 485
            </p>
          </div>

          <div className={styles.legalLinks}>
            <a href="#" className={styles.legalLink}>Legal Notice</a>
            <a href="#" className={styles.legalLink}>DMCA</a>
            <a href="#" className={styles.legalLink}>Terms of Service</a>
            <a href="#" className={styles.legalLink}>Cookie Policy</a>
          </div>

          <p className={styles.copyright}>
            © 2024 All Rights Reserved. Leonardo Interactive Pty Ltd®
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;