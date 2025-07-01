/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        'plus-jakarta': ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        theme: {
          bg: {
            primary: 'var(--theme-bg-primary)',
            secondary: 'var(--theme-bg-secondary)',
            tertiary: 'var(--theme-bg-tertiary)',
            elevated: 'var(--theme-bg-elevated)',
          },
          text: {
            primary: 'var(--theme-text-primary)',
            secondary: 'var(--theme-text-secondary)',
            muted: 'var(--theme-text-muted)',
            inverse: 'var(--theme-text-inverse)',
          },
          interactive: {
            primary: 'var(--theme-interactive-primary)',
            secondary: 'var(--theme-interactive-secondary)',
            accent: 'var(--theme-interactive-accent)',
            hover: 'var(--theme-interactive-hover)',
            active: 'var(--theme-interactive-active)',
            disabled: 'var(--theme-interactive-disabled)',
          },
          status: {
            success: 'var(--theme-status-success)',
            warning: 'var(--theme-status-warning)',
            error: 'var(--theme-status-error)',
            info: 'var(--theme-status-info)',
          },
          border: {
            primary: 'var(--theme-border-primary)',
            secondary: 'var(--theme-border-secondary)',
            muted: 'var(--theme-border-muted)',
            focus: 'var(--theme-border-focus)',
          },
        },
        primary: {
          blue: '#4267b2',
          purple: '#6f42c1',
        },
      },
      boxShadow: {
        'theme-sm': 'var(--theme-shadow-small)',
        'theme-md': 'var(--theme-shadow-medium)',
        'theme-lg': 'var(--theme-shadow-large)',
        'theme-xl': 'var(--theme-shadow-xlarge)',
        'theme-inner': 'var(--theme-shadow-inner)',
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(var(--tw-gradient-stops))',
        'theme-primary': 'var(--theme-gradient-primary)',
        'theme-secondary': 'var(--theme-gradient-secondary)',
        'theme-accent': 'var(--theme-gradient-accent)',
        'theme-background': 'var(--theme-gradient-background)',
        'theme-surface': 'var(--theme-gradient-surface)',
        'time-gradient':
          'linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-middle) 50%, var(--gradient-end) 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionProperty: {
        theme: 'background-color, border-color, color, box-shadow',
      },
      transitionTimingFunction: {
        theme: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        theme: '300ms',
      },
    },
  },
  plugins: [
    function ({ addUtilities, addComponents, theme }) {
      addUtilities({
        '.bg-theme-primary': {
          'background-color': 'var(--theme-bg-primary)',
        },
        '.bg-theme-secondary': {
          'background-color': 'var(--theme-bg-secondary)',
        },
        '.bg-theme-tertiary': {
          'background-color': 'var(--theme-bg-tertiary)',
        },
        '.bg-theme-elevated': {
          'background-color': 'var(--theme-bg-elevated)',
        },
        '.text-theme-primary': {
          color: 'var(--theme-text-primary)',
        },
        '.text-theme-secondary': {
          color: 'var(--theme-text-secondary)',
        },
        '.text-theme-muted': {
          color: 'var(--theme-text-muted)',
        },
        '.border-theme-primary': {
          'border-color': 'var(--theme-border-primary)',
        },
        '.border-theme-secondary': {
          'border-color': 'var(--theme-border-secondary)',
        },
        '.theme-transition': {
          transition: 'var(--theme-transition)',
        },
      });

      addComponents({
        '.card-theme': {
          'background-color': 'var(--theme-bg-elevated)',
          border: '1px solid var(--theme-border-primary)',
          'box-shadow': 'var(--theme-shadow-medium)',
          'border-radius': '0.75rem',
          transition: 'var(--theme-transition)',
        },
        '.button-theme': {
          'background-color': 'var(--theme-interactive-primary)',
          color: 'var(--theme-text-inverse)',
          border: 'none',
          'border-radius': '0.5rem',
          padding: '0.5rem 1rem',
          transition: 'var(--theme-transition)',
          '&:hover': {
            'background-color': 'var(--theme-interactive-hover)',
          },
          '&:active': {
            'background-color': 'var(--theme-interactive-active)',
          },
          '&:disabled': {
            'background-color': 'var(--theme-interactive-disabled)',
            cursor: 'not-allowed',
          },
        },
        '.input-theme': {
          'background-color': 'var(--theme-bg-secondary)',
          border: '1px solid var(--theme-border-primary)',
          color: 'var(--theme-text-primary)',
          'border-radius': '0.5rem',
          padding: '0.5rem 0.75rem',
          transition: 'var(--theme-transition)',
          '&:focus': {
            outline: 'none',
            'border-color': 'var(--theme-border-focus)',
            'box-shadow': '0 0 0 3px rgba(139, 92, 246, 0.1)',
          },
          '&::placeholder': {
            color: 'var(--theme-text-muted)',
          },
        },
      });
    },
  ],
};
