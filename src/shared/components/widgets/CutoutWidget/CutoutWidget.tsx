import type { CSSProperties } from 'react';
import { useTheme } from '@/shared/hooks/useTheme';
import styles from './CutoutWidget.module.css';

const FEATURED_IMAGE =
  'https://images.unsplash.com/photo-1598601065215-751bf8798a2c?q=80&w=1883&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

const COLLABORATOR_AVATARS = [
  {
    src: 'https://plus.unsplash.com/premium_photo-1672115680958-54438df0ab82?q=80&w=1784&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Urban skyline at dawn',
  },
  {
    src: 'https://images.unsplash.com/photo-1600298882283-40b4dcb8b211?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Mountain range behind a calm lake',
  },
  {
    src: 'https://plus.unsplash.com/premium_photo-1667987781458-c45c1ad5dfe1?q=80&w=2051&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Sunset over the desert',
  },
  {
    src: 'https://images.unsplash.com/photo-1600298882698-312a4137fd33?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Forest pathway at dusk',
    countLabel: '50+',
  },
] as const;

const ArrowIcon = (): JSX.Element => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={styles.arrowIcon} aria-hidden="true">
    <path d="M5.293 5.293a1 1 0 011.414 0L18 16.586V9a1 1 0 112 0v10a1 1 0 01-1 1H9a1 1 0 110-2h7.586L5.293 6.707a1 1 0 010-1.414z" />
  </svg>
);

const CutoutWidget = (): JSX.Element => {
  const { currentTheme } = useTheme();
  const surfaceColor =
    currentTheme.mode === 'dark'
      ? currentTheme.colors.background.primary
      : currentTheme.colors.background.secondary;

  const cutoutStyles: CSSProperties = {
    '--cutout-surface': surfaceColor,
    '--cutout-floating-surface': surfaceColor,
    '--cutout-text': currentTheme.colors.text.primary,
    '--cutout-border': currentTheme.colors.border.primary,
    '--cutout-border-strong':
      currentTheme.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.18)'
        : currentTheme.colors.border.secondary,
    '--cutout-shadow':
      currentTheme.mode === 'dark'
        ? '0 18px 45px rgba(0, 0, 0, 0.55)'
        : '0 6px 18px rgba(15, 23, 42, 0.08)',
    '--cutout-avatar-overlay':
      currentTheme.mode === 'dark' ? 'rgba(0, 0, 0, 0.55)' : 'rgba(0, 0, 0, 0.25)',
    '--cutout-avatar-text': currentTheme.colors.text.inverse,
  };

  return (
    <div className={styles.cutoutWidget} style={cutoutStyles}>
      <div className={styles.card}>
        <div className={styles.cardInner}>
          <div className={styles.box}>
            <div className={styles.imgBox}>
              <img
                className={styles.image}
                src={FEATURED_IMAGE}
                alt="Panoramic view of a mountain skyline at sunrise"
                loading="lazy"
              />
            </div>

            <div className={styles.more}>
              <ul className={styles.avatarList}>
                {COLLABORATOR_AVATARS.map(avatar => (
                  <li key={avatar.src} className={styles.avatarItem}>
                    <img
                      className={styles.avatarImage}
                      src={avatar.src}
                      alt={avatar.alt}
                      loading="lazy"
                    />
                    {avatar.countLabel ? (
                      <span className={styles.avatarCount}>{avatar.countLabel}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
              <button type="button" aria-label="See more awesome views" className={styles.arrow}>
                <ArrowIcon />
              </button>
            </div>

            <div className={styles.tag}>
              <a href="#" className={styles.tagLink}>
                #Awesome views
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CutoutWidget;
