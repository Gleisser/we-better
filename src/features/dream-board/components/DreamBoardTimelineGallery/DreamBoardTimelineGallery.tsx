import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import { Dream, DreamImageMilestoneInput, DreamImageUploadInput } from '../../types';
import {
  getDreamCategoryTranslationKey,
  normalizeDreamCategoryKey,
} from '../../utils/categoryUtils';
import {
  type DreamBoardUploadValidationResult,
  formatBytes,
  formatDreamBoardImageLimit,
  validateDreamBoardUploadFile,
} from '../../utils/imagePersistence';
import categoryDetails from '../constants/dreamboard';
import styles from './DreamBoardTimelineGallery.module.css';

const MAX_DREAM_BOARD_IMAGES = 7;

type DreamBoardTimelineGalleryProps = {
  dreams: Dream[];
  onAddImage: (
    upload: DreamImageUploadInput,
    onProgress?: (percent: number) => void
  ) => Promise<void>;
  onRemoveImage: (dreamId: string) => void;
  isDreamBoardSaving: boolean;
  hasUnsavedChanges: boolean;
  errorMessage?: string | null;
  categories: string[];
};

type MilestoneDraft = {
  id: string;
  title: string;
  date: string;
};

type UploadStepKey = 'file' | 'details' | 'category' | 'milestones';

type UploadStep = {
  key: UploadStepKey;
  title: string;
  description: string;
};

type UploadFlowStage = 'wizard' | 'uploading' | 'uploaded';
type CategoryVisualDetails = {
  icon: string;
  illustration: string;
  gradient: string;
  hoverGradient: string;
  shadowColor: string;
  color: string;
};

type SelectedFileValidationState = DreamBoardUploadValidationResult & {
  fileName: string;
  status: 'validating' | 'ready' | 'tooLarge' | 'unsupportedType' | 'failed';
};

const CATEGORY_DETAIL_KEY_BY_NORMALIZED: Record<string, keyof typeof categoryDetails> = {
  travel: 'Travel',
  skills: 'Skills',
  finance: 'Finance',
  finances: 'Finance',
  health: 'Health',
  relationships: 'Relationships',
  career: 'Career',
  education: 'Education',
  spirituality: 'Spirituality',
};

const getCategoryVisualDetails = (category: string): CategoryVisualDetails => {
  const normalizedKey = normalizeDreamCategoryKey(category);
  const mappedKey = CATEGORY_DETAIL_KEY_BY_NORMALIZED[normalizedKey];

  if (mappedKey) {
    return categoryDetails[mappedKey];
  }

  return {
    icon: '🌟',
    illustration: '/assets/images/dreamboard/spirituality.webp',
    gradient: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
    hoverGradient: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
    shadowColor: 'rgba(71, 85, 105, 0.45)',
    color: '#cbd5e1',
  };
};

const createMilestoneDraft = (): MilestoneDraft => ({
  id:
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  title: '',
  date: '',
});

const DreamBoardTimelineGallery: React.FC<DreamBoardTimelineGalleryProps> = ({
  dreams,
  onAddImage,
  onRemoveImage,
  isDreamBoardSaving,
  hasUnsavedChanges,
  errorMessage,
  categories,
}) => {
  const { t } = useCommonTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [showUploadWizard, setShowUploadWizard] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadStage, setUploadStage] = useState<UploadFlowStage>('wizard');
  const [isSubmittingUpload, setIsSubmittingUpload] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFilePreviewUrl, setSelectedFilePreviewUrl] = useState<string | null>(null);
  const [selectedFileStatus, setSelectedFileStatus] = useState<string | null>(null);
  const [selectedFileValidation, setSelectedFileValidation] =
    useState<SelectedFileValidationState | null>(null);
  const [isValidatingSelectedFile, setIsValidatingSelectedFile] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftCaption, setDraftCaption] = useState('');
  const [draftCategory, setDraftCategory] = useState('');
  const [milestonesDraft, setMilestonesDraft] = useState<MilestoneDraft[]>([]);
  const milestoneDateInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const fileValidationRequestRef = useRef(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = (): void => setPrefersReducedMotion(mediaQuery.matches);

    updateMotionPreference();
    mediaQuery.addEventListener('change', updateMotionPreference);
    return () => mediaQuery.removeEventListener('change', updateMotionPreference);
  }, []);

  useEffect(() => {
    setActiveIndex(previousIndex => {
      if (dreams.length === 0) {
        return 0;
      }
      return Math.min(previousIndex, dreams.length - 1);
    });
  }, [dreams.length]);

  const imageLimitLabel = useMemo(() => formatDreamBoardImageLimit(), []);

  const uploadSteps = useMemo<UploadStep[]>(
    () => [
      {
        key: 'file',
        title: t('dreamBoard.timelineGallery.wizard.steps.file.title') as string,
        description: t('dreamBoard.timelineGallery.wizard.steps.file.description', {
          limit: imageLimitLabel,
        }) as string,
      },
      {
        key: 'details',
        title: t('dreamBoard.timelineGallery.wizard.steps.details.title') as string,
        description: t('dreamBoard.timelineGallery.wizard.steps.details.description') as string,
      },
      {
        key: 'category',
        title: t('dreamBoard.timelineGallery.wizard.steps.category.title') as string,
        description: t('dreamBoard.timelineGallery.wizard.steps.category.description') as string,
      },
      {
        key: 'milestones',
        title: t('dreamBoard.timelineGallery.wizard.steps.milestones.title') as string,
        description: t('dreamBoard.timelineGallery.wizard.steps.milestones.description') as string,
      },
    ],
    [imageLimitLabel, t]
  );

  const availableCategories = useMemo(() => {
    const fallbackCategories = dreams.map(dream => dream.category).filter(Boolean);
    const combined = [...categories, ...fallbackCategories, 'General'];
    const uniqueCategories = new Map<string, string>();

    combined.forEach(category => {
      const cleanedCategory = category.trim();
      if (!cleanedCategory) {
        return;
      }

      const normalizedKey = normalizeDreamCategoryKey(cleanedCategory);
      if (!uniqueCategories.has(normalizedKey)) {
        uniqueCategories.set(normalizedKey, cleanedCategory);
      }
    });

    return Array.from(uniqueCategories.values());
  }, [categories, dreams]);

  const getTranslatedCategoryName = (categoryName: string): string => {
    const translationKey = getDreamCategoryTranslationKey(categoryName);
    const translated = t(translationKey) as string;
    return translated !== translationKey ? translated : categoryName;
  };

  useEffect(() => {
    if (!availableCategories.includes(draftCategory)) {
      setDraftCategory(availableCategories[0] || 'General');
    }
  }, [availableCategories, draftCategory]);

  useEffect(() => {
    if (!selectedFile) {
      setSelectedFilePreviewUrl(null);
      return;
    }

    if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
      setSelectedFilePreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setSelectedFilePreviewUrl(objectUrl);

    return () => {
      if (typeof URL.revokeObjectURL === 'function') {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [selectedFile]);

  const statusMessage = isDreamBoardSaving
    ? (t('dreamBoard.timelineGallery.status.saving') as string)
    : hasUnsavedChanges
      ? (t('dreamBoard.timelineGallery.status.pending') as string)
      : (t('dreamBoard.timelineGallery.status.saved') as string);

  const rotateTo = (index: number): void => {
    if (dreams.length === 0) {
      return;
    }

    const normalizedIndex = ((index % dreams.length) + dreams.length) % dreams.length;
    setActiveIndex(normalizedIndex);
  };

  const rotateNext = (): void => {
    rotateTo(activeIndex + 1);
  };

  const rotatePrevious = (): void => {
    rotateTo(activeIndex - 1);
  };

  const handleRemoveImageClick = (dreamId: string, dreamTitle: string): void => {
    const confirmed = window.confirm(
      t('dreamBoard.timelineGallery.removeImageConfirm', {
        title: dreamTitle,
      }) as string
    );

    if (!confirmed) {
      return;
    }

    onRemoveImage(dreamId);
  };

  const handleKeyboardNavigation = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      rotateNext();
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      rotatePrevious();
    }
  };

  const getRelativeOffset = (index: number): number => {
    if (dreams.length === 0) {
      return 0;
    }

    let offset = index - activeIndex;
    const half = dreams.length / 2;

    if (offset > half) {
      offset -= dreams.length;
    } else if (offset < -half) {
      offset += dreams.length;
    }

    return offset;
  };

  const resetWizardState = (): void => {
    setCurrentStep(0);
    setUploadStage('wizard');
    setIsSubmittingUpload(false);
    setIsDragOver(false);
    setUploadProgress(0);
    setUploadError(null);
    setSelectedFile(null);
    setSelectedFileStatus(null);
    setSelectedFileValidation(null);
    setIsValidatingSelectedFile(false);
    setDraftTitle('');
    setDraftCaption('');
    setDraftCategory(availableCategories[0] || 'General');
    setMilestonesDraft([]);
  };

  const openUploadWizard = (): void => {
    resetWizardState();
    setShowUploadWizard(true);
  };

  const closeUploadWizard = (): void => {
    if (isSubmittingUpload) {
      return;
    }

    setShowUploadWizard(false);
    setUploadError(null);
  };

  const applySelectedFile = async (file: File | null): Promise<void> => {
    if (!file) {
      return;
    }

    const requestId = fileValidationRequestRef.current + 1;
    fileValidationRequestRef.current = requestId;
    setIsValidatingSelectedFile(true);
    setSelectedFile(null);
    setSelectedFileValidation({
      fileName: file.name,
      originalBytes: file.size,
      fitsLimit: false,
      mimeType: file.type,
      reason: null,
      status: 'validating',
    });
    setSelectedFileStatus(
      t('dreamBoard.timelineGallery.wizard.validation.validatingFile', {
        limit: imageLimitLabel,
      }) as string
    );
    setUploadProgress(0);
    setUploadError(null);

    try {
      const validationResult = await validateDreamBoardUploadFile(file);
      if (fileValidationRequestRef.current !== requestId) {
        return;
      }

      if (!validationResult.fitsLimit) {
        setSelectedFile(null);
        setSelectedFileStatus(null);
        const nextStatus =
          validationResult.reason === 'unsupportedType' ? 'unsupportedType' : 'tooLarge';
        setSelectedFileValidation({
          fileName: file.name,
          ...validationResult,
          status: nextStatus,
        });
        setUploadError(
          (validationResult.reason === 'unsupportedType'
            ? t('dreamBoard.timelineGallery.wizard.validation.unsupportedType')
            : t('dreamBoard.timelineGallery.wizard.validation.fileTooLarge', {
                limit: imageLimitLabel,
              })) as string
        );
        return;
      }

      setSelectedFile(file);
      setSelectedFileValidation({
        fileName: file.name,
        ...validationResult,
        status: 'ready',
      });
      setSelectedFileStatus(
        t('dreamBoard.timelineGallery.wizard.validation.fileReady', {
          limit: imageLimitLabel,
        }) as string
      );

      if (!draftTitle.trim()) {
        setDraftTitle(file.name.replace(/\.[^/.]+$/, '').trim());
      }
    } catch (error) {
      if (fileValidationRequestRef.current !== requestId) {
        return;
      }

      console.error('Failed to validate selected dream image:', error);
      setSelectedFile(null);
      setSelectedFileStatus(null);
      setSelectedFileValidation({
        fileName: file.name,
        originalBytes: file.size,
        fitsLimit: false,
        mimeType: file.type,
        reason: null,
        status: 'failed',
      });
      setUploadError(
        t('dreamBoard.timelineGallery.wizard.validation.fileValidationFailed') as string
      );
    } finally {
      if (fileValidationRequestRef.current === requestId) {
        setIsValidatingSelectedFile(false);
      }
    }
  };

  const triggerFileSelection = (): void => {
    const input = document.getElementById('dream-upload-file');
    if (input instanceof HTMLInputElement) {
      input.click();
    }
  };

  const addMilestoneDraft = (): void => {
    setMilestonesDraft(previous => [...previous, createMilestoneDraft()]);
  };

  const removeMilestoneDraft = (id: string): void => {
    setMilestonesDraft(previous => previous.filter(milestone => milestone.id !== id));
  };

  const updateMilestoneDraft = (id: string, field: 'title' | 'date', value: string): void => {
    setMilestonesDraft(previous =>
      previous.map(milestone =>
        milestone.id === id
          ? {
              ...milestone,
              [field]: value,
            }
          : milestone
      )
    );
  };

  const validateStep = (): boolean => {
    const stepKey = uploadSteps[currentStep]?.key;

    if (stepKey === 'file' && !selectedFile) {
      setUploadError(
        (isValidatingSelectedFile
          ? t('dreamBoard.timelineGallery.wizard.validation.validatingFile', {
              limit: imageLimitLabel,
            })
          : t('dreamBoard.timelineGallery.wizard.validation.fileRequired')) as string
      );
      return false;
    }

    if (stepKey === 'details' && !draftTitle.trim() && !draftCaption.trim()) {
      setUploadError(t('dreamBoard.timelineGallery.wizard.validation.detailsRequired') as string);
      return false;
    }

    if (stepKey === 'category' && !draftCategory.trim()) {
      setUploadError(t('dreamBoard.timelineGallery.wizard.validation.categoryRequired') as string);
      return false;
    }

    setUploadError(null);
    return true;
  };

  const submitWizard = async (): Promise<void> => {
    if (!selectedFile) {
      return;
    }

    const milestonePayload: DreamImageMilestoneInput[] = milestonesDraft
      .map(milestone => ({
        title: milestone.title.trim(),
        date: milestone.date || undefined,
      }))
      .filter(milestone => milestone.title.length > 0);

    setIsSubmittingUpload(true);
    setUploadStage('uploading');
    setUploadError(null);
    setUploadProgress(0);

    try {
      await onAddImage(
        {
          file: selectedFile,
          title: draftTitle.trim() || draftCaption.trim(),
          caption: draftCaption.trim() || undefined,
          category: draftCategory || availableCategories[0] || 'General',
          milestones: milestonePayload,
        },
        percent => {
          setUploadProgress(percent);
        }
      );

      setUploadProgress(100);
      setUploadStage('uploaded');
    } catch (error) {
      console.error('Failed to upload dream image:', error);
      setUploadStage('wizard');
      setUploadError(t('dreamBoard.timelineGallery.form.errors.submitFailed') as string);
    } finally {
      setIsSubmittingUpload(false);
    }
  };

  const handleNext = async (): Promise<void> => {
    if (!validateStep()) {
      return;
    }

    if (currentStep === uploadSteps.length - 1) {
      await submitWizard();
      return;
    }

    setCurrentStep(previousStep => previousStep + 1);
  };

  const handleBack = (): void => {
    setUploadError(null);
    setCurrentStep(previousStep => Math.max(previousStep - 1, 0));
  };

  const handleUploadAnother = (): void => {
    resetWizardState();
    setUploadError(null);
  };

  const openMilestoneDatePicker = (milestoneId: string): void => {
    const dateInput = milestoneDateInputRefs.current[milestoneId];
    if (!dateInput) {
      return;
    }

    if (typeof dateInput.showPicker === 'function') {
      dateInput.showPicker();
      return;
    }

    dateInput.focus();
  };

  const currentStepData = uploadSteps[currentStep];
  const selectedFileOriginalSizeLabel = selectedFile
    ? formatBytes(selectedFileValidation?.originalBytes ?? selectedFile.size)
    : null;
  const fileLimitNoticeTitle = t('dreamBoard.timelineGallery.wizard.fileLimit.title', {
    limit: imageLimitLabel,
  }) as string;
  const fileLimitNoticeMessage = (() => {
    if (!selectedFileValidation) {
      return t('dreamBoard.timelineGallery.wizard.fileLimit.default', {
        limit: imageLimitLabel,
      }) as string;
    }

    const originalSize = formatBytes(selectedFileValidation.originalBytes);

    switch (selectedFileValidation.status) {
      case 'validating':
        return t('dreamBoard.timelineGallery.wizard.fileLimit.validating', {
          name: selectedFileValidation.fileName,
          originalSize,
          limit: imageLimitLabel,
        }) as string;
      case 'ready':
        return t('dreamBoard.timelineGallery.wizard.fileLimit.ready', {
          name: selectedFileValidation.fileName,
          originalSize,
          limit: imageLimitLabel,
        }) as string;
      case 'tooLarge':
        return t('dreamBoard.timelineGallery.wizard.fileLimit.tooLarge', {
          name: selectedFileValidation.fileName,
          originalSize,
          limit: imageLimitLabel,
        }) as string;
      case 'unsupportedType':
        return t('dreamBoard.timelineGallery.wizard.fileLimit.unsupportedType', {
          name: selectedFileValidation.fileName,
          limit: imageLimitLabel,
        }) as string;
      default:
        return t('dreamBoard.timelineGallery.wizard.fileLimit.failed', {
          name: selectedFileValidation.fileName,
          originalSize,
          limit: imageLimitLabel,
        }) as string;
    }
  })();
  const fileLimitNoticeClassName = [
    styles.fileLimitNotice,
    selectedFileValidation?.status === 'ready'
      ? styles.fileLimitNoticeSuccess
      : selectedFileValidation?.status === 'tooLarge' ||
          selectedFileValidation?.status === 'unsupportedType' ||
          selectedFileValidation?.status === 'failed'
        ? styles.fileLimitNoticeError
        : '',
  ]
    .filter(Boolean)
    .join(' ');
  const fileLimitNoticeRole =
    selectedFileValidation?.status === 'tooLarge' ||
    selectedFileValidation?.status === 'unsupportedType' ||
    selectedFileValidation?.status === 'failed'
      ? 'alert'
      : 'status';

  const renderFileLimitNotice = (): JSX.Element => (
    <div className={fileLimitNoticeClassName} role={fileLimitNoticeRole} aria-live="polite">
      <span className={styles.fileLimitBadge}>
        {t('dreamBoard.timelineGallery.wizard.fileLimit.badge', {
          limit: imageLimitLabel,
        })}
      </span>
      <div className={styles.fileLimitBody}>
        <strong>{fileLimitNoticeTitle}</strong>
        <p>{fileLimitNoticeMessage}</p>
      </div>
    </div>
  );

  const renderWizardStepContent = (): JSX.Element => {
    if (!currentStepData) {
      return <></>;
    }

    if (currentStepData.key === 'file') {
      if (selectedFile) {
        return (
          <div className={styles.uploadStepSection}>
            <div className={styles.selectedFilePreview}>
              {selectedFilePreviewUrl && (
                <img
                  src={selectedFilePreviewUrl}
                  alt={t('dreamBoard.timelineGallery.wizard.preview.alt') as string}
                />
              )}
              <div className={styles.selectedFileMeta}>
                <strong>{selectedFile.name}</strong>
                <span>
                  {selectedFileStatus || t('dreamBoard.timelineGallery.wizard.preview.selected')}
                </span>
                {selectedFileOriginalSizeLabel && (
                  <span>
                    {t('dreamBoard.timelineGallery.wizard.preview.originalSize', {
                      size: selectedFileOriginalSizeLabel,
                    })}
                  </span>
                )}
                <button type="button" onClick={triggerFileSelection}>
                  {t('dreamBoard.timelineGallery.wizard.preview.change')}
                </button>
              </div>
            </div>
            {renderFileLimitNotice()}
            <input
              id="dream-upload-file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className={styles.hiddenInput}
              onChange={event => {
                const nextFile = event.target.files?.[0] || null;
                event.target.value = '';
                void applySelectedFile(nextFile);
              }}
              aria-label={t('dreamBoard.timelineGallery.form.fileLabel') as string}
            />
          </div>
        );
      }

      return (
        <div className={styles.uploadStepSection}>
          <label
            htmlFor="dream-upload-file"
            className={`${styles.dropZone} ${isDragOver ? styles.dropZoneActive : ''}`}
            onDragOver={event => {
              event.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={event => {
              event.preventDefault();
              setIsDragOver(false);
              void applySelectedFile(event.dataTransfer.files?.[0] || null);
            }}
          >
            <strong>{t('dreamBoard.timelineGallery.wizard.dropzone.title')}</strong>
            <span>{t('dreamBoard.timelineGallery.wizard.dropzone.hint')}</span>
            <span className={styles.dropZoneButton}>
              {t('dreamBoard.timelineGallery.wizard.dropzone.browse')}
            </span>
            <input
              id="dream-upload-file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className={styles.hiddenInput}
              onChange={event => {
                const nextFile = event.target.files?.[0] || null;
                event.target.value = '';
                void applySelectedFile(nextFile);
              }}
              aria-label={t('dreamBoard.timelineGallery.form.fileLabel') as string}
            />
          </label>

          {renderFileLimitNotice()}
        </div>
      );
    }

    if (currentStepData.key === 'details') {
      return (
        <div className={styles.uploadStepSection}>
          <label htmlFor="dream-upload-title">
            {t('dreamBoard.timelineGallery.form.dreamTitleLabel')}
          </label>
          <input
            id="dream-upload-title"
            value={draftTitle}
            onChange={event => setDraftTitle(event.target.value)}
            placeholder={t('dreamBoard.timelineGallery.form.dreamTitlePlaceholder') as string}
          />

          <label htmlFor="dream-upload-caption">
            {t('dreamBoard.timelineGallery.wizard.fields.caption')}
          </label>
          <textarea
            id="dream-upload-caption"
            value={draftCaption}
            onChange={event => setDraftCaption(event.target.value)}
            placeholder={t('dreamBoard.timelineGallery.wizard.fields.captionPlaceholder') as string}
            rows={3}
          />
        </div>
      );
    }

    if (currentStepData.key === 'category') {
      return (
        <div className={styles.uploadStepSection}>
          <label>{t('dreamBoard.timelineGallery.form.categoryLabel')}</label>
          <div className={styles.categorySelectionGrid}>
            {availableCategories.map(category => {
              const categoryVisualDetails = getCategoryVisualDetails(category);

              return (
                <button
                  type="button"
                  key={category}
                  className={`${styles.categoryOptionCard} ${
                    draftCategory === category ? styles.categoryOptionCardSelected : ''
                  }`}
                  onClick={() => setDraftCategory(category)}
                  aria-pressed={draftCategory === category}
                  style={
                    {
                      '--category-gradient': categoryVisualDetails.gradient,
                      '--category-shadow': categoryVisualDetails.shadowColor,
                      '--category-color': categoryVisualDetails.color,
                    } as React.CSSProperties
                  }
                >
                  <span
                    className={styles.categoryOptionImage}
                    style={{
                      backgroundImage: `url(${categoryVisualDetails.illustration})`,
                    }}
                    aria-hidden="true"
                  >
                    <span className={styles.categoryOptionImageOverlay}></span>
                  </span>
                  <span className={styles.categoryOptionName}>
                    {getTranslatedCategoryName(category)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className={styles.uploadStepSection}>
        <div className={styles.milestonesHeader}>
          <h4>{t('dreamBoard.timelineGallery.form.milestonesLabel')}</h4>
          <button type="button" onClick={addMilestoneDraft}>
            {t('dreamBoard.timelineGallery.form.addMilestone')}
          </button>
        </div>

        {milestonesDraft.length === 0 && (
          <p className={styles.milestoneEmptyHint}>
            {t('dreamBoard.timelineGallery.form.milestonesEmpty')}
          </p>
        )}

        {milestonesDraft.map(milestone => (
          <div key={milestone.id} className={styles.milestoneRow}>
            <input
              value={milestone.title}
              onChange={event => updateMilestoneDraft(milestone.id, 'title', event.target.value)}
              placeholder={t('dreamBoard.timelineGallery.form.milestoneTitlePlaceholder') as string}
            />
            <div className={styles.milestoneDateField}>
              <input
                ref={element => {
                  milestoneDateInputRefs.current[milestone.id] = element;
                }}
                type="date"
                value={milestone.date}
                onChange={event => updateMilestoneDraft(milestone.id, 'date', event.target.value)}
                onFocus={() => openMilestoneDatePicker(milestone.id)}
              />
              <button
                type="button"
                className={styles.milestoneDateButton}
                onClick={() => openMilestoneDatePicker(milestone.id)}
                aria-label={t('dreamBoard.timelineGallery.form.pickDate') as string}
              >
                📅
              </button>
            </div>
            <button type="button" onClick={() => removeMilestoneDraft(milestone.id)}>
              {t('dreamBoard.timelineGallery.form.removeMilestone')}
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderUploadWizard = (): JSX.Element | null => {
    if (!showUploadWizard) {
      return null;
    }

    const isWizardStage = uploadStage === 'wizard';
    const isUploadingStage = uploadStage === 'uploading';
    const isUploadedStage = uploadStage === 'uploaded';

    return (
      <div className={styles.uploadFormOverlay}>
        <div className={styles.uploadWizardCard}>
          <div className={styles.uploadWizardIntro}>
            <h3>{t('dreamBoard.timelineGallery.wizard.title')}</h3>
            <p>{t('dreamBoard.timelineGallery.wizard.subtitle')}</p>
          </div>

          <div
            className={`${styles.uploadWizardBody} ${!isWizardStage ? styles.uploadWizardBodySingle : ''}`}
          >
            {isWizardStage && (
              <aside className={styles.uploadWizardSteps}>
                {uploadSteps.map((step, index) => {
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;
                  return (
                    <div key={step.key} className={styles.uploadStepItem}>
                      <div
                        className={`${styles.stepBadge} ${isActive ? styles.stepBadgeActive : ''} ${isCompleted ? styles.stepBadgeDone : ''}`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <h4>{step.title}</h4>
                        <p>{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </aside>
            )}

            <div
              className={`${styles.uploadWizardPanel} ${!isWizardStage ? styles.uploadWizardPanelCentered : ''}`}
            >
              {isWizardStage && (
                <>
                  <div className={styles.uploadWizardPanelHeader}>
                    <div>
                      <h4>{currentStepData.title}</h4>
                      <p>{currentStepData.description}</p>
                    </div>
                  </div>

                  {renderWizardStepContent()}

                  {uploadError && <p className={styles.uploadError}>{uploadError}</p>}

                  <div className={styles.uploadFormActions}>
                    <button type="button" onClick={closeUploadWizard}>
                      {t('dreamBoard.timelineGallery.wizard.buttons.cancel')}
                    </button>
                    <div className={styles.uploadRightActions}>
                      {currentStep > 0 && (
                        <button type="button" onClick={handleBack}>
                          {t('dreamBoard.timelineGallery.wizard.buttons.back')}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => void handleNext()}
                        disabled={isSubmittingUpload || isValidatingSelectedFile}
                      >
                        {currentStep === uploadSteps.length - 1
                          ? t('dreamBoard.timelineGallery.wizard.buttons.save')
                          : t('dreamBoard.timelineGallery.wizard.buttons.next')}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {isUploadingStage && (
                <div className={styles.uploadProgressState}>
                  <h4>{t('dreamBoard.timelineGallery.wizard.uploading.title')}</h4>
                  <p>{t('dreamBoard.timelineGallery.wizard.uploading.subtitle')}</p>
                  <div className={styles.progressMeta}>
                    <span>{t('dreamBoard.timelineGallery.wizard.progressLabel')}</span>
                    <strong>{uploadProgress}%</strong>
                  </div>
                  <div className={styles.progressTrack}>
                    <div className={styles.progressFill} style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              {isUploadedStage && (
                <div className={styles.uploadProgressState}>
                  <h4>{t('dreamBoard.timelineGallery.wizard.completed.title')}</h4>
                  <p>{t('dreamBoard.timelineGallery.wizard.completed.subtitle')}</p>
                  <div className={styles.progressMeta}>
                    <span>{t('dreamBoard.timelineGallery.wizard.progressLabel')}</span>
                    <strong>{uploadProgress}%</strong>
                  </div>
                  <div className={styles.progressTrack}>
                    <div className={styles.progressFill} style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <div className={styles.uploadCompleteActions}>
                    <button type="button" onClick={handleUploadAnother}>
                      {t('dreamBoard.timelineGallery.wizard.buttons.uploadAnother')}
                    </button>
                    <button type="button" onClick={closeUploadWizard}>
                      {t('dreamBoard.timelineGallery.wizard.buttons.close')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (dreams.length === 0) {
    return (
      <section className={styles.timelineSection}>
        <header className={styles.header}>
          <div>
            <h2>{t('dreamBoard.timelineGallery.title')}</h2>
            <p>{t('dreamBoard.timelineGallery.subtitle')}</p>
          </div>
          <button className={styles.addImageButton} type="button" onClick={openUploadWizard}>
            {t('dreamBoard.timelineGallery.addImage')}
          </button>
        </header>

        <div className={styles.galleryEmptyState}>
          <p>{t('dreamBoard.timelineGallery.emptyHint')}</p>
        </div>

        {renderUploadWizard()}
      </section>
    );
  }

  const activeDream = dreams[activeIndex] || dreams[0];

  return (
    <section className={styles.timelineSection}>
      <header className={styles.header}>
        <div>
          <h2>{t('dreamBoard.timelineGallery.title')}</h2>
          <p>{t('dreamBoard.timelineGallery.subtitle')}</p>
        </div>

        <div className={styles.headerActions}>
          <span className={styles.statusMessage}>{statusMessage}</span>
          <span className={styles.countBadge}>
            {t('dreamBoard.board.toolbar.imageLimitIndicator', {
              current: dreams.length,
              limit: MAX_DREAM_BOARD_IMAGES,
            })}
          </span>
          <button
            className={styles.addImageButton}
            type="button"
            onClick={openUploadWizard}
            disabled={dreams.length >= MAX_DREAM_BOARD_IMAGES}
          >
            {t('dreamBoard.timelineGallery.addImage')}
          </button>
        </div>
      </header>

      {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

      <div className={styles.carouselViewport} tabIndex={0} onKeyDown={handleKeyboardNavigation}>
        <button
          className={`${styles.navButton} ${styles.navButtonLeft}`}
          type="button"
          onClick={rotatePrevious}
          aria-label={t('dreamBoard.timelineGallery.previousImage') as string}
          disabled={dreams.length <= 1}
        >
          <span aria-hidden="true">‹</span>
        </button>

        <div
          className={`${styles.galleryStage} ${prefersReducedMotion ? styles.reducedMotion : ''}`}
        >
          <div className={styles.cardLayer}>
            {dreams.map((dream, index) => {
              const offset = getRelativeOffset(index);
              const absoluteOffset = Math.abs(offset);
              const isActive = absoluteOffset === 0;
              const isHidden = absoluteOffset > 3;

              return (
                <article
                  key={dream.id}
                  className={`${styles.galleryCard} ${isActive ? styles.activeCard : ''} ${isHidden ? styles.hiddenCard : ''}`}
                  style={
                    {
                      '--offset': `${offset}`,
                      '--abs-offset': `${absoluteOffset}`,
                      zIndex: 200 - absoluteOffset,
                    } as React.CSSProperties
                  }
                  onClick={() => rotateTo(index)}
                >
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={event => {
                      event.stopPropagation();
                      handleRemoveImageClick(dream.id, dream.title);
                    }}
                    aria-label={
                      t('dreamBoard.timelineGallery.removeImageAria', {
                        title: dream.title,
                      }) as string
                    }
                  >
                    ×
                  </button>
                  <img src={dream.imageUrl} alt={dream.title} loading="lazy" />
                </article>
              );
            })}
          </div>

          <div className={styles.captionOverlay}>
            <p className={styles.activeCaption}>{activeDream.title}</p>
            <p className={styles.scrollHint}>{t('dreamBoard.timelineGallery.scrollHint')}</p>
          </div>
        </div>

        <button
          className={`${styles.navButton} ${styles.navButtonRight}`}
          type="button"
          onClick={rotateNext}
          aria-label={t('dreamBoard.timelineGallery.nextImage') as string}
          disabled={dreams.length <= 1}
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>

      {renderUploadWizard()}
    </section>
  );
};

export default DreamBoardTimelineGallery;
