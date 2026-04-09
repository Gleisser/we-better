import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Login from '../pages/Login';
import SignUp from '../pages/SignUp';

describe('auth onboarding UX', () => {
  it('renders exactly one name field on signup', () => {
    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );

    expect(screen.getAllByLabelText(/full name/i)).toHaveLength(1);
    expect(screen.queryByLabelText(/^name$/i)).toBeNull();
  });

  it('keeps Google auth affordance consistent across login and signup', () => {
    const { unmount } = render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    const loginGoogleButton = screen.getByRole('button', { name: /google/i });
    const loginGoogleLabel = loginGoogleButton.textContent;
    unmount();

    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );
    const signUpGoogleButton = screen.getByRole('button', { name: /google/i });

    expect(loginGoogleButton.hasAttribute('disabled')).toBe(true);
    expect(signUpGoogleButton.hasAttribute('disabled')).toBe(true);
    expect(signUpGoogleButton.textContent).toBe(loginGoogleLabel);
  });
});
