const CATEGORY_KEY_ALIASES: Record<string, string> = {
  finance: 'finances',
};

export const normalizeDreamCategoryKey = (category: string): string => {
  const normalized = category.trim().toLowerCase().replace(/\s+/g, '');
  return CATEGORY_KEY_ALIASES[normalized] || normalized;
};

export const getDreamCategoryTranslationKey = (category: string): string =>
  `dreamBoard.categories.names.${normalizeDreamCategoryKey(category)}`;
