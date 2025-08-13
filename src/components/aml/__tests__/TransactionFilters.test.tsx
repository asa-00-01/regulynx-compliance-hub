import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TransactionFilters from '../TransactionFilters';

// Mock the Select component from shadcn/ui
vi.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange, value }: any) => (
    <select value={value || 'all'} onChange={(e) => onValueChange?.(e.target.value)}>
      {children}
    </select>
  ),
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ value, children }: any) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}));

// Mock the Calendar component
vi.mock('@/components/ui/calendar', () => ({
  Calendar: ({ onSelect }: any) => (
    <button onClick={() => onSelect(new Date('2024-01-01'))}>Select Date</button>
  ),
}));

// Mock the Popover components
vi.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: any) => <div>{children}</div>,
  PopoverContent: ({ children }: any) => <div>{children}</div>,
  PopoverTrigger: ({ children }: any) => <div>{children}</div>,
}));

describe('TransactionFilters', () => {
  const mockFilters = {
    dateRange: { from: null, to: null },
    amountRange: { min: null, max: null },
    currency: '',
    method: '',
    riskLevel: '',
    country: '',
    status: '',
    searchTerm: '',
  };

  const mockOnFilterChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all filter sections', () => {
    render(
      <TransactionFilters
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
      />
    );

    // Check that all filter sections are rendered
    expect(screen.getByText('Transaction Filters')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search transactions...')).toBeInTheDocument();
    expect(screen.getByText('All currencies')).toBeInTheDocument();
    expect(screen.getByText('All methods')).toBeInTheDocument();
    expect(screen.getByText('All risk levels')).toBeInTheDocument();
    expect(screen.getByText('All countries')).toBeInTheDocument();
    expect(screen.getByText('All statuses')).toBeInTheDocument();
    expect(screen.getByText('Date Range')).toBeInTheDocument();
    expect(screen.getByText('Amount Range')).toBeInTheDocument();
    expect(screen.getByText('Clear Filters')).toBeInTheDocument();
  });

  it('renders status filter with correct options', () => {
    render(
      <TransactionFilters
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
      />
    );

    // Check that status filter options are present
    expect(screen.getByText('All Statuses')).toBeInTheDocument();
    expect(screen.getByText('Pending Review')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText('Flagged')).toBeInTheDocument();
    expect(screen.getByText('Rejected')).toBeInTheDocument();
    expect(screen.getByText('Under Investigation')).toBeInTheDocument();
  });

  it('calls onFilterChange when search term is changed', () => {
    render(
      <TransactionFilters
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search transactions...');
    fireEvent.change(searchInput, { target: { value: 'test search' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...mockFilters,
      searchTerm: 'test search',
    });
  });

  it('calls onFilterChange when amount range is changed', () => {
    render(
      <TransactionFilters
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
      />
    );

    const minAmountInput = screen.getByPlaceholderText('Min amount');
    const maxAmountInput = screen.getByPlaceholderText('Max amount');

    fireEvent.change(minAmountInput, { target: { value: '1000' } });
    fireEvent.change(maxAmountInput, { target: { value: '5000' } });

    // Check that both calls were made
    expect(mockOnFilterChange).toHaveBeenCalledTimes(2);
    
    // Check the first call (min amount)
    expect(mockOnFilterChange).toHaveBeenNthCalledWith(1, {
      ...mockFilters,
      amountRange: { min: 1000, max: null },
    });

    // Check the second call (max amount) - note that the component doesn't preserve min value
    expect(mockOnFilterChange).toHaveBeenNthCalledWith(2, {
      ...mockFilters,
      amountRange: { min: null, max: 5000 },
    });
  });

  it('clears all filters when Clear Filters button is clicked', () => {
    render(
      <TransactionFilters
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
      />
    );

    const clearButton = screen.getByText('Clear Filters');
    fireEvent.click(clearButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      dateRange: { from: null, to: null },
      amountRange: { min: null, max: null },
      currency: '',
      method: '',
      riskLevel: '',
      country: '',
      status: '',
      searchTerm: '',
    });
  });

  it('displays current filter values correctly', () => {
    const filtersWithValues = {
      ...mockFilters,
      searchTerm: 'test',
    };

    render(
      <TransactionFilters
        filters={filtersWithValues}
        onFilterChange={mockOnFilterChange}
      />
    );

    // Check that the search input shows the correct value
    expect(screen.getByDisplayValue('test')).toBeInTheDocument();
    
    // Check that the select elements are present
    expect(screen.getByText('All currencies')).toBeInTheDocument();
    expect(screen.getByText('All methods')).toBeInTheDocument();
    expect(screen.getByText('All risk levels')).toBeInTheDocument();
    expect(screen.getByText('All countries')).toBeInTheDocument();
    expect(screen.getByText('All statuses')).toBeInTheDocument();
  });
});
