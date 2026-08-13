import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import LegalDocumentPage from './LegalDocumentPage';

describe('LegalDocumentPage', () => {
  it('renders the privacy notice at its public route', () => {
    render(
      <MemoryRouter initialEntries={['/privacy']}>
        <LegalDocumentPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Aviso de Privacidade' })).toBeInTheDocument();
    expect(screen.getByText(/Supabase para autenticação/i)).toBeInTheDocument();
  });

  it('renders the service terms at its public route', () => {
    render(
      <MemoryRouter initialEntries={['/terms']}>
        <LegalDocumentPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Termos de Serviço' })).toBeInTheDocument();
    expect(screen.getByText(/não presta aconselhamento médico/i)).toBeInTheDocument();
  });
});
