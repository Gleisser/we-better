import { useFooter } from '@/shared/hooks/useFooter';
import styles from './Footer.module.css';
import { API_CONFIG } from '@/core/config/api-config';
import { FOOTER_FALLBACK } from '@/utils/constants/fallback';
import { AppStore, MenuList } from '@/utils/types/footer';
import { TopLevelImage } from '@/utils/types/common/image';
import { useAssetPreload } from '@/shared/hooks/utils/useAssetPreload';
import { useErrorHandler } from '@/shared/hooks/utils/useErrorHandler';
import { useMemo } from 'react';

const Footer = (): JSX.Element => {
  // Initialize hooks
  const { data, isLoading: isDataLoading } = useFooter();
  const { handleError, isError, error } = useErrorHandler({
    fallbackMessage: 'Failed to load footer content',
  });

  // Determine content source
  const footer = data?.data || FOOTER_FALLBACK;
  const isAPI = data !== undefined;

  const imageUrls = useMemo(() => {
    if (!footer) return [];

    const urls: string[] = [];

    if (footer.logo) {
      urls.push(isAPI ? API_CONFIG.imageBaseURL + footer.logo.url : footer.logo.src);
    }

    footer.app_stores.forEach((store: AppStore) => {
      store.images.forEach(image => {
        urls.push(isAPI ? API_CONFIG.imageBaseURL + image.url : image.src);
      });
    });

    footer.social_medias[0].logos.forEach((social: TopLevelImage) => {
      urls.push(isAPI ? API_CONFIG.imageBaseURL + social.url : social.src);
    });

    return urls;
  }, [footer, isAPI]);

  useAssetPreload({
    urls: imageUrls,
    onError: handleError,
  });

  // Show loading state only during initial data fetch
  if (isDataLoading) {
    return (
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.loadingState} aria-busy="true">
            Loading footer content...
          </div>
        </div>
      </footer>
    );
  }

  // Show error state
  if (isError) {
    return (
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.errorState} role="alert">
            <p>{error?.message}</p>
            <button onClick={() => window.location.reload()} className={styles.retryButton}>
              Try Again
            </button>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.footerContent}>
        <div className={styles.topSection}>
          {/* Menu Links */}
          <nav className={styles.menuLinks} aria-label="Footer navigation">
            {footer.menu_lists.map((menu: MenuList) => (
              <div
                key={menu.Title}
                className={styles.linkColumn}
                role="region"
                aria-labelledby={`footer-menu-${menu.Title}`}
              >
                <div className={`${styles.categoryTitle}`} id={`footer-menu-${menu.Title}`}>
                  {menu.Title}
                </div>
                <ul className={styles.linkList}>
                  {menu.menu_links.map(link => (
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
            <div className={styles.getApp} role="region" aria-labelledby="app-downloads">
              <div className={styles.categoryTitle} id="app-downloads">
                Get the App
              </div>
              <div className={styles.storeButtons}>
                {footer.app_stores.map((appStore: AppStore) => (
                  <a
                    key={appStore.id}
                    href="#"
                    className={styles.storeLink}
                    aria-label={`Download WeBetter app from ${appStore.images[0].name} - Get access to AI tools on your mobile device`}
                  >
                    {/* Add your app store image or icon here */}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
