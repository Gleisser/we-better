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
      floating: {
        quickInspiration: 'Quick Inspiration',
        aiAssistant: 'AI Assistant',
        collapseStories: 'Collapse stories',
        lifeCategories: {
          social: 'Social',
          health: 'Health',
          selfCare: 'Self Care',
          money: 'Money',
          family: 'Family',
          spirituality: 'Spirituality',
          relationship: 'Relationship',
          career: 'Career',
        },
      },
      aiChat: {
        title: 'AI Assistant',
        greeting: 'How can I help you today?',
        placeholder: 'Type your message...',
        send: 'Send',
        closeChat: 'Close chat',
      },
      widgets: {
        quote: {
          title: 'Quote of the day',
          shareQuote: 'Share quote',
          bookmarkQuote: 'Bookmark quote',
          removeBookmark: 'Remove bookmark',
          moreOptions: 'More options',
          quoteCopied: 'Quote copied to clipboard!',
          quoteBookmarked: 'Quote bookmarked!',
          learnMore: 'Learn more',
          bookRecommendations: 'Book recommendations',
          quickTakeaways: 'Quick takeaways',
          submitQuote: 'Submit a quote',
          reactToQuote: 'React to quote',
          getNewQuote: 'Get new quote',
          copyQuote: 'Copy quote',
          tryAgain: 'Try Again',
          failedToLoad: 'Failed to load quotes',
        },
        affirmation: {
          title: 'Daily Affirmation',
          iAffirm: 'I Affirm',
          loadingAffirmations: 'Loading affirmations...',
          failedToLoad: 'Failed to load affirmations for this category',
          tryAgain: 'Try Again',
          create: 'Create',
          edit: 'Edit',
          createCustom: 'Create custom affirmation',
          editPersonal: 'Edit personal affirmation',
          scrollLeft: 'Scroll categories left',
          scrollRight: 'Scroll categories right',
          deleteAffirmation: 'Delete affirmation',
          recordAffirmation: 'Record affirmation',
          stopRecording: 'Stop recording',
          setReminder: 'Set reminder',
          daysStreaking: 'Days streaking',
          bookmark: 'Bookmark',
          removeBookmark: 'Remove bookmark',
          bookmarkAffirmation: 'Bookmark affirmation',
          clearRecording: 'Clear recording',
          deletePersonalAffirmation: 'Delete Personal Affirmation',
          deleteConfirmMessage:
            'Are you sure you want to delete your personal affirmation? This action cannot be undone.',
          deletedSuccessfully: 'Personal affirmation deleted successfully',
          categories: {
            personal: 'Personal',
            beauty: 'Beauty',
            blessing: 'Blessing',
            gratitude: 'Gratitude',
            happiness: 'Happiness',
            health: 'Health',
            love: 'Love',
            money: 'Money',
            sleep: 'Sleep',
            spiritual: 'Spiritual',
          },
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
      floating: {
        quickInspiration: 'Inspiração Rápida',
        aiAssistant: 'Assistente IA',
        collapseStories: 'Recolher histórias',
        lifeCategories: {
          social: 'Social',
          health: 'Saúde',
          selfCare: 'Autocuidado',
          money: 'Dinheiro',
          family: 'Família',
          spirituality: 'Espiritualidade',
          relationship: 'Relacionamento',
          career: 'Carreira',
        },
      },
      aiChat: {
        title: 'Assistente IA',
        greeting: 'Como posso ajudá-lo hoje?',
        placeholder: 'Digite sua mensagem...',
        send: 'Enviar',
        closeChat: 'Fechar chat',
      },
      widgets: {
        quote: {
          title: 'Frase do dia',
          shareQuote: 'Compartilhar frase',
          bookmarkQuote: 'Favoritar frase',
          removeBookmark: 'Remover favorito',
          moreOptions: 'Mais opções',
          quoteCopied: 'Frase copiada para a área de transferência!',
          quoteBookmarked: 'Frase favoritada!',
          learnMore: 'Saber mais',
          bookRecommendations: 'Recomendações de livros',
          quickTakeaways: 'Resumos rápidos',
          submitQuote: 'Enviar uma frase',
          reactToQuote: 'Reagir à frase',
          getNewQuote: 'Nova frase',
          copyQuote: 'Copiar frase',
          tryAgain: 'Tentar Novamente',
          failedToLoad: 'Falha ao carregar frases',
        },
        affirmation: {
          title: 'Afirmação Diária',
          iAffirm: 'Eu Afirmo',
          loadingAffirmations: 'Carregando afirmações...',
          failedToLoad: 'Falha ao carregar afirmações para esta categoria',
          tryAgain: 'Tentar Novamente',
          create: 'Criar',
          edit: 'Editar',
          createCustom: 'Criar afirmação personalizada',
          editPersonal: 'Editar afirmação pessoal',
          scrollLeft: 'Rolar categorias para esquerda',
          scrollRight: 'Rolar categorias para direita',
          deleteAffirmation: 'Excluir afirmação',
          recordAffirmation: 'Gravar afirmação',
          stopRecording: 'Parar gravação',
          setReminder: 'Definir lembrete',
          daysStreaking: 'Dias em sequência',
          bookmark: 'Favoritar',
          removeBookmark: 'Remover favorito',
          bookmarkAffirmation: 'Favoritar afirmação',
          clearRecording: 'Limpar gravação',
          deletePersonalAffirmation: 'Excluir Afirmação Pessoal',
          deleteConfirmMessage:
            'Tem certeza de que deseja excluir sua afirmação pessoal? Esta ação não pode ser desfeita.',
          deletedSuccessfully: 'Afirmação pessoal excluída com sucesso',
          categories: {
            personal: 'Pessoal',
            beauty: 'Beleza',
            blessing: 'Bênção',
            gratitude: 'Gratidão',
            happiness: 'Felicidade',
            health: 'Saúde',
            love: 'Amor',
            money: 'Dinheiro',
            sleep: 'Sono',
            spiritual: 'Espiritual',
          },
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
