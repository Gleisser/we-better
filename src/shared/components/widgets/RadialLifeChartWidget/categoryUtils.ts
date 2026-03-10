const CATEGORY_KEY_MAP: Record<string, string> = {
  health: 'health',
  saude: 'health',
  bemestar: 'health',
  career: 'career',
  carreira: 'career',
  money: 'money',
  family: 'family',
  relationship: 'relationship',
  relationships: 'relationship',
  relacionamento: 'relationship',
  relacionamentos: 'relationship',
  social: 'social',
  spirituality: 'spirituality',
  espiritualidade: 'spirituality',
  spiritual: 'spiritual',
  selfcare: 'selfCare',
  personal: 'personal',
  education: 'education',
  recreation: 'recreation',
  recreacao: 'recreation',
  lazer: 'recreation',
  environment: 'environment',
  community: 'community',
  comunidade: 'community',
  finances: 'finances',
  financas: 'finances',
  personalgrowth: 'personalGrowth',
  crescimentopessoal: 'personalGrowth',
  growth: 'personalGrowth',
  vitality: 'health',
  wellness: 'health',
};

export const normalizeCategoryName = (categoryName: string): string =>
  categoryName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]/g, '');

export const resolveCategoryKey = (categoryName: string): string => {
  const normalized = normalizeCategoryName(categoryName);
  return CATEGORY_KEY_MAP[normalized] ?? normalized;
};
