/**
 * INTERNATIONALIZATION (i18n) CONFIGURATION
 * =========================================
 *
 * This file contains the complete i18n setup for the WeBetter application.
 * All translations are defined inline in this TypeScript file for better type safety
 * and easier maintenance.
 *
 * IMPORTANT NOTES FOR DEVELOPERS:
 *
 * 1. **Translation Structure**:
 *    - All translations are organized by namespace (common, auth, errors)
 *    - Each namespace contains nested objects for logical grouping
 *    - Keys should be descriptive and follow camelCase convention
 *
 * 2. **Adding New Translations**:
 *    - Add keys to BOTH English (en) and Portuguese (pt) sections
 *    - Maintain the same structure in both languages
 *    - Test translations in both languages before committing
 *
 * 3. **Usage in Components**:
 *    - Use the useCommonTranslation hook: `const { t } = useCommonTranslation()`
 *    - Access nested keys with dot notation: `t('widgets.quote.title')`
 *    - For other namespaces, use: `const { t } = useTranslation('auth')`
 *
 * 4. **Language Support**:
 *    - Currently supports English (en) and Portuguese (pt-BR)
 *    - Language detection: localStorage → browser → HTML tag
 *    - Fallback language: English
 *
 * 5. **DO NOT**:
 *    - Create separate JSON files (they will be ignored)
 *    - Use hardcoded strings in components
 *    - Forget to add translations to both languages
 *
 * 6. **Widget Categories**:
 *    - Life Wheel categories are defined in widgets.lifeWheel.categories
 *    - Category names from backend are normalized and mapped to translation keys
 *    - Add new categories to both languages when backend adds them
 */

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
          modal: {
            createTitle: 'Create Personal Affirmation',
            updateTitle: 'Update Personal Affirmation',
            placeholder: 'Write your personal affirmation...',
            preview: 'Preview:',
            confirmReplace: 'This will replace your existing personal affirmation. Continue?',
            cancel: 'Cancel',
            save: 'Save',
            yesReplace: 'Yes, Replace',
          },
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
        lifeWheel: {
          title: 'Life Wheel',
          loading: 'Loading life wheel data...',
          goToDetails: 'Go to Life Wheel details',
          viewAnalysis: 'View Detailed Analysis',
          categoryScore: 'score:', // Used in tooltip: "{category} score: {value}"
          categories: {
            health: 'Health',
            career: 'Career',
            money: 'Money',
            family: 'Family',
            relationship: 'Relationship',
            social: 'Social',
            spirituality: 'Spirituality',
            selfCare: 'Self Care',
            personal: 'Personal',
            education: 'Education',
            recreation: 'Recreation',
            environment: 'Environment',
            community: 'Community',
            finances: 'Finances',
            personalGrowth: 'Personal Growth',
          },
        },
        habits: {
          title: 'Daily Habits',
          loading: 'Loading habits...',
          errorLoading: 'Error loading habits',
          tryAgain: 'Try Again',
          emptyState: 'No habits found. Create your first habit to get started!',
          createHabit: 'Create Habit',
          addNew: 'Add new habit',
          expandWidget: 'Expand habits widget',
          collapseWidget: 'Collapse habits widget',
          expandHabit: 'Expand habit',
          collapseHabit: 'Collapse habit',
          setStatusTooltip: 'Click to set status',
          setStatusFor: 'Set status for {{day}}',
          streakDays: '{{count}} days',
          categories: {
            all: 'All',
            health: 'Health',
            growth: 'Growth',
            lifestyle: 'Lifestyle',
            custom: 'Custom',
          },
          statuses: {
            completed: 'Completed',
            sick: 'Sick/Unwell',
            weather: 'Weather',
            travel: 'Travel/Away',
            partial: 'Partial',
            rescheduled: 'Rescheduled',
            half: 'Half Done',
            medical: 'Medical',
            break: 'Break',
            event: 'Event',
            rest: 'Rest Day',
          },
          form: {
            newHabit: 'New Habit',
            editHabit: 'Edit Habit',
            name: 'Name',
            category: 'Category',
            placeholder: 'e.g., Morning Meditation',
            createButton: 'Create Habit',
            saveButton: 'Save Changes',
          },
          monthlyView: {
            streakLabel: '{{count}} days',
            completedLegend: 'Completed',
            missedLegend: 'Missed',
            weekdays: {
              mon: 'Mon',
              tue: 'Tue',
              wed: 'Wed',
              thu: 'Thu',
              fri: 'Fri',
              sat: 'Sat',
              sun: 'Sun',
            },
          },
          actions: {
            edit: 'Edit',
            delete: 'Delete',
          },
        },
        goals: {
          title: 'Goals Tracking',
          loading: 'Loading goals...',
          errorLoading: 'Error loading goals',
          tryAgain: 'Try Again',
          addNew: 'Add new goal',
          expandWidget: 'Expand goals widget',
          collapseWidget: 'Collapse goals widget',
          emptyState: {
            all: 'No goals found. Create your first goal to get started!',
            category: 'No {{category}} goals found.',
            createButton: 'Create Goal',
          },
          loadMore: 'Load More',
          categories: {
            all: 'All',
            learning: 'Learning',
            fitness: 'Fitness',
            career: 'Career',
            personal: 'Personal',
          },
          progress: {
            increase: 'Increase progress',
            decrease: 'Decrease progress',
            percentage: '{{progress}}% complete',
          },
          form: {
            newGoal: 'New Goal',
            editGoal: 'Edit Goal',
            title: 'Goal Title',
            titlePlaceholder: 'Enter your goal title...',
            category: 'Category',
            targetDate: 'Target Date',
            targetDatePlaceholder: 'Select target date',
            milestones: 'Milestones',
            milestonesDescription: 'Break down your goal into smaller, achievable milestones',
            addMilestone: 'Add Milestone',
            milestonePlaceholder: 'Enter milestone...',
            createButton: 'Create Goal',
            saveButton: 'Save Changes',
            cancel: 'Cancel',
          },
          milestones: {
            completed: 'Completed',
            pending: 'Pending',
            edit: 'Edit milestone',
            delete: 'Delete milestone',
            save: 'Save',
            cancel: 'Cancel',
            count: 'milestones',
          },
          reviewSettings: {
            title: 'Review Settings',
            frequency: 'Review Frequency',
            notifications: 'Notifications',
            reminderSettings: 'Reminder Settings',
            frequencies: {
              daily: 'Daily',
              weekly: 'Weekly',
              monthly: 'Monthly',
            },
            notificationTypes: {
              email: 'Email',
              sms: 'SMS',
              push: 'Push Notification',
            },
            reminderText: 'Start reminding me',
            reminderOptions: {
              1: '1 day',
              3: '3 days',
              7: '1 week',
            },
            beforeReview: 'before review date',
            closeSettings: 'Close settings',
            saveChanges: 'Save Changes',
          },
          review: {
            nextReview: 'Next review: {{date}}',
            completeReview: 'Complete Review',
            reviewCompleted: 'Review complete! Next review: {{date}}',
            failedToComplete: 'Failed to complete review',
          },
          reviewTimer: {
            label: 'Goals Review',
            overdue: 'Overdue by {{count}} day',
            overdue_plural: 'Overdue by {{count}} days',
            dueToday: 'Due Today',
            tomorrow: 'Tomorrow',
            inDays: 'in {{count}} days',
            clickToComplete: 'Click to complete review',
          },
          actions: {
            edit: 'Edit',
            delete: 'Delete',
          },
          confirmDelete: {
            title: 'Delete Goal',
            message: 'Are you sure you want to delete this goal? This action cannot be undone.',
            cancel: 'Cancel',
            delete: 'Delete',
            closeModal: 'Close modal',
          },
          toasts: {
            goalCreated: 'New goal created successfully!',
            goalUpdated: 'Goal updated successfully!',
            goalDeleted: 'Goal deleted successfully',
            reviewCompleted: 'Review complete! Next review: {{date}}',
            failedToCreate: 'Failed to create goal',
            failedToUpdate: 'Failed to update goal',
            failedToDelete: 'Failed to delete goal',
            failedToComplete: 'Failed to complete review',
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
          modal: {
            createTitle: 'Criar Afirmação Pessoal',
            updateTitle: 'Atualizar Afirmação Pessoal',
            placeholder: 'Escreva sua afirmação pessoal...',
            preview: 'Visualização:',
            confirmReplace: 'Isso substituirá sua afirmação pessoal existente. Continuar?',
            cancel: 'Cancelar',
            save: 'Salvar',
            yesReplace: 'Sim, Substituir',
          },
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
        lifeWheel: {
          title: 'Roda da Vida',
          loading: 'Carregando dados da roda da vida...',
          goToDetails: 'Ir para detalhes da Roda da Vida',
          viewAnalysis: 'Ver Análise Detalhada',
          categoryScore: 'pontuação:', // Used in tooltip: "{category} pontuação: {value}"
          categories: {
            health: 'Saúde',
            career: 'Carreira',
            money: 'Dinheiro',
            family: 'Família',
            relationship: 'Relacionamento',
            social: 'Social',
            spirituality: 'Espiritualidade',
            selfCare: 'Autocuidado',
            personal: 'Pessoal',
            education: 'Educação',
            recreation: 'Recreação',
            environment: 'Ambiente',
            community: 'Comunidade',
            finances: 'Finanças',
            personalGrowth: 'Crescimento Pessoal',
          },
        },
        habits: {
          title: 'Hábitos Diários',
          loading: 'Carregando hábitos...',
          errorLoading: 'Erro ao carregar hábitos',
          tryAgain: 'Tentar Novamente',
          emptyState: 'Nenhum hábito encontrado. Crie seu primeiro hábito para começar!',
          createHabit: 'Criar Hábito',
          addNew: 'Adicionar novo hábito',
          expandWidget: 'Expandir widget de hábitos',
          collapseWidget: 'Recolher widget de hábitos',
          expandHabit: 'Expandir hábito',
          collapseHabit: 'Recolher hábito',
          setStatusTooltip: 'Clique para definir status',
          setStatusFor: 'Definir status para {{day}}',
          streakDays: '{{count}} dias',
          categories: {
            all: 'Todos',
            health: 'Saúde',
            growth: 'Crescimento',
            lifestyle: 'Lifestyle',
            custom: 'Personalizado',
          },
          statuses: {
            completed: 'Completo',
            sick: 'Doente/Desconfortável',
            weather: 'Tempo',
            travel: 'Viagem/Ausente',
            partial: 'Parcial',
            rescheduled: 'Reagendado',
            half: 'Metade Feita',
            medical: 'Médico',
            break: 'Intervalo',
            event: 'Evento',
            rest: 'Dia de Descanso',
          },
          form: {
            newHabit: 'Novo Hábito',
            editHabit: 'Editar Hábito',
            name: 'Nome',
            category: 'Categoria',
            placeholder: 'e.g., Meditação Matinal',
            createButton: 'Criar Hábito',
            saveButton: 'Salvar Alterações',
          },
          monthlyView: {
            streakLabel: '{{count}} dias',
            completedLegend: 'Completo',
            missedLegend: 'Perdido',
            weekdays: {
              mon: 'Seg',
              tue: 'Ter',
              wed: 'Qua',
              thu: 'Qui',
              fri: 'Sex',
              sat: 'Sáb',
              sun: 'Dom',
            },
          },
          actions: {
            edit: 'Editar',
            delete: 'Excluir',
          },
        },
        goals: {
          title: 'Rastreamento de Metas',
          loading: 'Carregando metas...',
          errorLoading: 'Erro ao carregar metas',
          tryAgain: 'Tentar Novamente',
          addNew: 'Adicionar nova meta',
          expandWidget: 'Expandir widget de metas',
          collapseWidget: 'Recolher widget de metas',
          emptyState: {
            all: 'Nenhuma meta encontrada. Crie sua primeira meta para começar!',
            category: 'Nenhuma meta de {{category}} encontrada.',
            createButton: 'Criar Meta',
          },
          loadMore: 'Carregar Mais',
          categories: {
            all: 'Todas',
            learning: 'Aprendizado',
            fitness: 'Fitness',
            career: 'Carreira',
            personal: 'Pessoal',
          },
          progress: {
            increase: 'Aumentar progresso',
            decrease: 'Diminuir progresso',
            percentage: '{{progress}}% completo',
          },
          form: {
            newGoal: 'Nova Meta',
            editGoal: 'Editar Meta',
            title: 'Título da Meta',
            titlePlaceholder: 'Digite o título da sua meta...',
            category: 'Categoria',
            targetDate: 'Data Alvo',
            targetDatePlaceholder: 'Selecionar data alvo',
            milestones: 'Marcos',
            milestonesDescription: 'Divida sua meta em marcos menores e alcançáveis',
            addMilestone: 'Adicionar Marco',
            milestonePlaceholder: 'Digite o marco...',
            createButton: 'Criar Meta',
            saveButton: 'Salvar Alterações',
            cancel: 'Cancelar',
          },
          milestones: {
            completed: 'Completo',
            pending: 'Pendente',
            edit: 'Editar marco',
            delete: 'Excluir marco',
            save: 'Salvar',
            cancel: 'Cancelar',
            count: 'marcos',
          },
          reviewSettings: {
            title: 'Configurações de Revisão',
            frequency: 'Frequência de Revisão',
            notifications: 'Notificações',
            reminderSettings: 'Configurações de Lembrete',
            frequencies: {
              daily: 'Diário',
              weekly: 'Semanal',
              monthly: 'Mensal',
            },
            notificationTypes: {
              email: 'E-mail',
              sms: 'SMS',
              push: 'Notificação Push',
            },
            reminderText: 'Começar a me lembrar',
            reminderOptions: {
              1: '1 dia',
              3: '3 dias',
              7: '1 semana',
            },
            beforeReview: 'antes da data de revisão',
            closeSettings: 'Fechar configurações',
            saveChanges: 'Salvar Alterações',
          },
          review: {
            nextReview: 'Próxima revisão: {{date}}',
            completeReview: 'Completar Revisão',
            reviewCompleted: 'Revisão completa! Próxima revisão: {{date}}',
            failedToComplete: 'Falha ao completar revisão',
          },
          reviewTimer: {
            label: 'Revisão de Metas',
            overdue: 'Atrasado há {{count}} dia',
            overdue_plural: 'Atrasado há {{count}} dias',
            dueToday: 'Vence Hoje',
            tomorrow: 'Amanhã',
            inDays: 'em {{count}} dias',
            clickToComplete: 'Clique para completar revisão',
          },
          actions: {
            edit: 'Editar',
            delete: 'Excluir',
          },
          confirmDelete: {
            title: 'Excluir Meta',
            message:
              'Tem certeza de que deseja excluir esta meta? Esta ação não pode ser desfeita.',
            cancel: 'Cancelar',
            delete: 'Excluir',
            closeModal: 'Fechar modal',
          },
          toasts: {
            goalCreated: 'Nova meta criada com sucesso!',
            goalUpdated: 'Meta atualizada com sucesso!',
            goalDeleted: 'Meta excluída com sucesso',
            reviewCompleted: 'Revisão completa! Próxima revisão: {{date}}',
            failedToCreate: 'Falha ao criar meta',
            failedToUpdate: 'Falha ao atualizar meta',
            failedToDelete: 'Falha ao excluir meta',
            failedToComplete: 'Falha ao completar revisão',
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
    debug: process.env.NODE_ENV === 'development', // Enable debug in development mode

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
    saveMissing: process.env.NODE_ENV === 'development', // Save missing keys in development
    missingKeyHandler:
      process.env.NODE_ENV === 'development'
        ? (lng, ns, key) => {
            console.warn(`Missing translation key: ${lng}.${ns}.${key}`);
          }
        : undefined,
  });

export default i18n;
