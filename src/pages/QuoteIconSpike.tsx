import { useState, type CSSProperties, type ReactNode } from 'react';
import { LottieLightIcon } from '@/shared/components/common/LottieLightIcon';
import { AnimatedWebPIcon } from '@/shared/components/common/AnimatedWebPIcon';
import {
  DreamBoardIcon,
  HomeIcon,
  LogoutIcon,
  RefreshIcon,
  SettingsIcon,
  SparklesIcon,
} from '@/shared/components/common/icons';
import {
  SafeBookmarkIcon,
  SafeShareIcon,
} from '@/shared/components/widgets/QuoteWidget/SafeAnimatedIcons';
import quoteWidgetStyles from '@/shared/components/widgets/QuoteWidget/QuoteWidget.module.css';
import shareLottie from '@/shared/components/widgets/QuoteWidget/icons/share.json';
import bookmarkLottie from '@/shared/components/widgets/QuoteWidget/icons/bookmark.json';
import refreshLottie from '@/shared/components/widgets/QuoteWidget/icons/refresh.json';
import clipboardLottie from '@/shared/components/widgets/QuoteWidget/icons/clipboard.json';
import sparklesLottie from '@/shared/components/widgets/CardsWidget/icons/sparkles.json';
import reminderWebP from '@/shared/components/widgets/CardsWidget/icons/reminder.webp';
import reminderIdleWebP from '@/shared/components/widgets/CardsWidget/icons/reminder-idle.webp';
import recordWebP from '@/shared/components/widgets/CardsWidget/icons/record.webp';
import recordIdleWebP from '@/shared/components/widgets/CardsWidget/icons/record-idle.webp';
import streakWebP from '@/shared/components/widgets/CardsWidget/icons/streak.webp';
import streakIdleWebP from '@/shared/components/widgets/CardsWidget/icons/streak-idle.webp';
import homeLottie from '@/shared/components/layout/Sidebar/icons/home.json';
import dreamboardLottie from '@/shared/components/layout/Sidebar/icons/dreamboard.json';
import settingsLottie from '@/shared/components/layout/Sidebar/icons/settings.json';
import logoutLottie from '@/shared/components/layout/Sidebar/icons/logout.json';
import likeWebP from '@/shared/components/widgets/QuoteWidget/icons/like.webp';
import likeIdleWebP from '@/shared/components/widgets/QuoteWidget/icons/like-idle.webp';
import favoriteWebP from '@/shared/components/widgets/CardsWidget/icons/favorite.webp';
import favoriteIdleWebP from '@/shared/components/widgets/CardsWidget/icons/favorite-idle.webp';

const shellStyle: CSSProperties = {
  minHeight: '100vh',
  padding: '48px 24px',
  background:
    'radial-gradient(circle at top, rgba(56, 189, 248, 0.14), transparent 42%), linear-gradient(180deg, #08101f 0%, #060d19 100%)',
  color: '#e2e8f0',
  fontFamily: "var(--font-plus-jakarta, 'Plus Jakarta Sans', sans-serif)",
};

const introStyle: CSSProperties = {
  maxWidth: 1120,
  margin: '0 auto 28px',
};

const gridStyle: CSSProperties = {
  maxWidth: 1120,
  margin: '0 auto',
  display: 'grid',
  gap: 24,
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
};

const cardStyle: CSSProperties = {
  padding: 28,
  borderRadius: 28,
  background: 'rgba(15, 23, 42, 0.72)',
  border: '1px solid rgba(148, 163, 184, 0.18)',
  boxShadow: '0 24px 60px rgba(2, 6, 23, 0.35)',
  display: 'grid',
  gap: 18,
};

const cardHeaderStyle: CSSProperties = {
  display: 'grid',
  gap: 6,
};

const headerStyle: CSSProperties = {
  margin: 0,
  fontSize: 'clamp(2rem, 4vw, 3rem)',
  lineHeight: 1.05,
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: '1.125rem',
};

const copyStyle: CSSProperties = {
  margin: 0,
  color: 'rgba(226, 232, 240, 0.72)',
  lineHeight: 1.5,
};

const buttonRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  flexWrap: 'wrap',
};

const replayButtonStyle: CSSProperties = {
  border: '1px solid rgba(148, 163, 184, 0.28)',
  borderRadius: 999,
  background: 'rgba(148, 163, 184, 0.12)',
  color: '#e2e8f0',
  padding: '10px 14px',
  cursor: 'pointer',
};

const notePanelStyle: CSSProperties = {
  ...cardStyle,
  gridColumn: '1 / -1',
};

const blockedGridStyle: CSSProperties = {
  display: 'grid',
  gap: 12,
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
};

type SafeIconId =
  | 'like'
  | 'favorite'
  | 'record'
  | 'reminder'
  | 'share'
  | 'bookmark'
  | 'refresh'
  | 'clipboard'
  | 'sparkles'
  | 'streak'
  | 'home'
  | 'dreamboard'
  | 'settings'
  | 'logout';

interface IconTileProps {
  actionLabel: string;
  animationData: object;
  colorOverride?: string;
  description: string;
  fallback: ReactNode;
  iconClassName?: string;
  replayKey: number | string;
  settleTo?: 'start' | 'end';
  title: string;
  onReplay: () => void;
}

const ClipboardFallbackIcon = (): JSX.Element => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 9V6.75A2.75 2.75 0 0 1 11.75 4h6.5A2.75 2.75 0 0 1 21 6.75v6.5A2.75 2.75 0 0 1 18.25 16H16"
    />
    <rect x="3" y="8" width="13" height="13" rx="2.75" strokeWidth={2} />
  </svg>
);

const IconTile = ({
  actionLabel,
  animationData,
  colorOverride = 'currentColor',
  description,
  fallback,
  iconClassName,
  replayKey,
  settleTo = 'start',
  title,
  onReplay,
}: IconTileProps): JSX.Element => (
  <article style={cardStyle}>
    <div style={cardHeaderStyle}>
      <h2 style={titleStyle}>{title}</h2>
      <p style={copyStyle}>{description}</p>
    </div>

    <div style={buttonRowStyle}>
      <button
        type="button"
        className={quoteWidgetStyles.actionButton}
        onClick={onReplay}
        aria-label={actionLabel}
      >
        <span className={`${quoteWidgetStyles.actionIcon} ${iconClassName ?? ''}`.trim()}>
          <LottieLightIcon
            animationData={animationData}
            className={quoteWidgetStyles.lottieLightIcon}
            colorOverride={colorOverride}
            replayKey={replayKey}
            settleTo={settleTo}
            fallback={fallback}
          />
        </span>
      </button>

      <button type="button" style={replayButtonStyle} onClick={onReplay}>
        Replay
      </button>
    </div>
  </article>
);

const blockedIcons = [
  {
    name: 'like',
    reason:
      'Original JSON is still blocked for lottie_light. The app now replays it as an animated WebP overlay over a static frame-0 poster.',
  },
  {
    name: 'favorite',
    reason:
      'Original JSON is still blocked for lottie_light. The app now replays it as an animated WebP overlay over a static frame-0 poster.',
  },
  {
    name: 'reminder',
    reason:
      'Original JSON is still blocked for lottie_light. The app now replays it as an animated WebP overlay over a static frame-0 poster.',
  },
  {
    name: 'record',
    reason:
      'Original JSON is still blocked for lottie_light. The app now replays it as an animated WebP overlay over a static frame-0 poster.',
  },
  {
    name: 'streak',
    reason:
      'Original JSON is still blocked for lottie_light. The app now replays it as an animated WebP overlay over a static frame-0 poster.',
  },
];

const QuoteIconSpike = (): JSX.Element => {
  const [replayKeys, setReplayKeys] = useState<Record<SafeIconId, number>>({
    like: 0,
    favorite: 0,
    record: 0,
    reminder: 0,
    share: 0,
    bookmark: 0,
    refresh: 0,
    clipboard: 0,
    sparkles: 0,
    streak: 0,
    home: 0,
    dreamboard: 0,
    settings: 0,
    logout: 0,
  });
  const [isBookmarked, setIsBookmarked] = useState(true);

  const replay = (iconId: SafeIconId): void => {
    setReplayKeys(previous => ({
      ...previous,
      [iconId]: previous[iconId] + 1,
    }));
  };

  return (
    <main style={shellStyle}>
      <div style={introStyle}>
        <h1 style={headerStyle}>Lottie Light CSP Audit</h1>
        <p style={copyStyle}>
          Public validation page for the official Airbnb <code>lottie_light</code> build under the
          production CSP. This page exercises the safe vector-only assets directly and leaves the
          expression-heavy files listed below out of the runtime path.
        </p>
      </div>

      <section style={gridStyle}>
        <article style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h2 style={titleStyle}>Like</h2>
            <p style={copyStyle}>
              The widget now uses the original animation as an animated WebP overlay, while the idle
              state comes from the original frame 0 poster.
            </p>
          </div>

          <div style={buttonRowStyle}>
            <button
              type="button"
              className={`${quoteWidgetStyles.actionButton} ${quoteWidgetStyles.gradientButton}`}
              onClick={() => replay('like')}
              aria-label="Replay like icon"
            >
              <span className={`${quoteWidgetStyles.actionIcon} ${quoteWidgetStyles.reactionIcon}`}>
                <AnimatedWebPIcon
                  className={quoteWidgetStyles.lottieLightIcon}
                  replayKey={replayKeys.like}
                  posterSrc={likeIdleWebP}
                  src={likeWebP}
                />
              </span>
            </button>

            <button type="button" style={replayButtonStyle} onClick={() => replay('like')}>
              Replay
            </button>
          </div>
        </article>

        <article style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h2 style={titleStyle}>Favorite</h2>
            <p style={copyStyle}>
              The widget now replays the original animation as an animated WebP overlay, while the
              idle state comes from the original frame 0 poster.
            </p>
          </div>

          <div style={buttonRowStyle}>
            <button
              type="button"
              className={`${quoteWidgetStyles.actionButton} ${quoteWidgetStyles.gradientButton} ${
                isBookmarked ? quoteWidgetStyles.hasReaction : ''
              }`}
              onClick={() => {
                setIsBookmarked(previous => !previous);
                replay('favorite');
              }}
              aria-label="Toggle favorite icon"
              aria-pressed={isBookmarked}
            >
              <span className={`${quoteWidgetStyles.actionIcon} ${quoteWidgetStyles.reactionIcon}`}>
                <AnimatedWebPIcon
                  className={quoteWidgetStyles.lottieLightIcon}
                  replayKey={replayKeys.favorite}
                  posterSrc={favoriteIdleWebP}
                  src={favoriteWebP}
                />
              </span>
            </button>

            <button type="button" style={replayButtonStyle} onClick={() => replay('favorite')}>
              Replay
            </button>
          </div>
        </article>

        <article style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h2 style={titleStyle}>Record</h2>
            <p style={copyStyle}>
              The idle icon now comes from the original frame 0 poster, while hover and replay use
              the animated WebP export.
            </p>
          </div>

          <div style={buttonRowStyle}>
            <button
              type="button"
              className={quoteWidgetStyles.actionButton}
              onClick={() => replay('record')}
              aria-label="Replay record icon"
            >
              <span className={quoteWidgetStyles.actionIcon}>
                <AnimatedWebPIcon
                  className={quoteWidgetStyles.lottieLightIcon}
                  replayKey={replayKeys.record}
                  posterSrc={recordIdleWebP}
                  src={recordWebP}
                />
              </span>
            </button>

            <button type="button" style={replayButtonStyle} onClick={() => replay('record')}>
              Replay
            </button>
          </div>
        </article>

        <article style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h2 style={titleStyle}>Reminder</h2>
            <p style={copyStyle}>
              The idle icon now comes from the original frame 0 poster, while hover and replay use
              the animated WebP export.
            </p>
          </div>

          <div style={buttonRowStyle}>
            <button
              type="button"
              className={quoteWidgetStyles.actionButton}
              onClick={() => replay('reminder')}
              aria-label="Replay reminder icon"
            >
              <span className={quoteWidgetStyles.actionIcon}>
                <AnimatedWebPIcon
                  className={quoteWidgetStyles.lottieLightIcon}
                  replayKey={replayKeys.reminder}
                  posterSrc={reminderIdleWebP}
                  src={reminderWebP}
                />
              </span>
            </button>

            <button type="button" style={replayButtonStyle} onClick={() => replay('reminder')}>
              Replay
            </button>
          </div>
        </article>

        <IconTile
          title="Share"
          description="Plain vector timeline. Replays from frame zero and settles back to the resting state."
          actionLabel="Replay share lottie"
          animationData={shareLottie}
          iconClassName={quoteWidgetStyles.safeShareWrapper}
          replayKey={replayKeys.share}
          fallback={<SafeShareIcon className={quoteWidgetStyles.safeShareReplay} />}
          onReplay={() => replay('share')}
        />

        <article style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h2 style={titleStyle}>Bookmark</h2>
            <p style={copyStyle}>
              Plain vector timeline. Replays and settles to the start or end frame based on saved
              state.
            </p>
          </div>

          <div style={buttonRowStyle}>
            <button
              type="button"
              className={`${quoteWidgetStyles.bookmarkButton} ${
                isBookmarked ? quoteWidgetStyles.bookmarked : ''
              }`}
              onClick={() => {
                setIsBookmarked(previous => !previous);
                replay('bookmark');
              }}
              aria-label="Toggle bookmark lottie"
              aria-pressed={isBookmarked}
            >
              <span className={`${quoteWidgetStyles.actionIcon} ${quoteWidgetStyles.bookmarkIcon}`}>
                <LottieLightIcon
                  animationData={bookmarkLottie}
                  className={quoteWidgetStyles.lottieLightIcon}
                  colorOverride="currentColor"
                  replayKey={`${replayKeys.bookmark}-${isBookmarked ? 'filled' : 'idle'}`}
                  settleTo={isBookmarked ? 'end' : 'start'}
                  fallback={
                    <SafeBookmarkIcon
                      className={quoteWidgetStyles.safeBookmarkReplay}
                      filled={isBookmarked}
                    />
                  }
                />
              </span>
            </button>

            <button type="button" style={replayButtonStyle} onClick={() => replay('bookmark')}>
              Replay
            </button>
          </div>
        </article>

        <IconTile
          title="Refresh"
          description="Vector-only quote refresh icon from the original asset set."
          actionLabel="Replay refresh lottie"
          animationData={refreshLottie}
          iconClassName={quoteWidgetStyles.refreshIcon}
          replayKey={replayKeys.refresh}
          fallback={<RefreshIcon />}
          onReplay={() => replay('refresh')}
        />

        <IconTile
          title="Clipboard"
          description="Vector-only clipboard animation from the quote actions."
          actionLabel="Replay clipboard lottie"
          animationData={clipboardLottie}
          replayKey={replayKeys.clipboard}
          fallback={<ClipboardFallbackIcon />}
          onReplay={() => replay('clipboard')}
        />

        <article style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h2 style={titleStyle}>Streak</h2>
            <p style={copyStyle}>
              The idle icon now comes from the original frame 0 poster, while hover and replay use
              the animated WebP export.
            </p>
          </div>

          <div style={buttonRowStyle}>
            <button
              type="button"
              className={quoteWidgetStyles.actionButton}
              onClick={() => replay('streak')}
              aria-label="Replay streak icon"
            >
              <span className={quoteWidgetStyles.actionIcon}>
                <AnimatedWebPIcon
                  className={quoteWidgetStyles.lottieLightIcon}
                  replayKey={replayKeys.streak}
                  posterSrc={streakIdleWebP}
                  src={streakWebP}
                />
              </span>
            </button>

            <button type="button" style={replayButtonStyle} onClick={() => replay('streak')}>
              Replay
            </button>
          </div>
        </article>

        <IconTile
          title="Sparkles"
          description="Vector-only sparkles asset still used for the create affirmation action."
          actionLabel="Replay sparkles lottie"
          animationData={sparklesLottie}
          replayKey={replayKeys.sparkles}
          fallback={<SparklesIcon />}
          onReplay={() => replay('sparkles')}
        />

        <IconTile
          title="Home"
          description="Vector-only sidebar navigation icon."
          actionLabel="Replay home lottie"
          animationData={homeLottie}
          replayKey={replayKeys.home}
          fallback={<HomeIcon />}
          onReplay={() => replay('home')}
        />

        <IconTile
          title="Dream Board"
          description="Vector-only sidebar navigation icon."
          actionLabel="Replay dream board lottie"
          animationData={dreamboardLottie}
          replayKey={replayKeys.dreamboard}
          fallback={<DreamBoardIcon />}
          onReplay={() => replay('dreamboard')}
        />

        <IconTile
          title="Settings"
          description="Vector-only sidebar navigation icon."
          actionLabel="Replay settings lottie"
          animationData={settingsLottie}
          replayKey={replayKeys.settings}
          fallback={<SettingsIcon />}
          onReplay={() => replay('settings')}
        />

        <IconTile
          title="Logout"
          description="Vector-only sidebar navigation icon."
          actionLabel="Replay logout lottie"
          animationData={logoutLottie}
          replayKey={replayKeys.logout}
          fallback={<LogoutIcon />}
          onReplay={() => replay('logout')}
        />

        <article style={notePanelStyle}>
          <div style={cardHeaderStyle}>
            <h2 style={titleStyle}>Blocked For CSP</h2>
            <p style={copyStyle}>
              These assets still rely on expressions and layer effects. They are not being mounted
              with <code>lottie_light</code> yet because that would be unreliable or would push us
              back toward a weaker CSP posture.
            </p>
          </div>

          <div style={blockedGridStyle}>
            {blockedIcons.map(icon => (
              <div key={icon.name} style={{ ...cardStyle, padding: 20, gap: 8 }}>
                <strong style={{ fontSize: '0.95rem', textTransform: 'capitalize' }}>
                  {icon.name}
                </strong>
                <p style={copyStyle}>{icon.reason}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
};

export default QuoteIconSpike;
