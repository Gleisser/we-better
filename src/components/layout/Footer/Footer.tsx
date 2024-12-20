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
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.topSection}>
          {/* Menu Links */}
          <div className={styles.menuLinks}>
            {footer.menu_lists.map((menu : MenuList) => (
              <div key={menu.Title} className={styles.linkColumn}>
                <h3 className={styles.categoryTitle}>{menu.Title}</h3>
                <ul className={styles.linkList}>
                  {menu.menu_links.map((link) => (
                    <li key={link.id + link.title}>
                      <a href={link.href} className={styles.link}>
                        {link.title}
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
                {footer.app_stores.map((appStore : AppStore) => (
                  <a key={appStore.id} href="#" className={styles.storeLink}>
                    <img src={isAPI ? API_CONFIG.imageBaseURL + appStore.images[0].url : appStore.images[0].src} alt={appStore.images[0].name} />
                  </a>
                ))}
              </div>
            </div>

            <div className={styles.social}>
              <h3 className={styles.categoryTitle}>Stay Tuned</h3>
              <div className={styles.socialIcons}>
                {footer.social_medias[0].logos.map((social : TopLevelImage) => (
                  <a 
                    key={social.id}
                    href="#"
                    className={styles.socialLink}
                    aria-label={social.name}
                  >
                    <img src={isAPI ? API_CONFIG.imageBaseURL + social.url : social.src} alt={social.name} />
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
              src={isAPI ? API_CONFIG.imageBaseURL + footer.logo.url : footer.logo.src} 
              alt={footer.logo.alt} 
              className={styles.logo}
            />
            <p className={styles.companyDetails}>
              {footer.logoDescription}
            </p>
          </div>

          <div className={styles.legalLinks}>
            {footer.footer_links.map((link) => (
              <a key={link.id} href={link.href} className={styles.legalLink}>{link.title}</a>
            ))}
          </div>

          <p className={styles.copyright}>
            {footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;