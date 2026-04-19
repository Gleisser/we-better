import type {
  OnboardingDreamOption,
  OnboardingFocusArea,
  OnboardingMicroPreference,
} from '@/types/onboarding';

export const microPreferenceOptions: OnboardingMicroPreference[] = [
  'more-ambitious',
  'lighter',
  'faster',
  'more-transformative',
];

export const isOnboardingFocusArea = (value: unknown): value is OnboardingFocusArea =>
  value === 'health' || value === 'relationships' || value === 'finances';

const dreamCatalogByFocus: Readonly<
  Record<OnboardingFocusArea, readonly OnboardingDreamOption[]>
> = {
  health: [
    {
      key: 'sleep-with-consistency',
      focusArea: 'health',
      label: 'Dormir com mais consistência',
      summary: 'Criar uma rotina de descanso que deixe seus dias mais leves.',
      source: 'curated',
    },
    {
      key: 'build-weekly-movement',
      focusArea: 'health',
      label: 'Voltar a me movimentar toda semana',
      summary: 'Retomar movimento com um ritmo possível de sustentar.',
      source: 'curated',
    },
    {
      key: 'eat-with-more-intention',
      focusArea: 'health',
      label: 'Comer com mais intenção',
      summary: 'Trocar improviso por escolhas mais conscientes.',
      source: 'curated',
    },
    {
      key: 'reduce-daily-stress',
      focusArea: 'health',
      label: 'Reduzir o estresse do dia a dia',
      summary: 'Trazer mais calma e previsibilidade para a rotina.',
      source: 'curated',
    },
    {
      key: 'feel-stronger-in-my-body',
      focusArea: 'health',
      label: 'Me sentir mais forte no meu corpo',
      summary: 'Ganhar energia, disposição e percepção de progresso.',
      source: 'curated',
    },
  ],
  relationships: [
    {
      key: 'be-more-present-with-family',
      focusArea: 'relationships',
      label: 'Estar mais presente com minha família',
      summary: 'Transformar intenção em presença real e recorrente.',
      source: 'curated',
    },
    {
      key: 'strengthen-my-relationship',
      focusArea: 'relationships',
      label: 'Fortalecer meu relacionamento',
      summary: 'Criar pequenos rituais de conexão no dia a dia.',
      source: 'curated',
    },
    {
      key: 'reconnect-with-friends',
      focusArea: 'relationships',
      label: 'Me reconectar com amigos importantes',
      summary: 'Retomar vínculos que fazem bem para sua vida.',
      source: 'curated',
    },
    {
      key: 'communicate-with-more-clarity',
      focusArea: 'relationships',
      label: 'Me comunicar com mais clareza',
      summary: 'Ganhar coragem e leveza nas conversas importantes.',
      source: 'curated',
    },
    {
      key: 'create-more-quality-moments',
      focusArea: 'relationships',
      label: 'Criar mais momentos de qualidade',
      summary: 'Trocar convivência automática por conexão intencional.',
      source: 'curated',
    },
  ],
  finances: [
    {
      key: 'build-an-emergency-fund',
      focusArea: 'finances',
      label: 'Montar minha reserva de emergência',
      summary: 'Ter mais segurança para lidar com imprevistos.',
      source: 'curated',
    },
    {
      key: 'gain-control-of-my-spending',
      focusArea: 'finances',
      label: 'Ter mais controle sobre meus gastos',
      summary: 'Saber para onde o dinheiro está indo e agir melhor.',
      source: 'curated',
    },
    {
      key: 'save-for-an-important-goal',
      focusArea: 'finances',
      label: 'Juntar dinheiro para um objetivo importante',
      summary: 'Criar constância para um plano financeiro real.',
      source: 'curated',
    },
    {
      key: 'organize-my-financial-routine',
      focusArea: 'finances',
      label: 'Organizar minha rotina financeira',
      summary: 'Substituir caos por pequenos hábitos de clareza.',
      source: 'curated',
    },
    {
      key: 'feel-more-peace-about-money',
      focusArea: 'finances',
      label: 'Sentir mais paz em relação ao dinheiro',
      summary: 'Reduzir ansiedade financeira com passos sustentáveis.',
      source: 'curated',
    },
  ],
};

export const getDreamOptions = (focusArea: OnboardingFocusArea): OnboardingDreamOption[] =>
  dreamCatalogByFocus[focusArea].map(option => ({ ...option }));
