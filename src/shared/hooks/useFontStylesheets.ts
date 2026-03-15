import { useLayoutEffect } from 'react';

export const APP_FONT_STYLESHEET = '/fonts/styles/app-fonts.css';
export const AUTH_FONT_STYLESHEET = '/fonts/styles/auth-fonts.css';
export const DREAM_BOARD_FONT_STYLESHEET = '/fonts/styles/dream-board-fonts.css';
export const CUTOUT_WIDGET_FONT_STYLESHEET = '/fonts/styles/cutout-widget-fonts.css';

export const APP_FONT_PRELOADS = [
  '/fonts/google/inter/inter-latin-400-normal.woff2',
  '/fonts/google/inter/inter-latin-700-normal.woff2',
  '/fonts/google/plus-jakarta-sans/plus-jakarta-sans-latin-400-normal.woff2',
  '/fonts/google/plus-jakarta-sans/plus-jakarta-sans-latin-700-normal.woff2',
] as const;

export const AUTH_FONT_PRELOADS = [
  '/fonts/google/inter/inter-latin-400-normal.woff2',
  '/fonts/google/playfair-display/playfair-display-latin-700-normal.woff2',
] as const;

export const DREAM_BOARD_FONT_PRELOADS = [
  '/fonts/google/indie-flower/indie-flower-latin-400-normal.woff2',
  '/fonts/google/playfair-display/playfair-display-latin-700-normal.woff2',
] as const;

export const CUTOUT_WIDGET_FONT_PRELOADS = [
  '/fonts/google/moderustic/moderustic-latin-400-normal.woff2',
  '/fonts/google/suse/suse-latin-600-normal.woff2',
] as const;

const ensureStylesheet = (href: string): void => {
  if (document.head.querySelector(`link[data-font-stylesheet="${href}"]`)) {
    return;
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.setAttribute('data-font-stylesheet', href);
  document.head.appendChild(link);
};

const ensurePreload = (href: string): void => {
  if (document.head.querySelector(`link[data-font-preload="${href}"]`)) {
    return;
  }

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'font';
  link.type = 'font/woff2';
  link.href = href;
  link.crossOrigin = 'anonymous';
  link.setAttribute('data-font-preload', href);
  document.head.appendChild(link);
};

interface FontAssetOptions {
  preloads?: readonly string[];
  stylesheets: readonly string[];
}

export const useFontStylesheets = ({ preloads = [], stylesheets }: FontAssetOptions): void => {
  const preloadKey = preloads.join('|');
  const stylesheetKey = stylesheets.join('|');

  useLayoutEffect(() => {
    if (preloadKey !== '') {
      preloadKey.split('|').forEach(ensurePreload);
    }

    if (stylesheetKey === '') {
      return;
    }

    stylesheetKey.split('|').forEach(ensureStylesheet);
  }, [preloadKey, stylesheetKey]);
};
