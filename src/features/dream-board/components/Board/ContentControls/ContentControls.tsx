import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { DreamBoardContent, DreamBoardContentType } from '../../../types';
import { LifeCategory } from '@/features/life-wheel/types';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import styles from './ContentControls.module.css';
import { Milestones } from '../Milestones/Milestones';

interface ContentControlsProps {
  selectedContent: DreamBoardContent;
  onUpdate: (content: DreamBoardContent) => void;
  onDelete: (id: string) => void;
  onClose?: () => void;
  lifeWheelCategories: LifeCategory[];
}

// Define the InputField props with generics for better type safety
interface InputFieldProps<T> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  type?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  className?: string;
}

// Caption Input component to handle its own state
const CaptionInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}> = ({ value, onChange, placeholder, disabled = false, className = '' }) => {
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Update local value when parent's value changes
  useEffect(() => {
    if (!inputRef.current?.matches(':focus')) {
      setLocalValue(value);
    }
  }, [value]);

  // Only update parent when focus is lost
  const handleBlur = (): void => {
    onChange(localValue);
  };

  return (
    <textarea
      ref={inputRef}
      value={localValue}
      onChange={e => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      disabled={disabled}
      placeholder={placeholder}
      className={`${styles.textarea} ${className}`}
    />
  );
};

export const ContentControls: React.FC<ContentControlsProps> = ({
  selectedContent,
  onUpdate,
  onDelete,
  onClose,
  lifeWheelCategories = [],
}) => {
  const { t } = useCommonTranslation();

  // Memoize translated values to prevent infinite re-renders
  const translations = useMemo(
    () => ({
      contentTypes: {
        image: t('dreamBoard.board.contentControls.contentTypes.image') as string,
        item: t('dreamBoard.board.contentControls.contentTypes.item') as string,
      },
      fields: {
        none: t('dreamBoard.board.contentControls.fields.none') as string,
        title: t('dreamBoard.board.contentControls.fields.title') as string,
        altText: t('dreamBoard.board.contentControls.fields.altText') as string,
        altTextPlaceholder: t(
          'dreamBoard.board.contentControls.fields.altTextPlaceholder'
        ) as string,
        captionPlaceholder: t(
          'dreamBoard.board.contentControls.fields.captionPlaceholder'
        ) as string,
        xPosition: t('dreamBoard.board.contentControls.fields.xPosition') as string,
        yPosition: t('dreamBoard.board.contentControls.fields.yPosition') as string,
        width: t('dreamBoard.board.contentControls.fields.width') as string,
        height: t('dreamBoard.board.contentControls.fields.height') as string,
        rotation: t('dreamBoard.board.contentControls.fields.rotation') as string,
        category: t('dreamBoard.board.contentControls.fields.category') as string,
      },
      tabs: {
        position: t('dreamBoard.board.contentControls.tabs.position') as string,
        style: t('dreamBoard.board.contentControls.tabs.style') as string,
        milestones: t('dreamBoard.board.contentControls.tabs.milestones') as string,
      },
      buttons: {
        replaceImage: t('dreamBoard.board.contentControls.buttons.replaceImage') as string,
        delete: t('dreamBoard.board.contentControls.buttons.delete') as string,
        cancel: t('dreamBoard.board.contentControls.buttons.cancel') as string,
      },
      deleteConfirmation: {
        title: t('dreamBoard.board.contentControls.deleteConfirmation.title') as string,
      },
      noStylingOptions: t('dreamBoard.board.contentControls.noStylingOptions') as string,
    }),
    [t]
  );

  // Local state to manage form values
  const [localContent, setLocalContent] = useState<DreamBoardContent>(selectedContent);
  const [activeTab, setActiveTab] = useState<string>('position');
  const [isDeleting, setIsDeleting] = useState(false);
  const controlsRef = useRef<HTMLDivElement>(null);

  // Update local state when selected content changes
  useEffect(() => {
    setLocalContent(selectedContent);
  }, [selectedContent]);

  // Handler for form changes
  const handleChange = (changes: Partial<DreamBoardContent>): void => {
    const updatedContent = { ...localContent, ...changes };
    setLocalContent(updatedContent);
    onUpdate(updatedContent);
  };

  // Handle color scheme based on content type
  const getAccentColor = (): string => {
    switch (localContent.type) {
      case DreamBoardContentType.IMAGE:
        return '#8b5cf6'; // Purple
      default:
        return '#3b82f6';
    }
  };

  const getContentTypeIcon = (): string => {
    switch (localContent.type) {
      case DreamBoardContentType.IMAGE:
        return '🖼️';
      default:
        return '📌';
    }
  };

  const getContentTypeName = (): string => {
    switch (localContent.type) {
      case DreamBoardContentType.IMAGE:
        return translations.contentTypes.image;
      default:
        return translations.contentTypes.item;
    }
  };

  // Function to get category color by id
  const getCategoryColor = (categoryId?: string): string => {
    if (!categoryId) return '#999999';
    const category = lifeWheelCategories.find(cat => cat.id === categoryId);
    return category?.color || '#999999';
  };

  // Function to get category name by id
  const getCategoryName = (categoryId?: string): string => {
    if (!categoryId) return translations.fields.none;
    const category = lifeWheelCategories.find(cat => cat.id === categoryId);
    return category?.name || translations.fields.none;
  };

  // Create a reusable input field component with generic typing
  const InputField = <T,>({
    label,
    value,
    onChange,
    type = 'text',
    min,
    max,
    step,
    disabled = false,
    placeholder,
    options,
    className = '',
  }: InputFieldProps<T>): JSX.Element => {
    const [localValue, setLocalValue] = useState<T>(value);

    // Update local value when prop changes
    useEffect(() => {
      setLocalValue(value);
    }, [value]);

    // Debounced change handler for textarea
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const debouncedChange = useCallback(
      (newValue: T) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          onChange(newValue);
          timeoutRef.current = null;
        }, 500);
      },
      [onChange]
    );

    const getInput = (): JSX.Element => {
      switch (type) {
        case 'number':
          return (
            <input
              type="number"
              value={value as unknown as number}
              onChange={e => {
                const numericValue = parseInt(e.target.value) || 0;
                // Use unknown as intermediate type to avoid direct type conversion errors
                onChange(numericValue as unknown as T);
              }}
              min={min}
              max={max}
              step={step}
              disabled={disabled}
              className={`${styles.input} ${className}`}
            />
          );
        case 'color':
          return (
            <div className={styles.colorPickerWrapper}>
              <input
                type="color"
                value={value as unknown as string}
                onChange={e => onChange(e.target.value as unknown as T)}
                disabled={disabled}
                className={`${styles.colorPicker} ${className}`}
              />
              <span className={styles.colorHex}>{value as unknown as string}</span>
            </div>
          );
        case 'textarea':
          return (
            <textarea
              value={localValue as unknown as string}
              onChange={e => {
                const newValue = e.target.value as unknown as T;
                setLocalValue(newValue);
                debouncedChange(newValue);
              }}
              disabled={disabled}
              placeholder={placeholder}
              className={`${styles.textarea} ${className}`}
            />
          );
        case 'select':
          return (
            <select
              value={value as unknown as string}
              onChange={e => onChange(e.target.value as unknown as T)}
              disabled={disabled}
              className={`${styles.select} ${className}`}
            >
              {options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );
        case 'range':
          return (
            <div className={styles.rangeContainer}>
              <input
                type="range"
                value={value as unknown as number}
                onChange={e => onChange(parseInt(e.target.value) as unknown as T)}
                min={min}
                max={max}
                step={step}
                disabled={disabled}
                className={`${styles.rangeInput} ${className}`}
              />
              <span className={styles.rangeValue}>{value as unknown as number}%</span>
            </div>
          );
        default:
          return (
            <input
              type={type}
              value={value as unknown as string}
              onChange={e => onChange(e.target.value as unknown as T)}
              disabled={disabled}
              placeholder={placeholder}
              className={`${styles.input} ${className}`}
            />
          );
      }
    };

    return (
      <div className={styles.field}>
        <label className={styles.label}>{label}</label>
        {getInput()}
      </div>
    );
  };

  // Tab navigation for content types
  const TabNav = (): JSX.Element => (
    <div className={styles.tabNav}>
      <button
        className={`${styles.tab} ${activeTab === 'position' ? styles.activeTab : ''}`}
        onClick={() => setActiveTab('position')}
        style={activeTab === 'position' ? { borderColor: getAccentColor() } : undefined}
      >
        <span className={styles.tabIcon}>📐</span>
        <span className={styles.tabText}>{translations.tabs.position}</span>
      </button>

      <button
        className={`${styles.tab} ${activeTab === 'style' ? styles.activeTab : ''}`}
        onClick={() => setActiveTab('style')}
        style={activeTab === 'style' ? { borderColor: getAccentColor() } : undefined}
      >
        <span className={styles.tabIcon}>🎨</span>
        <span className={styles.tabText}>{translations.tabs.style}</span>
      </button>

      <button
        className={`${styles.tab} ${activeTab === 'milestones' ? styles.activeTab : ''}`}
        onClick={() => setActiveTab('milestones')}
        style={activeTab === 'milestones' ? { borderColor: getAccentColor() } : undefined}
      >
        <span className={styles.tabIcon}>🏆</span>
        <span className={styles.tabText}>{translations.tabs.milestones}</span>
      </button>
    </div>
  );

  // Position & Size tab content
  const PositionTab = (): JSX.Element => (
    <div className={styles.tabContent}>
      <div className={styles.imagePreview}>
        {localContent.src && (
          <img
            src={localContent.src}
            alt={localContent.alt || 'Preview'}
            className={styles.previewImage}
          />
        )}
      </div>
      <button
        className={styles.uploadButton}
        onClick={() => {
          const fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.accept = 'image/*';
          fileInput.onchange = e => {
            const target = e.target as HTMLInputElement;
            if (target.files && target.files[0]) {
              const reader = new FileReader();
              reader.onload = event => {
                if (event.target && typeof event.target.result === 'string') {
                  handleChange({
                    src: event.target.result,
                    alt: target.files ? target.files[0].name : 'Replaced image',
                  });
                }
              };
              reader.readAsDataURL(target.files[0]);
            }
          };
          fileInput.click();
        }}
        style={{ backgroundColor: getAccentColor() }}
      >
        {translations.buttons.replaceImage}
      </button>
      <div className={styles.field}>
        <label className={styles.label}>{translations.fields.title}</label>
        <CaptionInput
          value={localContent.caption || ''}
          onChange={value => handleChange({ caption: value })}
          placeholder={translations.fields.captionPlaceholder}
        />
      </div>

      <InputField<string>
        label={translations.fields.altText}
        value={localContent.alt || ''}
        onChange={value => handleChange({ alt: value })}
        placeholder={translations.fields.altTextPlaceholder}
      />
      <div className={styles.gridLayout}>
        <InputField<number>
          label={translations.fields.xPosition}
          value={Math.round(localContent.position.x)}
          onChange={value => handleChange({ position: { ...localContent.position, x: value } })}
          type="number"
          min={0}
        />

        <InputField<number>
          label={translations.fields.yPosition}
          value={Math.round(localContent.position.y)}
          onChange={value => handleChange({ position: { ...localContent.position, y: value } })}
          type="number"
          min={0}
        />

        <InputField<number>
          label={translations.fields.width}
          value={Math.round(localContent.size.width)}
          onChange={value =>
            handleChange({ size: { ...localContent.size, width: Math.max(50, value) } })
          }
          type="number"
          min={50}
        />

        <InputField<number>
          label={translations.fields.height}
          value={Math.round(localContent.size.height)}
          onChange={value =>
            handleChange({ size: { ...localContent.size, height: Math.max(50, value) } })
          }
          type="number"
          min={50}
        />
      </div>

      <div className={styles.rotationControl}>
        <InputField<number>
          label={translations.fields.rotation}
          value={localContent.rotation || 0}
          onChange={value => handleChange({ rotation: value })}
          type="range"
          min={-180}
          max={180}
          step={5}
        />

        <div
          className={styles.previewBox}
          style={{ transform: `rotate(${localContent.rotation || 0}deg)` }}
        >
          <div>{getContentTypeIcon()}</div>
        </div>
      </div>
    </div>
  );

  // Style tab content based on content type
  const StyleTab = (): JSX.Element => {
    switch (localContent.type) {
      case DreamBoardContentType.IMAGE:
        return (
          <div className={styles.tabContent}>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>{translations.fields.category}</label>
              <div className={styles.categoryDropdown}>
                <select
                  value={localContent.categoryId || ''}
                  onChange={e => handleChange({ categoryId: e.target.value })}
                  className={styles.select}
                >
                  <option value="">{translations.fields.none}</option>
                  {lifeWheelCategories.map(cat => (
                    <option
                      key={cat.id}
                      value={cat.id}
                      style={{
                        background: `linear-gradient(to right, ${cat.color}22, transparent 10%)`,
                        padding: '8px 4px',
                      }}
                    >
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              {localContent.categoryId && (
                <div className={styles.categoryPreview}>
                  <div
                    className={styles.categoryDot}
                    style={{
                      backgroundColor: getCategoryColor(localContent.categoryId),
                    }}
                  ></div>
                  <span
                    style={{
                      color: '#333',
                    }}
                  >
                    {getCategoryName(localContent.categoryId)}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return <div className={styles.tabContent}>{translations.noStylingOptions}</div>;
    }
  };

  // Delete confirmation modal
  const DeleteConfirmation = (): JSX.Element => (
    <div className={styles.deleteConfirmation}>
      <div className={styles.deleteConfirmDialog}>
        <h3>{translations.deleteConfirmation.title}</h3>
        <p>{getDeleteMessage()}</p>

        <div className={styles.deleteConfirmButtons}>
          <button className={styles.cancelButton} onClick={() => setIsDeleting(false)}>
            {translations.buttons.cancel}
          </button>
          <button
            className={styles.confirmDeleteButton}
            onClick={() => {
              onDelete(localContent.id);
              setIsDeleting(false);
            }}
          >
            {translations.buttons.delete}
          </button>
        </div>
      </div>
    </div>
  );

  // Helper functions for interpolated translations
  const getEditTitle = (): string => {
    return t('dreamBoard.board.contentControls.edit', { type: getContentTypeName() }) as string;
  };

  const getDeleteMessage = (): string => {
    return t('dreamBoard.board.contentControls.deleteConfirmation.message', {
      type: getContentTypeName().toLowerCase(),
    }) as string;
  };

  return (
    <>
      <div className={styles.sidebar} ref={controlsRef}>
        <div className={styles.header} style={{ backgroundColor: getAccentColor() }}>
          <div className={styles.headerContent}>
            <div className={styles.contentTypeIcon}>{getContentTypeIcon()}</div>
            <h3>{getEditTitle()}</h3>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <TabNav />

        <div className={styles.content}>
          {activeTab === 'position' && <PositionTab />}
          {activeTab === 'style' && <StyleTab />}
          {activeTab === 'milestones' && (
            <Milestones content={localContent} onUpdate={handleChange} />
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.deleteButton} onClick={() => setIsDeleting(true)}>
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            {translations.buttons.delete}
          </button>
        </div>
      </div>

      {isDeleting && <DeleteConfirmation />}
    </>
  );
};
