import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import FaqPage from './FaqPage';

describe('FaqPage', () => {
  it('shows product-specific answers and lets visitors open another topic', () => {
    render(
      <MemoryRouter>
        <FaqPage />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('heading', { name: 'Perguntas que abrem caminho.' })
    ).toBeInTheDocument();
    expect(screen.getByText(/transformar intenção em prática/i)).toBeInTheDocument();

    const dreamBoardQuestion = screen.getByRole('button', { name: /como funciona o dream board/i });
    fireEvent.click(dreamBoardQuestion);

    expect(dreamBoardQuestion).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/adicione sonhos, imagens, marcos/i)).toBeInTheDocument();
  });
});
