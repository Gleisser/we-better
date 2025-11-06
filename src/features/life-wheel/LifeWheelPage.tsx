import { useEffect, useMemo, useState } from 'react';
import { LifeWheel } from './index';
import { LifeCategory } from './types';
import { getLocalizedCategories } from './constants/categories';
import styles from './LifeWheel.module.css';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import { useLatestLifeWheel } from '@/features/life-wheel/hooks/useLatestLifeWheel';

const LifeWheelPage = (): JSX.Element => {
  const { t } = useCommonTranslation();
  const localizedDefaults = useMemo<LifeCategory[]>(() => getLocalizedCategories(t), [t]);

  const { data: latestLifeWheel, isLoading, isError, error, refetch } = useLatestLifeWheel();

  const mergedCategories = useMemo<LifeCategory[] | null>(() => {
    const serverCategories = latestLifeWheel?.entry?.categories;
    if (!serverCategories || serverCategories.length === 0) {
      return null;
    }

    return serverCategories.map(serverCategory => {
      const localized = localizedDefaults.find(category => category.id === serverCategory.id);
      if (localized) {
        return {
          ...localized,
          value: Math.max(0, Math.min(10, serverCategory.value ?? localized.value)),
        };
      }

      return {
        id: serverCategory.id,
        name: serverCategory.name ?? serverCategory.id,
        description: serverCategory.description ?? '',
        icon: serverCategory.icon ?? '✨',
        color: serverCategory.color ?? '#6366F1',
        gradient: serverCategory.gradient ?? 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
        value: Math.max(0, Math.min(10, serverCategory.value ?? 5)),
      };
    });
  }, [latestLifeWheel, localizedDefaults]);

  const [categories, setCategories] = useState<LifeCategory[]>(localizedDefaults);

  useEffect(() => {
    if (mergedCategories) {
      setCategories(mergedCategories);
      return;
    }

    setCategories(localizedDefaults);
  }, [mergedCategories, localizedDefaults]);

  const handleCategoryUpdate = (categoryId: string, newValue: number): void => {
    setCategories(prev =>
      prev.map(cat => (cat.id === categoryId ? { ...cat, value: newValue } : cat))
    );
  };

  const fetchError =
    isError && error
      ? error instanceof Error
        ? error.message
        : 'Failed to load your life wheel data'
      : null;

  return (
    <div className="w-full h-full p-6 bg-gradient-to-br from-gray-900 to-gray-800">
      <h1 className="text-3xl font-bold mb-4 text-white text-center">
        {t('widgets.lifeWheel.assessment')}
      </h1>
      <p className="text-lg text-gray-300 mb-8 text-center">{t('widgets.lifeWheel.subtitle')}</p>

      <div className={`${styles.lifeWheelContainer} mx-auto`}>
        <LifeWheel
          data={{ categories }}
          isLoading={isLoading}
          error={fetchError ? new Error(fetchError) : null}
          onCategoryUpdate={handleCategoryUpdate}
          onComplete={() => {}}
        />

        {fetchError ? (
          <div className="mt-6 flex flex-col items-center gap-2 text-sm text-gray-300">
            <span>{fetchError}</span>
            <button
              type="button"
              className="rounded-md border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/80 transition hover:bg-white/10 hover:text-white"
              onClick={() => {
                void refetch();
              }}
            >
              {t('widgets.common.retry')}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default LifeWheelPage;
