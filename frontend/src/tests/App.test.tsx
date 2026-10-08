import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App.jsx';

describe('KrishiLens Prototype Integration', () => {
  it('renders KrishiLens brand on initial load', () => {
    render(<App />);
    const brands = screen.getAllByText(/Krishi/i);
    expect(brands.length).toBeGreaterThan(0);
  });
});
