import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Define available languages
export const SUPPORTED_LANGUAGES = {
  en: {
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
  },
  pt: {
    name: 'Portuguese (Brazil)',
    nativeName: 'Português (Brasil)',
    flag: '🇧🇷',
  },
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

// Define translation resources inline
const resources = {
  en: {
    common: {
      greetings: {
        goodMorning: 'Good Morning',
        goodAfternoon: 'Good Afternoon',
        goodEvening: 'Good Evening',
        howAreYou: 'how are you?',
      },
      actions: {
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        create: 'Create',
        loading: 'Loading...',
        tryAgain: 'Try Again',
        close: 'Close',
        confirm: 'Confirm',
        back: 'Back',
        next: 'Next',
        finish: 'Finish',
        continue: 'Continue',
        submit: 'Submit',
      },
      navigation: {
        dashboard: 'Dashboard',
        dreamBoard: 'Dream Board',
        lifeWheel: 'Life Wheel',
        affirmations: 'Affirmations',
        settings: 'Settings',
        profile: 'Profile',
        logout: 'Logout',
      },
      header: {
        toggleTheme: 'Toggle theme',
        notifications: 'Notifications',
        profile: 'Profile',
        markAllAsRead: 'Mark all as read',
        viewAllNotifications: 'View all notifications',
        bookmarks: 'Bookmarks',
        signOut: 'Sign out',
        user: 'User',
      },
      notifications: {
        title: 'Notifications',
        tabs: {
          all: 'All',
          following: 'Following',
          archive: 'Archive',
        },
        actions: {
          followBack: 'Follow back',
          reply: 'Reply',
          view: 'View',
          viewThread: 'View thread',
          viewTask: 'View task',
          viewArticle: 'View article',
          viewBadge: 'View badge',
        },
      },
    },
    auth: {
      login: {
        title: 'Welcome Back',
        subtitle: 'Enter your email and password to access your account',
        email: 'Email',
        password: 'Password',
        signIn: 'Sign In',
        signingIn: 'Signing In...',
      },
    },
    errors: {
      general: {
        somethingWentWrong: 'Something went wrong',
        tryAgainLater: 'Please try again later',
      },
    },
  },
  pt: {
    common: {
      greetings: {
        goodMorning: 'Bom Dia',
        goodAfternoon: 'Boa Tarde',
        goodEvening: 'Boa Noite',
        howAreYou: 'como você está?',
      },
      actions: {
        save: 'Salvar',
        cancel: 'Cancelar',
        delete: 'Excluir',
        edit: 'Editar',
        create: 'Criar',
        loading: 'Carregando...',
        tryAgain: 'Tentar Novamente',
        close: 'Fechar',
        confirm: 'Confirmar',
        back: 'Voltar',
        next: 'Próximo',
        finish: 'Finalizar',
        continue: 'Continuar',
        submit: 'Enviar',
      },
      navigation: {
        dashboard: 'Painel',
        dreamBoard: 'Quadro dos Sonhos',
        lifeWheel: 'Roda da Vida',
        affirmations: 'Afirmações',
        settings: 'Configurações',
        profile: 'Perfil',
        logout: 'Sair',
      },
      header: {
        toggleTheme: 'Alternar tema',
        notifications: 'Notificações',
        profile: 'Perfil',
        markAllAsRead: 'Marcar todas como lidas',
        viewAllNotifications: 'Ver todas as notificações',
        bookmarks: 'Favoritos',
        signOut: 'Sair',
        user: 'Usuário',
      },
      notifications: {
        title: 'Notificações',
        tabs: {
          all: 'Todas',
          following: 'Seguindo',
          archive: 'Arquivo',
        },
        actions: {
          followBack: 'Seguir de volta',
          reply: 'Responder',
          view: 'Ver',
          viewThread: 'Ver conversa',
          viewTask: 'Ver tarefa',
          viewArticle: 'Ver artigo',
          viewBadge: 'Ver medalha',
        },
      },
    },
    auth: {
      login: {
        title: 'Bem-vindo de Volta',
        subtitle: 'Digite seu email e senha para acessar sua conta',
        email: 'E-mail',
        password: 'Senha',
        signIn: 'Entrar',
        signingIn: 'Entrando...',
      },
    },
    errors: {
      general: {
        somethingWentWrong: 'Algo deu errado',
        tryAgainLater: 'Tente novamente mais tarde',
      },
    },
  },
};

// Initialize i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // Default language settings
    fallbackLng: 'en',
    defaultNS: 'common',
    debug: import.meta.env.DEV, // Enable debug in development mode

    // Interpolation settings
    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // Language detection configuration
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'we-better-language',
    },

    // Supported languages whitelist
    supportedLngs: ['en', 'pt'],
    nonExplicitSupportedLngs: true,

    // Translation resources
    resources,

    // Namespace settings
    ns: ['common', 'auth', 'errors'],

    // React-specific options
    react: {
      useSuspense: false, // Disable suspense for now to avoid loading issues
    },

    // Additional options
    load: 'all', // Load all language variants including regions
    cleanCode: false, // Keep full language codes including regions

    // Translation missing key behavior
    saveMissing: import.meta.env.DEV, // Save missing keys in development
    missingKeyHandler: import.meta.env.DEV
      ? (lng, ns, key) => {
          console.warn(`Missing translation key: ${lng}.${ns}.${key}`);
        }
      : undefined,
  });

export default i18n;
