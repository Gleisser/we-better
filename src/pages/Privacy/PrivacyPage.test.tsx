import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import PrivacyPage from './PrivacyPage';

describe('PrivacyPage', () => {
  it('presents We Better data practices in dedicated visual sections', () => {
    render(
      <MemoryRouter>
        <PrivacyPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Seu caminho é seu.' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'O que guardamos' })).toBeInTheDocument();
    expect(screen.getByText(/Supabase para autenticação/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Política de Cookies' })).toHaveAttribute(
      'href',
      '/cookies'
    );
  });
});
