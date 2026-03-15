import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeAll, beforeEach, afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import DreamBoardPage from '../DreamBoardPage';
import { DreamBoardContentType, DreamBoardData } from '../types';
import { getLatestDreamBoardData, saveDreamBoardData } from '../api/dreamBoardApi';
import { createMilestoneForContent } from '../services/milestonesService';
import { validateDreamBoardUploadFile } from '../utils/imagePersistence';
import { uploadDreamBoardImageFile } from '../utils/imageStorage';

const mockUpdateProgressBackend = vi.fn(async () => 0.5);
const mockGetProgressForDream = vi.fn(async () => undefined);

vi.mock('@/shared/hooks/useTranslation', () => ({
  useDreamBoardTranslation: () => ({
    t: (key: string): string => key,
  }),
  useCommonTranslation: () => ({
    t: (key: string): string => key,
  }),
}));

vi.mock('../api/dreamBoardApi', () => ({
  getLatestDreamBoardData: vi.fn(),
  saveDreamBoardData: vi.fn(),
}));

vi.mock('../utils/imagePersistence', async () => {
  return {
    formatBytes: vi.fn((bytes: number) => `${bytes} B`),
    formatDreamBoardImageLimit: vi.fn(() => '5 MB'),
    validateDreamBoardUploadFile: vi.fn(async () => ({
      originalBytes: 1024,
      fitsLimit: true,
      mimeType: 'image/png',
      reason: null,
    })),
  };
});

vi.mock('../utils/imageStorage', () => ({
  uploadDreamBoardImageFile: vi.fn(async (_file: File, contentId: string) => ({
    bucket: 'dream-board-images',
    path: `mock-user/${contentId}/dream.png`,
    publicUrl: `https://example.com/mock-user/${contentId}/dream.png`,
    mimeType: 'image/png',
    fileSizeBytes: 1024,
  })),
  deleteDreamBoardStorageFiles: vi.fn(async () => undefined),
}));

vi.mock('../services/milestonesService', () => ({
  createMilestoneForContent: vi.fn(async (_dreamId: string, payload: { title: string }) => ({
    id: `milestone-${payload.title}`,
    title: payload.title,
    completed: false,
  })),
  updateMilestoneForContent: vi.fn(),
  deleteMilestoneForContent: vi.fn(),
  toggleMilestoneCompletionForContent: vi.fn(),
}));

vi.mock('../hooks/useDreamWeather', () => ({
  useDreamWeather: () => ({
    weather: null,
    error: null,
  }),
}));

vi.mock('../hooks/useDreamProgress', () => ({
  useDreamProgress: () => ({
    updateDreamProgress: mockUpdateProgressBackend,
    getProgressForDream: mockGetProgressForDream,
    loading: false,
    error: null,
  }),
}));

vi.mock('../components/DreamCategories', () => ({
  default: () => <div data-testid="dream-categories" />,
}));

vi.mock('../components/DreamProgress', () => ({
  default: () => <div data-testid="dream-progress" />,
}));

vi.mock('../components/DreamInsights', () => ({
  default: () => <div data-testid="dream-insights" />,
}));

vi.mock('../components/FooterTools', () => ({
  default: () => <div data-testid="footer-tools" />,
}));

vi.mock('../components/MilestonesPopup', () => ({
  default: () => null,
}));

vi.mock('../components/DreamChallenge', () => ({
  DreamChallengeContainer: () => <div data-testid="dream-challenge" />,
}));

vi.mock('../components/CosmicDreamExperience/CosmicDreamExperience', () => ({
  CosmicDreamExperience: () => <div data-testid="dream-experience" />,
}));

const mockedGetLatestDreamBoardData = vi.mocked(getLatestDreamBoardData);
const mockedSaveDreamBoardData = vi.mocked(saveDreamBoardData);
const mockedCreateMilestoneForContent = vi.mocked(createMilestoneForContent);
const mockedValidateDreamBoardUploadFile = vi.mocked(validateDreamBoardUploadFile);
const mockedUploadDreamBoardImageFile = vi.mocked(uploadDreamBoardImageFile);

const createDreamBoardData = (count: number): DreamBoardData => ({
  id: 'board-1',
  title: 'My Dream Board',
  description: 'Visualize • Believe • Achieve',
  categories: ['Career'],
  content: Array.from({ length: count }, (_, index) => ({
    id: `dream-${index + 1}`,
    type: DreamBoardContentType.IMAGE,
    position: { x: index * 20, y: index * 20 },
    size: { width: 200, height: 150 },
    rotation: 0,
    categoryId: 'Career',
    src: `data:image/png;base64,mock-image-${index + 1}`,
    alt: `Dream ${index + 1}`,
    caption: `Dream ${index + 1}`,
  })),
});

class MockFileReader {
  public result: string | ArrayBuffer | null = null;
  public onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null;
  public onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null;

  readAsDataURL(): void {
    this.result = 'data:image/png;base64,new-image';
    if (this.onload) {
      this.onload.call(this as unknown as FileReader, {} as ProgressEvent<FileReader>);
    }
  }
}

beforeAll(() => {
  vi.stubGlobal('FileReader', MockFileReader as unknown as typeof FileReader);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

beforeEach(() => {
  vi.clearAllMocks();
  mockUpdateProgressBackend.mockClear();
  mockGetProgressForDream.mockClear();
  mockedCreateMilestoneForContent.mockClear();
  mockedValidateDreamBoardUploadFile.mockClear();
  mockedUploadDreamBoardImageFile.mockClear();

  mockedGetLatestDreamBoardData.mockResolvedValue(null);
  mockedSaveDreamBoardData.mockResolvedValue(createDreamBoardData(1));
  mockedValidateDreamBoardUploadFile.mockResolvedValue({
    originalBytes: 1024,
    fitsLimit: true,
    mimeType: 'image/png',
    reason: null,
  });

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

  Object.defineProperty(window, 'confirm', {
    writable: true,
    value: vi.fn(() => true),
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('DreamBoardPage timeline gallery flow', () => {
  it('renders focused onboarding when there are no dreams', async () => {
    render(<DreamBoardPage />);

    expect(await screen.findByText('dreamBoard.emptyState.firstImage.title')).not.toBeNull();
    expect(screen.getByText('dreamBoard.emptyState.firstImage.description')).not.toBeNull();
    expect(
      screen.getByText('dreamBoard.emptyState.firstImage.features.quickVision')
    ).not.toBeNull();
  });

  it('uploads first image and transitions from onboarding to vision board content', async () => {
    render(<DreamBoardPage />);

    const input = await screen.findByTestId('dream-board-empty-upload-input');
    const file = new File(['binary'], 'dream.png', { type: 'image/png' });

    fireEvent.change(input, { target: { files: [file] } });

    expect(await screen.findByText('dreamBoard.timelineGallery.title')).not.toBeNull();
    expect(screen.queryByText('dreamBoard.emptyState.firstImage.title')).toBeNull();

    await waitFor(
      () => {
        expect(mockedSaveDreamBoardData).toHaveBeenCalled();
      },
      { timeout: 2500 }
    );
  });

  it('renders inline gallery before Quick Vision', async () => {
    mockedGetLatestDreamBoardData.mockResolvedValue(createDreamBoardData(1));

    render(<DreamBoardPage />);

    const galleryHeading = await screen.findByText('dreamBoard.timelineGallery.title');
    const quickVisionHeading = screen.getByText('dreamBoard.quickVision.title');

    expect(
      Boolean(
        galleryHeading.compareDocumentPosition(quickVisionHeading) &
          Node.DOCUMENT_POSITION_FOLLOWING
      )
    ).toBe(true);
  });

  it('opens upload form and saves title/category/milestones for a new image', async () => {
    mockedGetLatestDreamBoardData.mockResolvedValue(createDreamBoardData(1));
    mockedSaveDreamBoardData.mockResolvedValue(createDreamBoardData(2));

    render(<DreamBoardPage />);

    fireEvent.click(await screen.findByText('dreamBoard.timelineGallery.addImage'));
    expect(await screen.findByText('dreamBoard.timelineGallery.wizard.title')).not.toBeNull();

    fireEvent.change(await screen.findByLabelText('dreamBoard.timelineGallery.form.fileLabel'), {
      target: { files: [new File(['binary'], 'bridge.png', { type: 'image/png' })] },
    });

    await waitFor(() => {
      expect(
        screen.getByText('dreamBoard.timelineGallery.wizard.validation.fileReady')
      ).not.toBeNull();
    });

    expect(screen.getByText('dreamBoard.timelineGallery.wizard.fileLimit.title')).not.toBeNull();
    expect(
      screen.getByText('dreamBoard.timelineGallery.wizard.preview.originalSize')
    ).not.toBeNull();

    fireEvent.click(screen.getByText('dreamBoard.timelineGallery.wizard.buttons.next'));

    fireEvent.change(screen.getByLabelText('dreamBoard.timelineGallery.form.dreamTitleLabel'), {
      target: { value: 'Golden Bridge Dream' },
    });
    fireEvent.click(screen.getByText('dreamBoard.timelineGallery.wizard.buttons.next'));

    fireEvent.click(screen.getByRole('button', { name: /Finances/i }));
    fireEvent.click(screen.getByText('dreamBoard.timelineGallery.wizard.buttons.next'));

    fireEvent.click(screen.getByText('dreamBoard.timelineGallery.form.addMilestone'));
    fireEvent.change(
      screen.getByPlaceholderText('dreamBoard.timelineGallery.form.milestoneTitlePlaceholder'),
      {
        target: { value: 'Save 10k' },
      }
    );

    fireEvent.click(screen.getByText('dreamBoard.timelineGallery.wizard.buttons.save'));

    await waitFor(() => {
      expect(mockedSaveDreamBoardData).toHaveBeenCalled();
    });

    const latestPayload = mockedSaveDreamBoardData.mock.calls.at(-1)?.[0];
    expect(latestPayload).toBeTruthy();

    const addedContent = latestPayload?.content?.find(
      (content: { alt?: string }) => content.alt === 'Golden Bridge Dream'
    );
    expect(addedContent).toBeTruthy();
    expect(addedContent?.categoryId).toBe('Finances');

    await waitFor(() => {
      expect(mockedCreateMilestoneForContent).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ title: 'Save 10k' })
      );
    });
  });

  it('removes an image and schedules autosave', async () => {
    mockedGetLatestDreamBoardData.mockResolvedValue(createDreamBoardData(1));
    mockedSaveDreamBoardData.mockResolvedValue(createDreamBoardData(0));

    render(<DreamBoardPage />);

    const removeButton = await screen.findByLabelText('dreamBoard.timelineGallery.removeImageAria');
    fireEvent.click(removeButton);
    expect(window.confirm).toHaveBeenCalledWith('dreamBoard.timelineGallery.removeImageConfirm');

    expect(await screen.findByText('dreamBoard.emptyState.firstImage.title')).not.toBeNull();
    expect(mockedSaveDreamBoardData).not.toHaveBeenCalled();

    await waitFor(
      () => {
        expect(mockedSaveDreamBoardData).toHaveBeenCalledTimes(1);
      },
      { timeout: 2500 }
    );

    const savedPayload = mockedSaveDreamBoardData.mock.calls[0][0];
    expect(savedPayload.content).toHaveLength(0);
  });

  it('does not remove an image when user cancels confirmation', async () => {
    mockedGetLatestDreamBoardData.mockResolvedValue(createDreamBoardData(1));
    vi.mocked(window.confirm).mockReturnValue(false);

    render(<DreamBoardPage />);

    const removeButton = await screen.findByLabelText('dreamBoard.timelineGallery.removeImageAria');
    fireEvent.click(removeButton);

    expect(window.confirm).toHaveBeenCalledWith('dreamBoard.timelineGallery.removeImageConfirm');
    expect(screen.queryByText('dreamBoard.emptyState.firstImage.title')).toBeNull();
    expect(mockedSaveDreamBoardData).not.toHaveBeenCalled();
  });

  it('shows image limit error when trying to add more than 7 images', async () => {
    mockedGetLatestDreamBoardData.mockResolvedValue(createDreamBoardData(7));

    render(<DreamBoardPage />);

    const addButton = await screen.findByText('dreamBoard.timelineGallery.addImage');
    expect(addButton.getAttribute('disabled')).not.toBeNull();
    fireEvent.click(addButton);
    expect(screen.queryByText('dreamBoard.timelineGallery.wizard.title')).toBeNull();
    expect(mockedSaveDreamBoardData).not.toHaveBeenCalled();
  });

  it('shows file-size validation feedback as soon as an oversized image is chosen', async () => {
    mockedGetLatestDreamBoardData.mockResolvedValue(createDreamBoardData(1));
    mockedValidateDreamBoardUploadFile.mockResolvedValueOnce({
      originalBytes: 7 * 1024 * 1024,
      fitsLimit: false,
      mimeType: 'image/png',
      reason: 'fileTooLarge',
    });

    render(<DreamBoardPage />);

    fireEvent.click(await screen.findByText('dreamBoard.timelineGallery.addImage'));
    expect(
      (await screen.findAllByText('dreamBoard.timelineGallery.wizard.steps.file.description'))
        .length
    ).toBeGreaterThan(0);

    fireEvent.change(await screen.findByLabelText('dreamBoard.timelineGallery.form.fileLabel'), {
      target: { files: [new File(['oversized'], 'large.png', { type: 'image/png' })] },
    });

    expect(
      await screen.findByText('dreamBoard.timelineGallery.wizard.validation.fileTooLarge')
    ).not.toBeNull();
    expect(screen.getByText('dreamBoard.timelineGallery.wizard.fileLimit.title')).not.toBeNull();
    expect(screen.getByText('dreamBoard.timelineGallery.wizard.fileLimit.tooLarge')).not.toBeNull();
    expect(mockedSaveDreamBoardData).not.toHaveBeenCalled();
  });

  it('does not render the old My Dream Board button in Quick Vision', async () => {
    mockedGetLatestDreamBoardData.mockResolvedValue(createDreamBoardData(1));

    render(<DreamBoardPage />);

    await screen.findByText('dreamBoard.quickVision.title');
    expect(screen.queryByText('dreamBoard.quickVision.myDreamBoard')).toBeNull();
  });
});
