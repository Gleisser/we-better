import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DreamBoardPreviewImage from './DreamBoardPreviewImage';
import { renewDreamBoardPreviewUrls } from '../../api/dreamBoardPreviewApi';

vi.mock('../../api/dreamBoardPreviewApi', () => ({
  renewDreamBoardPreviewUrls: vi.fn(),
}));

const mockedRenewPreviewUrls = vi.mocked(renewDreamBoardPreviewUrls);

describe('DreamBoardPreviewImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('proactively renews a private ref that arrives without a usable preview URL', async () => {
    mockedRenewPreviewUrls.mockResolvedValue({
      imagePreviewCardUrl: '/api/dream-board/previews?variant=card&expires=123',
      imagePreviewWidgetUrl: '/api/dream-board/previews?variant=widget&expires=123',
    });

    render(
      <DreamBoardPreviewImage
        image={{
          imageStorageBucket: 'dream-board-images',
          imageStoragePath: 'user-1/dream-1/random.webp',
        }}
        alt="Private dream"
        variant="card"
        loading="lazy"
      />
    );

    expect(mockedRenewPreviewUrls).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.getByAltText('Private dream').getAttribute('src')).toContain(
        '/api/dream-board/previews'
      );
    });
  });

  it('does not update state when renewal completes after unmount', async () => {
    let resolveRenewal:
      | ((value: { imagePreviewCardUrl: string; imagePreviewWidgetUrl: string }) => void)
      | undefined;
    mockedRenewPreviewUrls.mockReturnValue(
      new Promise(resolve => {
        resolveRenewal = resolve;
      })
    );

    const { unmount } = render(
      <DreamBoardPreviewImage
        image={{
          imageStorageBucket: 'dream-board-images',
          imageStoragePath: 'user-1/dream-1/random.webp',
        }}
        alt="Private dream"
        variant="card"
        loading="lazy"
      />
    );

    unmount();
    resolveRenewal?.({
      imagePreviewCardUrl: '/api/dream-board/previews?variant=card',
      imagePreviewWidgetUrl: '/api/dream-board/previews?variant=widget',
    });
    await Promise.resolve();

    expect(mockedRenewPreviewUrls).toHaveBeenCalledTimes(1);
  });
});
