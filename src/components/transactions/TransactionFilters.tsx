
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TransactionFilters } from '@/hooks/useTransactionData';

interface TransactionFiltersProps {
  filters: TransactionFilters;
  onFilterChange: (filters: TransactionFilters) => void;
  countries: string[];
}

const TransactionFiltersComponent = ({
  filters,
  onFilterChange,
  countries,
}: TransactionFiltersProps) => {
  // Update filters with new values
  const updateFilters = (updates: Partial<TransactionFilters>) => {
    onFilterChange({ ...filters, ...updates });
  };

  // Handle amount changes
  const handleMinAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : undefined;
    updateFilters({ minAmount: value });
  };

  const handleMaxAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : undefined;
    updateFilters({ maxAmount: value });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="dateRange">Date Range</Label>
            <Select
              value={filters.dateRange}
              onValueChange={(value) => updateFilters({ dateRange: value as TransactionFilters['dateRange'] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Amount Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.minAmount || ''}
                onChange={handleMinAmountChange}
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxAmount || ''}
                onChange={handleMaxAmountChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select
              value={filters.methods?.[0] || ''}
              onValueChange={(value) =>
                updateFilters({ methods: value ? [value] : undefined })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All methods</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="mobile">Mobile Wallet</SelectItem>
                <SelectItem value="crypto">Cryptocurrency</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="flagged"
              checked={filters.onlyFlagged}
              onCheckedChange={(checked) =>
                updateFilters({ onlyFlagged: checked === true })
              }
            />
            <label
              htmlFor="flagged"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Only show flagged transactions
            </label>
          </div>

          <Button
            variant="outline"
            onClick={() =>
              onFilterChange({
                dateRange: '30days',
                onlyFlagged: false,
              })
            }
          >
            Reset Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionFiltersComponent;
