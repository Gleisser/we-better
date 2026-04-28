import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DreamBoardTimelineGallery from './DreamBoardTimelineGallery';

const translations = {
  en: {
    'dreamBoard.timelineGallery.title': 'Timeline Gallery',
    'dreamBoard.timelineGallery.subtitle': 'Capture your dreams',
    'dreamBoard.timelineGallery.addImage': 'Add image',
    'dreamBoard.timelineGallery.wizard.title': 'Add a dream image',
    'dreamBoard.timelineGallery.wizard.subtitle': 'Build your dream step by step',
    'dreamBoard.timelineGallery.wizard.steps.file.title': 'Choose a file',
    'dreamBoard.timelineGallery.wizard.steps.file.description': 'Select an image up to 5 MB',
    'dreamBoard.timelineGallery.wizard.steps.details.title': 'Add details',
    'dreamBoard.timelineGallery.wizard.steps.details.description': 'Write the dream title',
    'dreamBoard.timelineGallery.wizard.steps.category.title': 'Pick a category',
    'dreamBoard.timelineGallery.wizard.steps.category.description': 'Choose where it belongs',
    'dreamBoard.timelineGallery.wizard.steps.milestones.title': 'Plan milestones',
    'dreamBoard.timelineGallery.wizard.steps.milestones.description': 'Break it into steps',
    'dreamBoard.timelineGallery.wizard.fileLimit.title': 'Upload limit',
    'dreamBoard.timelineGallery.wizard.fileLimit.default': 'You can upload up to 5 MB',
    'dreamBoard.timelineGallery.wizard.fileLimit.badge': '5 MB max',
    'dreamBoard.timelineGallery.wizard.dropzone.title': 'Drop an image here',
    'dreamBoard.timelineGallery.wizard.dropzone.hint': 'Drag and drop a file',
    'dreamBoard.timelineGallery.wizard.dropzone.browse': 'Browse',
    'dreamBoard.timelineGallery.wizard.buttons.cancel': 'Cancel',
    'dreamBoard.timelineGallery.wizard.buttons.next': 'Next',
    'dreamBoard.timelineGallery.status.saved': 'Saved',
  },
  pt: {
    'dreamBoard.timelineGallery.title': 'Galeria da linha do tempo',
    'dreamBoard.timelineGallery.subtitle': 'Capture seus sonhos',
    'dreamBoard.timelineGallery.addImage': 'Adicionar imagem',
    'dreamBoard.timelineGallery.wizard.title': 'Adicionar uma imagem do sonho',
    'dreamBoard.timelineGallery.wizard.subtitle': 'Monte seu sonho passo a passo',
    'dreamBoard.timelineGallery.wizard.steps.file.title': 'Escolha um arquivo',
    'dreamBoard.timelineGallery.wizard.steps.file.description': 'Selecione uma imagem de ate 5 MB',
    'dreamBoard.timelineGallery.wizard.steps.details.title': 'Adicionar detalhes',
    'dreamBoard.timelineGallery.wizard.steps.details.description': 'Escreva o titulo do sonho',
    'dreamBoard.timelineGallery.wizard.steps.category.title': 'Escolha uma categoria',
    'dreamBoard.timelineGallery.wizard.steps.category.description': 'Escolha onde ela pertence',
    'dreamBoard.timelineGallery.wizard.steps.milestones.title': 'Planeje marcos',
    'dreamBoard.timelineGallery.wizard.steps.milestones.description': 'Divida em etapas',
    'dreamBoard.timelineGallery.wizard.fileLimit.title': 'Limite de upload',
    'dreamBoard.timelineGallery.wizard.fileLimit.default': 'Voce pode enviar ate 5 MB',
    'dreamBoard.timelineGallery.wizard.fileLimit.badge': 'Maximo de 5 MB',
    'dreamBoard.timelineGallery.wizard.dropzone.title': 'Solte uma imagem aqui',
    'dreamBoard.timelineGallery.wizard.dropzone.hint': 'Arraste e solte um arquivo',
    'dreamBoard.timelineGallery.wizard.dropzone.browse': 'Selecionar',
    'dreamBoard.timelineGallery.wizard.buttons.cancel': 'Cancelar',
    'dreamBoard.timelineGallery.wizard.buttons.next': 'Proximo',
    'dreamBoard.timelineGallery.status.saved': 'Salvo',
  },
} as const;

let activeLanguage: 'en' | 'pt' = 'en';

const stableTranslator = (key: string, options?: Record<string, unknown>): string => {
  const dictionary = translations[activeLanguage];
  const translated = dictionary[key as keyof typeof dictionary] ?? key;

  if (options?.limit) {
    return translated.replace('5 MB', String(options.limit));
  }

  return translated;
};

vi.mock('@/shared/hooks/useTranslation', () => {
  return {
    useDreamBoardTranslation: () => ({
      t: (...args: any[]) => stableTranslator(args[0], args[1]),
      currentLanguage: activeLanguage,
    }),
  };
});

describe('DreamBoardTimelineGallery', () => {
  beforeEach(() => {
    activeLanguage = 'en';

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('updates wizard step copy when the language changes', () => {
    const { rerender } = render(
      <DreamBoardTimelineGallery
        dreams={[]}
        onAddImage={vi.fn(async () => undefined)}
        onRemoveImage={vi.fn()}
        isDreamBoardSaving={false}
        hasUnsavedChanges={false}
        categories={['Career']}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add image' }));

    expect(screen.getAllByText('Choose a file')).toHaveLength(2);
    expect(screen.getByText('Add details')).not.toBeNull();

    activeLanguage = 'pt';

    rerender(
      <DreamBoardTimelineGallery
        dreams={[]}
        onAddImage={vi.fn(async () => undefined)}
        onRemoveImage={vi.fn()}
        isDreamBoardSaving={false}
        hasUnsavedChanges={false}
        categories={['Career']}
      />
    );

    expect(screen.getAllByText('Escolha um arquivo')).toHaveLength(2);
    expect(screen.getByText('Adicionar detalhes')).not.toBeNull();
    expect(screen.queryAllByText('Choose a file')).toHaveLength(0);
  });
});
