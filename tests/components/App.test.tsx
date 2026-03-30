import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from '@/app/App';

describe('App', () => {
  it('renders the audio gate with start button', () => {
    render(<App />);
    expect(screen.getByText('Tap to Start')).toBeInTheDocument();
  });

  it('shows the app title', () => {
    render(<App />);
    expect(screen.getByText('Push Tutor')).toBeInTheDocument();
  });

  it('shows audio unlock hint', () => {
    render(<App />);
    expect(screen.getByText(/audio requires/i)).toBeInTheDocument();
  });
});
