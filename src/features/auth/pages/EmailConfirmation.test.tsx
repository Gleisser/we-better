import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import EmailConfirmation from './EmailConfirmation';

const { confirmEmailMock, navigateMock } = vi.hoisted(() => ({
  confirmEmailMock: vi.fn(),
  navigateMock: vi.fn(),
}));

vi.mock('@/core/services/authService', () => ({
  authService: {
    confirmEmail: (...args: unknown[]) => confirmEmailMock(...args),
  },
}));

vi.mock('@/shared/hooks/useTranslation', () => ({
  useAuthTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('react-router-dom', async importOriginal => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => navigateMock };
});

describe('EmailConfirmation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exchanges the PKCE code and shows success only after Supabase validates it', async () => {
    confirmEmailMock.mockResolvedValue({ user: { id: 'member-id' }, error: null });

    render(
      <MemoryRouter initialEntries={['/auth/confirm?code=valid-code']}>
        <EmailConfirmation />
      </MemoryRouter>
    );

    await screen.findByText('confirmation.successTitle');
    expect(confirmEmailMock).toHaveBeenCalledWith('valid-code');
  });

  it('does not call Supabase or show success when the callback code is missing', async () => {
    render(
      <MemoryRouter initialEntries={['/auth/confirm']}>
        <EmailConfirmation />
      </MemoryRouter>
    );

    await screen.findByText('confirmation.errorTitle');
    expect(screen.getByText('confirmation.invalidLink')).toBeTruthy();
    await waitFor(() => expect(confirmEmailMock).not.toHaveBeenCalled());
  });

  it('shows a localized failure state when Supabase rejects an expired code', async () => {
    confirmEmailMock.mockResolvedValue({ user: null, error: new Error('Code verifier expired') });

    render(
      <MemoryRouter initialEntries={['/auth/confirm?code=expired-code']}>
        <EmailConfirmation />
      </MemoryRouter>
    );

    await screen.findByText('confirmation.errorTitle');
    expect(screen.getByText('confirmation.invalidLink')).toBeTruthy();
  });
});
