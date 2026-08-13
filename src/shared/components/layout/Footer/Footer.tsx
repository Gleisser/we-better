import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useFooter } from '@/shared/hooks/useFooter';
import styles from './Footer.module.css';
import { FOOTER_FALLBACK } from '@/utils/constants/fallback';
import { MenuList } from '@/utils/types/footer';
import { useErrorHandler } from '@/shared/hooks/utils/useErrorHandler';
import { useDeferredSectionQuery } from '@/shared/hooks/utils/useDeferredSectionQuery';

const LEGAL_LINKS = [
  { title: 'Privacidade', href: '/privacy' },
  { title: 'Termos', href: '/terms' },
  { title: 'Cookies', href: '/cookies' },
  { title: 'Suporte', href: '/support' },
  { title: 'Contato', href: '/contact' },
  { title: 'DMCA', href: '/dmca' },
  { title: 'Aviso legal', href: '/legal-notice' },
];

const resolveFooterHref = (title: string, href: string): string => {
  if (href && href !== '#') {
    return href;
  }

  return (
    {
      FAQ: '/faq',
      Support: '/support',
      Privacy: '/privacy',
      'Contact us': '/contact',
      'Terms of Service': '/terms',
      'Cookie Policy': '/cookies',
      DMCA: '/dmca',
      'Legal Notice': '/legal-notice',
    }[title] ?? '/'
  );
};

const Footer = (): JSX.Element => {
  const footerRef = useRef<HTMLElement | null>(null);
  const shouldFetch = useDeferredSectionQuery(footerRef);

  // Initialize hooks
  const { data, isLoading: isDataLoading } = useFooter({ enabled: shouldFetch });
  const { isError, error } = useErrorHandler({
    fallbackMessage: 'Failed to load footer content',
  });

  // Determine content source
  const footer = data?.data || FOOTER_FALLBACK;

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
    <footer ref={footerRef} className={styles.footer} role="contentinfo">
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
                      <Link
                        to={resolveFooterHref(link.title, link.href ?? '')}
                        className={`${styles.link} focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black rounded-md`}
                        aria-label={link.title}
                      >
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className={styles.bottomSection}>
          <nav className={styles.legalLinks} aria-label="Legal navigation">
            {LEGAL_LINKS.map(link => (
              <Link key={link.href} to={link.href} className={styles.legalLink}>
                {link.title}
              </Link>
            ))}
          </nav>
          <p className={styles.copyright}>{footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
