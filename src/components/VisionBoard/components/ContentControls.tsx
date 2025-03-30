import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VisionBoardContent, VisionBoardContentType, GoalDetails } from '../types';
import { LifeCategory } from '@/components/LifeWheel/types';
import styles from './ContentControls.module.css';

// Debounce function with proper types
function debounce<T extends (...args: any[]) => any>(
  fn: T, 
  ms = 300
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function(this: void, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}

interface ContentControlsProps {
  selectedContent: VisionBoardContent;
  onUpdate: (content: VisionBoardContent) => void;
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
  options?: {value: string; label: string}[];
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
  const handleBlur = () => {
    onChange(localValue);
  };
  
  return (
    <textarea
      ref={inputRef}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
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
  lifeWheelCategories = []
}) => {
  // Local state to manage form values
  const [localContent, setLocalContent] = useState<VisionBoardContent>(selectedContent);
  const [activeTab, setActiveTab] = useState<string>('position');
  const [isDeleting, setIsDeleting] = useState(false);
  const controlsRef = useRef<HTMLDivElement>(null);
  
  // Debug lifecategories - remove after testing
  console.log('lifeWheelCategories:', lifeWheelCategories);
  
  // Update local state when selected content changes
  useEffect(() => {
    setLocalContent(selectedContent);
  }, [selectedContent]);
  
  // Handler for form changes
  const handleChange = (changes: Partial<VisionBoardContent>) => {
    const updatedContent = { ...localContent, ...changes };
    setLocalContent(updatedContent);
    onUpdate(updatedContent);
  };
  
  // Toggle goal state
  const handleToggleGoal = () => {
    const isCurrentlyGoal = !!localContent.isGoal;
    
    const newGoalDetails: GoalDetails = { 
      title: localContent.text || "New Goal", 
      description: "", 
      progress: 0 
    };
    
    handleChange({
      isGoal: !isCurrentlyGoal,
      goalDetails: !isCurrentlyGoal ? newGoalDetails : undefined
    });
  };
  
  // Handle color scheme based on content type
  const getAccentColor = () => {
    switch (localContent.type) {
      case VisionBoardContentType.TEXT:
        return '#3b82f6'; // Blue
      case VisionBoardContentType.IMAGE:
        return '#10b981'; // Green
      case VisionBoardContentType.AI_GENERATED:
        return '#8b5cf6'; // Purple
      case VisionBoardContentType.AUDIO:
        return '#f59e0b'; // Amber
      default:
        return '#3b82f6';
    }
  };
  
  const getContentTypeIcon = () => {
    switch (localContent.type) {
      case VisionBoardContentType.TEXT:
        return '📝';
      case VisionBoardContentType.IMAGE:
        return '🖼️';
      case VisionBoardContentType.AI_GENERATED:
        return '🤖';
      case VisionBoardContentType.AUDIO:
        return '🎙️';
      default:
        return '📌';
    }
  };

  const getContentTypeName = () => {
    switch (localContent.type) {
      case VisionBoardContentType.TEXT:
        return 'Text';
      case VisionBoardContentType.IMAGE:
        return 'Image';
      case VisionBoardContentType.AI_GENERATED:
        return 'AI Image';
      case VisionBoardContentType.AUDIO:
        return 'Audio';
      default:
        return 'Item';
    }
  };
  
  // Function to get category color by id
  const getCategoryColor = (categoryId?: string) => {
    if (!categoryId) return '#999999';
    const category = lifeWheelCategories.find(cat => cat.id === categoryId);
    return category?.color || '#999999';
  };
  
  // Function to get category name by id
  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return 'None';
    const category = lifeWheelCategories.find(cat => cat.id === categoryId);
    return category?.name || 'None';
  };
  
  // Create a reusable input field component with generic typing
  function InputField<T>({ 
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
    className = ''
  }: InputFieldProps<T>) {
    const [localValue, setLocalValue] = useState<T>(value);
    
    // Update local value when prop changes
    useEffect(() => {
      setLocalValue(value);
    }, [value]);
    
    // Debounced change handler for textarea
    const debouncedChange = useCallback(
      debounce((newValue: T) => {
        onChange(newValue);
      }, 500),
      [onChange]
    );
    
    const getInput = () => {
      switch (type) {
        case 'number':
          return (
            <input
              type="number"
              value={value as unknown as number}
              onChange={(e) => {
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
                onChange={(e) => onChange(e.target.value as unknown as T)}
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
              onChange={(e) => {
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
              onChange={(e) => onChange(e.target.value as unknown as T)}
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
                onChange={(e) => onChange(parseInt(e.target.value) as unknown as T)}
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
              onChange={(e) => onChange(e.target.value as unknown as T)}
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
  }
  
  // Tab navigation for content types
  const TabNav = () => (
    <div className={styles.tabNav}>
      <button 
        className={`${styles.tab} ${activeTab === 'position' ? styles.activeTab : ''}`}
        onClick={() => setActiveTab('position')}
        style={activeTab === 'position' ? {borderColor: getAccentColor()} : undefined}
      >
        <span className={styles.tabIcon}>📐</span>
        <span className={styles.tabText}>Position</span>
      </button>
      
      <button 
        className={`${styles.tab} ${activeTab === 'style' ? styles.activeTab : ''}`}
        onClick={() => setActiveTab('style')}
        style={activeTab === 'style' ? {borderColor: getAccentColor()} : undefined}
      >
        <span className={styles.tabIcon}>🎨</span>
        <span className={styles.tabText}>Style</span>
      </button>
      
      <button 
        className={`${styles.tab} ${activeTab === 'goal' ? styles.activeTab : ''}`}
        onClick={() => setActiveTab('goal')}
        style={activeTab === 'goal' ? {borderColor: getAccentColor()} : undefined}
      >
        <span className={styles.tabIcon}>🎯</span>
        <span className={styles.tabText}>Goal</span>
      </button>
    </div>
  );

  // Position & Size tab content
  const PositionTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.gridLayout}>
        <InputField<number>
          label="X Position"
          value={Math.round(localContent.position.x)}
          onChange={(value) => 
            handleChange({ position: { ...localContent.position, x: value } })
          }
          type="number"
          min={0}
        />
        
        <InputField<number>
          label="Y Position"
          value={Math.round(localContent.position.y)}
          onChange={(value) => 
            handleChange({ position: { ...localContent.position, y: value } })
          }
          type="number"
          min={0}
        />
        
        <InputField<number>
          label="Width"
          value={Math.round(localContent.size.width)}
          onChange={(value) => 
            handleChange({ size: { ...localContent.size, width: Math.max(50, value) } })
          }
          type="number"
          min={50}
        />
        
        <InputField<number>
          label="Height"
          value={Math.round(localContent.size.height)}
          onChange={(value) => 
            handleChange({ size: { ...localContent.size, height: Math.max(50, value) } })
          }
          type="number"
          min={50}
        />
      </div>
      
      <div className={styles.rotationControl}>
        <InputField<number>
          label="Rotation"
          value={localContent.rotation || 0}
          onChange={(value) => handleChange({ rotation: value })}
          type="range"
          min={-180}
          max={180}
          step={5}
        />
        
        <div className={styles.previewBox} style={{ transform: `rotate(${localContent.rotation || 0}deg)` }}>
          <div>{getContentTypeIcon()}</div>
        </div>
      </div>
    </div>
  );
  
  // Style tab content based on content type
  const StyleTab = () => {
    switch (localContent.type) {
      case VisionBoardContentType.TEXT:
        return (
          <div className={styles.tabContent}>
            <InputField<string>
              label="Text Content"
              value={localContent.text || ''}
              onChange={(value) => handleChange({ text: value })}
              type="textarea"
              placeholder="Enter your text here..."
            />
            
            <div className={styles.gridLayout}>
              <InputField<string>
                label="Font Color"
                value={localContent.fontColor || '#000000'}
                onChange={(value) => handleChange({ fontColor: value })}
                type="color"
              />
              
              <InputField<number>
                label="Font Size"
                value={localContent.fontSize || 16}
                onChange={(value) => handleChange({ fontSize: value })}
                type="number"
                min={8}
                max={72}
              />
            </div>
            
            <div className={styles.gridLayout}>
              <InputField<string>
                label="Font Family"
                value={localContent.fontFamily || 'Arial, sans-serif'}
                onChange={(value) => handleChange({ fontFamily: value })}
                type="select"
                options={[
                  { value: 'Arial, sans-serif', label: 'Arial' },
                  { value: 'Times New Roman, serif', label: 'Times New Roman' },
                  { value: 'Courier New, monospace', label: 'Courier New' },
                  { value: 'Georgia, serif', label: 'Georgia' },
                  { value: 'Verdana, sans-serif', label: 'Verdana' },
                  { value: 'Impact, sans-serif', label: 'Impact' }
                ]}
              />
              
              <InputField<string>
                label="Text Align"
                value={localContent.textAlign || 'center'}
                onChange={(value) => handleChange({ textAlign: value })}
                type="select"
                options={[
                  { value: 'left', label: 'Left' },
                  { value: 'center', label: 'Center' },
                  { value: 'right', label: 'Right' }
                ]}
              />
            </div>
            
            <InputField<string>
              label="Font Weight"
              value={localContent.fontWeight || 'normal'}
              onChange={(value) => handleChange({ fontWeight: value })}
              type="select"
              options={[
                { value: 'normal', label: 'Normal' },
                { value: 'bold', label: 'Bold' },
                { value: 'lighter', label: 'Light' }
              ]}
            />
          </div>
        );
        
      case VisionBoardContentType.IMAGE:
      case VisionBoardContentType.AI_GENERATED:
        return (
          <div className={styles.tabContent}>
            <div className={styles.imagePreview}>
              {localContent.src && (
                <img src={localContent.src} alt={localContent.alt || 'Preview'} className={styles.previewImage} />
              )}
            </div>
            
            <button
              className={styles.uploadButton}
              onClick={() => {
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = 'image/*';
                fileInput.onchange = (e) => {
                  const target = e.target as HTMLInputElement;
                  if (target.files && target.files[0]) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      if (event.target && typeof event.target.result === 'string') {
                        handleChange({ 
                          src: event.target.result,
                          alt: target.files ? target.files[0].name : 'Replaced image'
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
              Replace Image
            </button>
            
            {localContent.type === VisionBoardContentType.AI_GENERATED && (
              <InputField<string>
                label="AI Prompt"
                value={localContent.prompt || ''}
                onChange={(value) => handleChange({ prompt: value })}
                type="textarea"
                placeholder="AI generation prompt..."
              />
            )}
            
            <div className={styles.field}>
              <label className={styles.label}>Caption</label>
              <CaptionInput
                value={localContent.caption || ''}
                onChange={(value) => handleChange({ caption: value })}
                placeholder="Add a caption for this image..."
              />
            </div>
            
            <InputField<string>
              label="Alt Text"
              value={localContent.alt || ''}
              onChange={(value) => handleChange({ alt: value })}
              placeholder="Image description for accessibility"
            />
            
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>Category</label>
              <div className={styles.categoryDropdown}>
                <select
                  value={localContent.categoryId || ''}
                  onChange={(e) => handleChange({ categoryId: e.target.value })}
                  className={styles.select}
                >
                  <option value="">None</option>
                  {lifeWheelCategories.map(cat => (
                    <option 
                      key={cat.id} 
                      value={cat.id}
                      style={{ 
                        background: `linear-gradient(to right, ${cat.color}22, transparent 10%)`,
                        padding: '8px 4px'
                      }}
                    >
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {localContent.categoryId && (
                <div className={styles.categoryPreview}>
                  <div className={styles.categoryDot} style={{ 
                    backgroundColor: getCategoryColor(localContent.categoryId)
                  }}></div>
                  <span>{getCategoryName(localContent.categoryId)}</span>
                </div>
              )}
            </div>
          </div>
        );
        
      case VisionBoardContentType.AUDIO:
        return (
          <div className={styles.tabContent}>
            <InputField<string>
              label="Transcription"
              value={localContent.transcription || ''}
              onChange={(value) => handleChange({ transcription: value })}
              type="textarea"
              placeholder="Audio transcription or notes..."
            />
            
            {localContent.audioUrl && (
              <div className={styles.audioPreview}>
                <audio 
                  src={localContent.audioUrl} 
                  controls 
                  className={styles.audioPlayer}
                />
              </div>
            )}
            
            <button
              className={styles.uploadButton}
              onClick={() => {
                // For now, just show a message about the future feature
                alert("Audio recording feature coming soon!");
              }}
              style={{ backgroundColor: getAccentColor() }}
            >
              Record New Audio
            </button>
          </div>
        );
        
      default:
        return <div className={styles.tabContent}>No styling options available</div>;
    }
  };
  
  // Goal tab content
  const GoalTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.goalToggle}>
        <span className={styles.goalLabel}>Set as Goal</span>
        <label className={styles.switch}>
          <input 
            type="checkbox"
            checked={!!localContent.isGoal}
            onChange={handleToggleGoal}
          />
          <span className={styles.slider}></span>
        </label>
      </div>
      
      {localContent.isGoal && localContent.goalDetails && (
        <div className={styles.goalSettings}>
          <InputField<string>
            label="Goal Title"
            value={localContent.goalDetails.title}
            onChange={(value) => {
              if (localContent.goalDetails) {
                handleChange({
                  goalDetails: {
                    ...localContent.goalDetails,
                    title: value || "Goal"
                  }
                });
              }
            }}
            placeholder="Enter goal title..."
          />
          
          <InputField<string>
            label="Description"
            value={localContent.goalDetails.description}
            onChange={(value) => {
              if (localContent.goalDetails) {
                handleChange({
                  goalDetails: {
                    ...localContent.goalDetails,
                    description: value
                  }
                });
              }
            }}
            type="textarea"
            placeholder="Describe your goal..."
          />
          
          <InputField<number>
            label="Progress"
            value={localContent.goalDetails.progress}
            onChange={(value) => {
              if (localContent.goalDetails) {
                handleChange({
                  goalDetails: {
                    ...localContent.goalDetails,
                    progress: value
                  }
                });
              }
            }}
            type="range"
            min={0}
            max={100}
            step={5}
          />
          
          <div className={styles.progressIndicator}>
            <div 
              className={styles.progressBar} 
              style={{ 
                width: `${localContent.goalDetails.progress}%`,
                backgroundColor: getProgressColor(localContent.goalDetails.progress)
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
  
  // Helper function to get progress color based on percentage
  const getProgressColor = (progress: number) => {
    if (progress < 30) return '#ef4444'; // Red
    if (progress < 70) return '#f59e0b'; // Amber
    return '#10b981'; // Green
  };
  
  // Delete confirmation modal
  const DeleteConfirmation = () => (
    <div className={styles.deleteConfirmation}>
      <div className={styles.deleteConfirmDialog}>
        <h3>Delete Item</h3>
        <p>Are you sure you want to delete this {getContentTypeName().toLowerCase()}? This action cannot be undone.</p>
        
        <div className={styles.deleteConfirmButtons}>
          <button 
            className={styles.cancelButton}
            onClick={() => setIsDeleting(false)}
          >
            Cancel
          </button>
          <button 
            className={styles.confirmDeleteButton}
            onClick={() => {
              onDelete(localContent.id);
              setIsDeleting(false);
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
  
  return (
    <>
      <div className={styles.sidebar} ref={controlsRef}>
        <div className={styles.header} style={{ backgroundColor: getAccentColor() }}>
          <div className={styles.headerContent}>
            <div className={styles.contentTypeIcon}>{getContentTypeIcon()}</div>
            <h3>Edit {getContentTypeName()}</h3>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <TabNav />
        
        <div className={styles.content}>
          {activeTab === 'position' && <PositionTab />}
          {activeTab === 'style' && <StyleTab />}
          {activeTab === 'goal' && <GoalTab />}
        </div>
        
        <div className={styles.footer}>
          <button 
            className={styles.deleteButton}
            onClick={() => setIsDeleting(true)}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            Delete
          </button>
        </div>
      </div>
      
      {isDeleting && <DeleteConfirmation />}
    </>
  );
}; 