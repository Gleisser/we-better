import { useFooter } from '@/hooks/useFooter';
import styles from './Footer.module.css';
import { API_CONFIG } from '@/lib/api-config';
import { FOOTER_FALLBACK } from '@/constants/fallback';
import { AppStore, MenuList } from '@/types/footer';
import { TopLevelImage } from '@/types/common/image';

const Footer = () => {
  const { data } = useFooter();
  const footer = data?.data || FOOTER_FALLBACK;
  const isAPI = data !== undefined;
  
  return (
    <footer 
      className={styles.footer}
      role="contentinfo"
    >
      <div className={styles.footerContent}>
        <div className={styles.topSection}>
          {/* Menu Links */}
          <nav 
            className={styles.menuLinks}
            aria-label="Footer navigation"
          >
            {footer.menu_lists.map((menu : MenuList) => (
              <div 
                key={menu.Title} 
                className={styles.linkColumn}
                role="region"
                aria-labelledby={`footer-menu-${menu.Title}`}
              >
                <div 
                  className={`${styles.categoryTitle}`}
                  id={`footer-menu-${menu.Title}`}
                >
                  {menu.Title}
                </div>
                <ul className={styles.linkList}>
                  {menu.menu_links.map((link) => (
                    <li key={link.id + link.title}>
                      <a 
                        href={link.href} 
                        className={`${styles.link} focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black rounded-md`}
                        aria-label={link.title}
                      >
                        {link.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {/* App Downloads & Social */}
          <div className={styles.rightSection}>
            <div 
              className={styles.getApp}
              role="region"
              aria-labelledby="app-downloads"
            >
              <div 
                className={styles.categoryTitle}
                id="app-downloads"
              >
                Get the App
              </div>
              <div className={styles.storeButtons}>
                {footer.app_stores.map((appStore : AppStore) => (
                  <a 
                    key={appStore.id} 
                    href="#" 
                    className={styles.storeLink}
                    aria-label={`Download Leonardo AI app from ${appStore.images[0].name} - Get access to AI tools on your mobile device`}
                  >
                    <img 
                      src={isAPI ? API_CONFIG.imageBaseURL + appStore.images[0].url : appStore.images[0].src} 
                      alt={`${appStore.images[0].name} download button`}
                      loading="lazy"
                      decoding="async"
                    />
                  </a>
                ))}
              </div>
            </div>

            <div 
              className={styles.social}
              role="region"
              aria-labelledby="social-media"
            >
              <div 
                className={styles.categoryTitle}
                id="social-media"
              >
                Stay Tuned
              </div>
              <div className={styles.socialIcons}>
                {footer.social_medias[0].logos.map((social : TopLevelImage) => (
                  <a 
                    key={social.id}
                    href="#"
                    className={`${styles.socialLink} focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black rounded-md`}
                    aria-label={`Follow Leonardo AI on ${social.name} for latest updates and community content`}
                  >
                    <img 
                      src={isAPI ? API_CONFIG.imageBaseURL + social.url : social.src} 
                      alt={`${social.name} social media icon`}
                      loading="lazy"
                      decoding="async"
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div 
          className={styles.bottomSection}
          role="contentinfo"
        >
          <div className={styles.companyInfo}>
            <img 
              src={isAPI ? API_CONFIG.imageBaseURL + footer.logo.url : footer.logo.src} 
              alt={footer.logo.alt} 
              className={styles.logo}
              loading="lazy"
              decoding="async"
            />
            <p className={styles.companyDetails}>
              {footer.logoDescription}
            </p>
          </div>

          <nav 
            className={styles.legalLinks}
            aria-label="Legal links"
          >
            {footer.footer_links.map((link) => (
              <a 
                key={link.id} 
                href={link.href} 
                className={styles.legalLink}
                aria-label={link.title}
              >
                {link.title}
              </a>
            ))}
          </nav>

          <p className={styles.copyright}>
            {footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;