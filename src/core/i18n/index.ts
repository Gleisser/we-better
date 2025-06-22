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
            createCategoryButton: 'Create {{category}} Goal',
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
      dreamBoard: {
        title: 'Dream Board',
        tabs: {
          visionBoard: 'Vision Board',
          experience: 'Experience',
          insights: 'Insights',
        },
        emptyState: {
          title: 'Create Your Dream Board',
          description:
            'Welcome to your dream journey! Start by creating your personal dream board. Visualize your aspirations, track your progress, and turn your dreams into reality.',
          createButton: 'Create Dream Board',
        },
        loading: {
          dreamBoard: 'Loading your dream board...',
          saving: 'Saving your dream board...',
        },
        errors: {
          loadFailed: 'Failed to load your dream board. Please try again.',
          saveFailed: 'Failed to save dream board. Please try again.',
          deleteFailed: 'Failed to delete dream board. Please try again.',
        },
        milestones: {
          deleteConfirm: 'Are you sure you want to delete this milestone?',
          noDateSet: 'No date set',
          manageTitle: 'Manage Milestones: {{dreamTitle}}',
          closePopup: 'Close popup',
          progressSummary:
            "You've completed {{completed}} of {{total}} milestones ({{percentage}}% complete)",
          tabs: {
            timeline: 'Timeline View',
            chart: 'Progress Chart',
            achievements: 'Achievements',
          },
          timeline: {
            title: 'Milestone Timeline',
            noDates:
              'No milestone dates set. Add target dates to your milestones to see a timeline.',
            goal: 'Goal',
            goalCompletion: 'Goal Completion',
            scrollLeft: 'Scroll timeline left',
            scrollRight: 'Scroll timeline right',
          },
          chart: {
            title: 'Progress Chart',
            loading: 'Loading progress chart...',
            error: 'Error loading chart: {{error}}',
            noMilestones:
              'No milestones available yet. Add some milestones to see your progress chart.',
          },
          achievements: {
            title: 'Achievements',
            badges: {
              firstStep: {
                title: 'First Step',
                description: 'Completed your first milestone',
              },
              halfwayThere: {
                title: 'Halfway There',
                description: 'Reached 50% completion',
              },
              wellPlanned: {
                title: 'Well Planned',
                description: 'Set target dates for all milestones',
              },
              dreamAchieved: {
                title: 'Dream Achieved',
                description: 'Completed all milestones',
              },
            },
          },
          form: {
            addTitle: 'Add New Milestone',
            editTitle: 'Edit Milestone',
            closeForm: 'Close form',
            titleLabel: 'Title (required)',
            descriptionLabel: 'Description (optional)',
            targetDateLabel: 'Target Date',
            cancel: 'Cancel',
            addButton: 'Add Milestone',
            saveButton: 'Save Changes',
          },
          list: {
            title: 'Milestones',
            addButton: '+ Add Milestone',
            editMilestone: 'Edit milestone',
            deleteMilestone: 'Delete milestone',
            emptyState: 'No milestones added yet. Add your first milestone to track progress!',
          },
          history: {
            title: 'Milestone History',
            deletedMilestone: 'Deleted milestone',
          },
        },
        deleteConfirm: {
          title: 'Delete Dream Board',
          message:
            'Are you sure you want to delete your dream board? This action cannot be undone.',
        },
        weather: {
          title: 'Dream Weather',
          states: {
            sunny: 'Sunny',
            cloudy: 'Cloudy',
            stormy: 'Stormy',
            raining: 'Raining',
            unknown: 'Unknown',
          },
          altText: '{{weather}} weather',
        },
        challenge: {
          title: 'Challenge Mode',
          newChallenge: 'New Challenge',
          loading: 'Loading challenges...',
          errorLoading: 'Error loading challenges: {{error}}',
          noActiveChallenges: 'No active challenges. Start a new one!',
          deleteConfirm:
            'Are you sure you want to delete this challenge? This action cannot be undone.',
          actions: {
            markComplete: 'Mark Today Complete',
            undoComplete: 'Undo Today Complete',
            editChallenge: 'Edit Challenge',
            deleteChallenge: 'Delete Challenge',
            previousChallenge: 'Previous challenge',
            nextChallenge: 'Next challenge',
          },
          progress: {
            dayOf: 'Day {{current}} of {{total}}',
            totalDays: 'Total: {{days}} days',
          },
          carousel: {
            counter: '{{current}} / {{total}}',
          },
          modal: {
            createTitle: 'Create New Challenge',
            editTitle: 'Edit Challenge',
            close: 'Close modal',
            sections: {
              basicInfo: 'Basic Information',
              durationDifficulty: 'Duration & Difficulty',
              frequency: 'Frequency',
              connectRemind: 'Connect & Remind',
            },
            form: {
              challengeTitle: 'Challenge Title',
              titlePlaceholder: '30-Day Meditation Challenge',
              description: 'Description',
              descriptionPlaceholder:
                'Meditate for 10 minutes each day to build a consistent practice',
              duration: 'Duration',
              difficultyLevel: 'Difficulty Level',
              selectDays: 'Select Days',
              linkToDream: 'Link to Dream (Optional)',
              enableReminders: 'Enable Daily Reminders',
              none: 'None',
            },
            units: {
              days: 'Days',
              weeks: 'Weeks',
              months: 'Months',
            },
            difficulty: {
              easy: 'Easy',
              medium: 'Medium',
              hard: 'Hard',
            },
            frequency: {
              daily: 'Daily',
              weekly: 'Weekly',
              custom: 'Custom',
            },
            weekDays: {
              mon: 'Mon',
              tue: 'Tue',
              wed: 'Wed',
              thu: 'Thu',
              fri: 'Fri',
              sat: 'Sat',
              sun: 'Sun',
            },
            tips: {
              daily: 'Daily challenges help build consistent habits and routines.',
              weekly:
                'Weekly challenges are great for activities that require more time or preparation.',
              custom:
                'Custom scheduling gives you flexibility to fit challenges around your existing commitments.',
            },
            buttons: {
              cancel: 'Cancel',
              create: 'Create Challenge',
              update: 'Update Challenge',
            },
          },
        },
        progress: {
          title: 'Dream Progress',
          loading: 'Loading...',
          milestonesCompleted: '{{completed}} of {{total}} milestones completed',
          manageMilestones: 'Manage Milestones',
        },
        quickVision: {
          title: 'Quick Vision',
          myDreamBoard: 'My Dream Board',
          expand: 'Expand',
          minimize: 'Minimize',
          errorLoading: 'Error: {{error}}',
          decreaseProgress: 'Decrease progress',
          increaseProgress: 'Increase progress',
          scrollToSeeMore: 'Scroll to see more dreams',
        },
        board: {
          title: 'Vision Board',
          defaultTitle: 'My Dream Board',
          defaultDescription: 'Visualize • Believe • Achieve',
          loading: 'Loading your dream board...',
          errorTitle: 'Something went wrong',
          retry: 'Retry',
          saved: 'Dream board saved successfully!',
          failedToSave: 'Failed to save dream board',
          errorSaving: 'An error occurred while saving',
          imageLimit: 'You can only add up to 7 images to your dream board.',
          introScreen: {
            title: 'Welcome to Your Vision Board',
            description:
              'Visualize your goals and aspirations based on your Life Wheel assessment. Create a personalized space that inspires and motivates you to achieve your dreams.',
            steps: {
              addContent: {
                title: 'Add Content',
                description:
                  'Add images, text, and audio to represent your goals in each Life Wheel category.',
              },
              trackGoals: {
                title: 'Track Goals',
                description:
                  'Mark items as goals and track your progress as you work towards achieving them.',
              },
              customize: {
                title: 'Customize',
                description:
                  'Change the theme, arrange items, and personalize your vision board to reflect your style.',
              },
              saveShare: {
                title: 'Save & Share',
                description:
                  'Save your vision board to track progress over time and share it with trusted friends.',
              },
            },
            getStarted: 'Get Started',
          },
          toolbar: {
            modes: {
              add: 'Add',
              filter: 'Filter',
              arrange: 'Arrange',
            },
            tooltips: {
              addContent: 'Add Content',
              filterContent: 'Filter Content',
              arrangeContent: 'Arrange Content',
              uploadImage: 'Upload Image',
              showAll: 'Show All Categories',
              showCategory: 'Show {{category}} Items',
              autoArrange: 'Auto Arrange',
              save: 'Save Vision Board',
              delete: 'Delete Dream Board',
            },
            buttons: {
              uploadPhoto: 'Upload Photo',
              all: 'All',
              autoArrange: 'Auto Arrange',
              save: 'Save',
              saving: 'Saving...',
              delete: 'Delete',
            },
            imageLimitIndicator: '{{current}}/{{limit}}',
          },
          milestones: {
            title: 'Dream Milestones',
            description: 'Break down your dream into achievable steps',
            loading: 'Loading milestones...',
            errorLoading: 'Failed to load milestones',
            errorAdding: 'Failed to add milestone',
            errorUpdating: 'Failed to update milestone',
            errorDeleting: 'Failed to delete milestone',
            newMilestonePlaceholder: 'New milestone title...',
            addButton: 'Add',
            emptyState: 'No milestones yet. Add your first milestone to track progress!',
            dueDate: 'Due: {{date}}',
            deleteMilestone: 'Delete milestone',
          },
          dreamSymbols: {
            messages: {
              briefcase: 'Your career is a path to greatness. Keep striving for excellence!',
              money: 'Financial abundance is flowing into your life. Embrace wealth mindfully!',
              health: 'Health is true wealth. Nurture your body, mind, and spirit daily.',
              house: 'Your ideal home awaits. Create your perfect sanctuary and living space.',
              growth: 'Growth happens outside your comfort zone. Embrace change and challenges!',
              heart: 'Love deeply and authentically. Meaningful connections bring true joy.',
              recreation: 'Balance work with play. Leisure time recharges your creative energy!',
              meditation: 'Inner peace creates outer harmony. Take time for spiritual reflection.',
              graduation: 'Knowledge empowers. Continue learning throughout your entire life.',
              travel: 'Adventure awaits! New places bring fresh perspectives and memories.',
              cloud: 'Dream without limits. Your imagination creates your future reality!',
              trophy: 'Success is a journey of small wins. Celebrate each victory along the way!',
              default: 'Dream it, believe it, achieve it!',
            },
          },
          contentControls: {
            tabs: {
              position: 'Position',
              style: 'Style',
              milestones: 'Milestones',
            },
            fields: {
              title: 'Title',
              altText: 'Alt Text',
              altTextPlaceholder: 'Image description for accessibility',
              captionPlaceholder: 'Add a caption for this image...',
              xPosition: 'X Position',
              yPosition: 'Y Position',
              width: 'Width',
              height: 'Height',
              rotation: 'Rotation',
              category: 'Category',
              none: 'None',
            },
            buttons: {
              replaceImage: 'Replace Image',
              delete: 'Delete',
              cancel: 'Cancel',
            },
            contentTypes: {
              image: 'Image',
              item: 'Item',
            },
            edit: 'Edit {{type}}',
            deleteConfirmation: {
              title: 'Delete Item',
              message:
                'Are you sure you want to delete this {{type}}? This action cannot be undone.',
            },
            noStylingOptions: 'No styling options available',
          },
        },
        categories: {
          title: 'Dream Categories',
          clearFilter: 'Clear Filter',
          errorLoading: 'Error loading progress: {{error}}',
          dreamCount: {
            single: 'dream',
            plural: 'dreams',
          },
          expandedContent: {
            dreamsHeader: 'Dreams',
            moreDreams: '+{{count}} more dreams',
            emptyState: 'No dreams in this category yet',
          },
          names: {
            travel: 'Travel',
            skills: 'Skills',
            finance: 'Finance',
            finances: 'Finances',
            health: 'Health',
            relationships: 'Relationships',
            career: 'Career',
            education: 'Education',
            spirituality: 'Spirituality',
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
            createCategoryButton: 'Criar Meta de {{category}}',
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
      dreamBoard: {
        title: 'Quadro dos Sonhos',
        tabs: {
          visionBoard: 'Quadro de Visão',
          experience: 'Experiência',
          insights: 'Insights',
        },
        emptyState: {
          title: 'Crie Seu Quadro dos Sonhos',
          description:
            'Bem-vindo à sua jornada dos sonhos! Comece criando seu quadro dos sonhos pessoal. Visualize suas aspirações, acompanhe seu progresso e transforme seus sonhos em realidade.',
          createButton: 'Criar Quadro dos Sonhos',
        },
        loading: {
          dreamBoard: 'Carregando seu quadro dos sonhos...',
          saving: 'Salvando seu quadro dos sonhos...',
        },
        errors: {
          loadFailed: 'Falha ao carregar seu quadro dos sonhos. Tente novamente.',
          saveFailed: 'Falha ao salvar quadro dos sonhos. Tente novamente.',
          deleteFailed: 'Falha ao excluir quadro dos sonhos. Tente novamente.',
        },
        milestones: {
          deleteConfirm: 'Tem certeza de que deseja excluir este marco?',
          noDateSet: 'Nenhuma data definida',
          manageTitle: 'Gerenciar Marcos: {{dreamTitle}}',
          closePopup: 'Fechar popup',
          progressSummary:
            'Você completou {{completed}} de {{total}} marcos ({{percentage}}% completo)',
          tabs: {
            timeline: 'Visão Cronológica',
            chart: 'Gráfico de Progresso',
            achievements: 'Conquistas',
          },
          timeline: {
            title: 'Cronograma dos Marcos',
            noDates:
              'Nenhuma data de marco definida. Adicione datas aos seus marcos para ver uma cronologia.',
            goal: 'Meta',
            goalCompletion: 'Conclusão da Meta',
            scrollLeft: 'Rolar cronologia para esquerda',
            scrollRight: 'Rolar cronologia para direita',
          },
          chart: {
            title: 'Gráfico de Progresso',
            loading: 'Carregando gráfico de progresso...',
            error: 'Erro ao carregar gráfico: {{error}}',
            noMilestones:
              'Nenhum marco disponível ainda. Adicione alguns marcos para ver seu gráfico de progresso.',
          },
          achievements: {
            title: 'Conquistas',
            badges: {
              firstStep: {
                title: 'Primeiro Passo',
                description: 'Completou seu primeiro marco',
              },
              halfwayThere: {
                title: 'Na Metade do Caminho',
                description: 'Atingiu 50% de conclusão',
              },
              wellPlanned: {
                title: 'Bem Planejado',
                description: 'Definiu datas para todos os marcos',
              },
              dreamAchieved: {
                title: 'Sonho Alcançado',
                description: 'Completou todos os marcos',
              },
            },
          },
          form: {
            addTitle: 'Adicionar Novo Marco',
            editTitle: 'Editar Marco',
            closeForm: 'Fechar formulário',
            titleLabel: 'Título (obrigatório)',
            descriptionLabel: 'Descrição (opcional)',
            targetDateLabel: 'Data Alvo',
            cancel: 'Cancelar',
            addButton: 'Adicionar Marco',
            saveButton: 'Salvar Alterações',
          },
          list: {
            title: 'Marcos',
            addButton: '+ Adicionar Marco',
            editMilestone: 'Editar marco',
            deleteMilestone: 'Excluir marco',
            emptyState:
              'Nenhum marco adicionado ainda. Adicione seu primeiro marco para acompanhar o progresso!',
          },
          history: {
            title: 'Histórico de Marcos',
            deletedMilestone: 'Marco excluído',
          },
        },
        deleteConfirm: {
          title: 'Excluir Quadro dos Sonhos',
          message:
            'Tem certeza de que deseja excluir seu quadro dos sonhos? Esta ação não pode ser desfeita.',
        },
        weather: {
          title: 'Clima dos Sonhos',
          states: {
            sunny: 'Ensolarado',
            cloudy: 'Nublado',
            stormy: 'Tempestuoso',
            raining: 'Chuvoso',
            unknown: 'Desconhecido',
          },
          altText: 'Clima {{weather}}',
        },
        challenge: {
          title: 'Modo Desafio',
          newChallenge: 'Novo Desafio',
          loading: 'Carregando desafios...',
          errorLoading: 'Erro ao carregar desafios: {{error}}',
          noActiveChallenges: 'Nenhum desafio ativo. Comece um novo!',
          deleteConfirm:
            'Tem certeza de que deseja excluir este desafio? Esta ação não pode ser desfeita.',
          actions: {
            markComplete: 'Marcar Hoje Completo',
            undoComplete: 'Desfazer Hoje Completo',
            editChallenge: 'Editar Desafio',
            deleteChallenge: 'Excluir Desafio',
            previousChallenge: 'Desafio anterior',
            nextChallenge: 'Próximo desafio',
          },
          progress: {
            dayOf: 'Dia {{current}} de {{total}}',
            totalDays: 'Total: {{days}} dias',
          },
          carousel: {
            counter: '{{current}} / {{total}}',
          },
          modal: {
            createTitle: 'Criar Novo Desafio',
            editTitle: 'Editar Desafio',
            close: 'Fechar modal',
            sections: {
              basicInfo: 'Informações Básicas',
              durationDifficulty: 'Duração e Dificuldade',
              frequency: 'Frequência',
              connectRemind: 'Conectar e Lembrar',
            },
            form: {
              challengeTitle: 'Título do Desafio',
              titlePlaceholder: 'Desafio de Meditação de 30 Dias',
              description: 'Descrição',
              descriptionPlaceholder:
                'Meditar por 10 minutos todos os dias para construir uma prática consistente',
              duration: 'Duração',
              difficultyLevel: 'Nível de Dificuldade',
              selectDays: 'Selecionar Dias',
              linkToDream: 'Vincular ao Sonho (Opcional)',
              enableReminders: 'Ativar Lembretes Diários',
              none: 'Nenhum',
            },
            units: {
              days: 'Dias',
              weeks: 'Semanas',
              months: 'Meses',
            },
            difficulty: {
              easy: 'Fácil',
              medium: 'Médio',
              hard: 'Difícil',
            },
            frequency: {
              daily: 'Diário',
              weekly: 'Semanal',
              custom: 'Personalizado',
            },
            weekDays: {
              mon: 'Seg',
              tue: 'Ter',
              wed: 'Qua',
              thu: 'Qui',
              fri: 'Sex',
              sat: 'Sáb',
              sun: 'Dom',
            },
            tips: {
              daily: 'Desafios diários ajudam a construir hábitos e rotinas consistentes.',
              weekly:
                'Desafios semanais são ótimos para atividades que requerem mais tempo ou preparação.',
              custom:
                'O agendamento personalizado oferece flexibilidade para encaixar desafios em seus compromissos existentes.',
            },
            buttons: {
              cancel: 'Cancelar',
              create: 'Criar Desafio',
              update: 'Atualizar Desafio',
            },
          },
        },
        progress: {
          title: 'Progresso dos Sonhos',
          loading: 'Carregando...',
          milestonesCompleted: '{{completed}} de {{total}} marcos completados',
          manageMilestones: 'Gerenciar Marcos',
        },
        quickVision: {
          title: 'Visão Rápida',
          myDreamBoard: 'Meu Quadro dos Sonhos',
          expand: 'Expandir',
          minimize: 'Minimizar',
          errorLoading: 'Erro: {{error}}',
          decreaseProgress: 'Diminuir progresso',
          increaseProgress: 'Aumentar progresso',
          scrollToSeeMore: 'Role para ver mais sonhos',
        },
        board: {
          title: 'Quadro de Visão',
          defaultTitle: 'Meu Quadro dos Sonhos',
          defaultDescription: 'Visualize • Acredite • Conquiste',
          loading: 'Carregando seu quadro dos sonhos...',
          errorTitle: 'Algo deu errado',
          retry: 'Tentar Novamente',
          saved: 'Quadro dos sonhos salvo com sucesso!',
          failedToSave: 'Falha ao salvar quadro dos sonhos',
          errorSaving: 'Ocorreu um erro ao salvar',
          imageLimit: 'Você pode adicionar apenas até 7 imagens ao seu quadro dos sonhos.',
          introScreen: {
            title: 'Bem-vindo ao Seu Quadro de Visão',
            description:
              'Visualize seus objetivos e aspirações baseados na sua avaliação da Roda da Vida. Crie um espaço personalizado que inspira e motiva você a alcançar seus sonhos.',
            steps: {
              addContent: {
                title: 'Adicionar Conteúdo',
                description:
                  'Adicione imagens, texto e áudio para representar seus objetivos em cada categoria da Roda da Vida.',
              },
              trackGoals: {
                title: 'Acompanhar Metas',
                description:
                  'Marque itens como metas e acompanhe seu progresso enquanto trabalha para alcançá-las.',
              },
              customize: {
                title: 'Personalizar',
                description:
                  'Mude o tema, organize itens e personalize seu quadro de visão para refletir seu estilo.',
              },
              saveShare: {
                title: 'Salvar e Compartilhar',
                description:
                  'Salve seu quadro de visão para acompanhar o progresso ao longo do tempo e compartilhe com amigos de confiança.',
              },
            },
            getStarted: 'Começar',
          },
          toolbar: {
            modes: {
              add: 'Adicionar',
              filter: 'Filtrar',
              arrange: 'Organizar',
            },
            tooltips: {
              addContent: 'Adicionar Conteúdo',
              filterContent: 'Filtrar Conteúdo',
              arrangeContent: 'Organizar Conteúdo',
              uploadImage: 'Enviar Imagem',
              showAll: 'Mostrar Todas as Categorias',
              showCategory: 'Mostrar Itens de {{category}}',
              autoArrange: 'Organização Automática',
              save: 'Salvar Quadro de Visão',
              delete: 'Excluir Quadro dos Sonhos',
            },
            buttons: {
              uploadPhoto: 'Enviar Foto',
              all: 'Todas',
              autoArrange: 'Organização Automática',
              save: 'Salvar',
              saving: 'Salvando...',
              delete: 'Excluir',
            },
            imageLimitIndicator: '{{current}}/{{limit}}',
          },
          milestones: {
            title: 'Marcos dos Sonhos',
            description: 'Divida seu sonho em etapas alcançáveis',
            loading: 'Carregando marcos...',
            errorLoading: 'Falha ao carregar marcos',
            errorAdding: 'Falha ao adicionar marco',
            errorUpdating: 'Falha ao atualizar marco',
            errorDeleting: 'Falha ao excluir marco',
            newMilestonePlaceholder: 'Título do novo marco...',
            addButton: 'Adicionar',
            emptyState:
              'Nenhum marco ainda. Adicione seu primeiro marco para acompanhar o progresso!',
            dueDate: 'Vencimento: {{date}}',
            deleteMilestone: 'Excluir marco',
          },
          dreamSymbols: {
            messages: {
              briefcase:
                'Sua carreira é um caminho para a grandeza. Continue se esforçando pela excelência!',
              money:
                'A abundância financeira está fluindo para sua vida. Abrace a riqueza com consciência!',
              health:
                'Saúde é a verdadeira riqueza. Nutra seu corpo, mente e espírito diariamente.',
              house: 'Sua casa ideal te aguarda. Crie seu santuário perfeito e espaço de vida.',
              growth:
                'O crescimento acontece fora da sua zona de conforto. Abrace mudanças e desafios!',
              heart:
                'Ame profunda e autenticamente. Conexões significativas trazem verdadeira alegria.',
              recreation:
                'Equilibre trabalho com diversão. O tempo de lazer recarrega sua energia criativa!',
              meditation:
                'A paz interior cria harmonia exterior. Reserve tempo para reflexão espiritual.',
              graduation: 'O conhecimento empodera. Continue aprendendo durante toda a sua vida.',
              travel:
                'A aventura te aguarda! Novos lugares trazem perspectivas frescas e memórias.',
              cloud: 'Sonhe sem limites. Sua imaginação cria sua realidade futura!',
              trophy:
                'O sucesso é uma jornada de pequenas vitórias. Celebre cada conquista no caminho!',
              default: 'Sonhe, acredite, conquiste!',
            },
          },
          contentControls: {
            tabs: {
              position: 'Posição',
              style: 'Estilo',
              milestones: 'Marcos',
            },
            fields: {
              title: 'Título',
              altText: 'Texto Alternativo',
              altTextPlaceholder: 'Descrição da imagem para acessibilidade',
              captionPlaceholder: 'Adicione uma legenda para esta imagem...',
              xPosition: 'Posição X',
              yPosition: 'Posição Y',
              width: 'Largura',
              height: 'Altura',
              rotation: 'Rotação',
              category: 'Categoria',
              none: 'Nenhuma',
            },
            buttons: {
              replaceImage: 'Substituir Imagem',
              delete: 'Excluir',
              cancel: 'Cancelar',
            },
            contentTypes: {
              image: 'Imagem',
              item: 'Item',
            },
            edit: 'Editar {{type}}',
            deleteConfirmation: {
              title: 'Excluir Item',
              message:
                'Tem certeza de que deseja excluir esta {{type}}? Esta ação não pode ser desfeita.',
            },
            noStylingOptions: 'Nenhuma opção de estilo disponível',
          },
        },
        categories: {
          title: 'Categorias dos Sonhos',
          clearFilter: 'Limpar Filtro',
          errorLoading: 'Erro ao carregar progresso: {{error}}',
          dreamCount: {
            single: 'sonho',
            plural: 'sonhos',
          },
          expandedContent: {
            dreamsHeader: 'Sonhos',
            moreDreams: '+{{count}} mais sonhos',
            emptyState: 'Nenhum sonho nesta categoria ainda',
          },
          names: {
            travel: 'Viagem',
            skills: 'Habilidades',
            finance: 'Finanças',
            finances: 'Finanças',
            health: 'Saúde',
            relationships: 'Relacionamentos',
            career: 'Carreira',
            education: 'Educação',
            spirituality: 'Espiritualidade',
            spiritual: 'Espiritual',
            personalgrowth: 'Crescimento Pessoal',
            'personal growth': 'Crescimento Pessoal',
            recreation: 'Recreação',
            community: 'Comunidade',
            environment: 'Ambiente',
            personal: 'Pessoal',
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
