import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Result from '../pages/Result';
import Home from '../pages/Home';
import AdvisoryPage from '../pages/AdvisoryPage';
import { Alert } from '../components/ui';

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params: any) => {
      if (key === 'result.decision.revenue' && params?.amount) return `Expected Revenue: ${params.amount}`;
      if (key === 'result.decision.sell') return 'SELL AT HARVEST';
      if (key === 'result.decision.hold') return 'HOLD';
      return key;
    },
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
}));

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Result Page - Decision Banner', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('renders SELL AT HARVEST banner', () => {
    sessionStorage.setItem('advisoryResult', JSON.stringify({
      req: { acres: 5 },
      res: {
        advisory: { decision: 'SELL AT HARVEST', expected_revenue_inr: 500000 },
        market: { current_price_inr: 4500, momentum: 'DOWN' }
      }
    }));
    
    renderWithProviders(<Result />);
    expect(screen.getByText('SELL AT HARVEST')).toBeInTheDocument();
  });

  it('renders HOLD banner', () => {
    sessionStorage.setItem('advisoryResult', JSON.stringify({
      req: { acres: 5 },
      res: {
        advisory: { decision: 'HOLD', expected_revenue_inr: 600000 },
        market: { current_price_inr: 4500, momentum: 'UP' }
      }
    }));
    
    renderWithProviders(<Result />);
    expect(screen.getByText('HOLD')).toBeInTheDocument();
  });
});

describe('Error Rendering', () => {
  it('renders Alert component correctly', () => {
    render(<Alert variant="destructive">Test Error Message</Alert>);
    expect(screen.getByText('Test Error Message')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('bg-red-50');
  });
});

describe('Landing Page Hero', () => {
  it('renders primary CTA button Analyze Your Crop and headlines', () => {
    renderWithProviders(<Home />);
    const ctaButtons = screen.getAllByRole('button', { name: /Analyze Your Crop/i });
    expect(ctaButtons.length).toBeGreaterThan(0);
    expect(screen.getByText(/Get smart, personalized crop insights powered by AI/i)).toBeInTheDocument();
  });
});

describe('Advisory Page Form', () => {
  it('renders advisory calculation form', () => {
    renderWithProviders(<AdvisoryPage />);
    expect(screen.getByRole('button', { name: /Calculate Farm Advisory/i })).toBeInTheDocument();
  });
});
