
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Filter } from 'lucide-react';
import { format } from 'date-fns';

interface TransactionFiltersProps {
  filters: {
    dateRange: { from: Date | null; to: Date | null };
    amountRange: { min: number | null; max: number | null };
    currency: string;
    method: string;
    riskLevel: string;
    country: string;
    status: string;
    searchTerm: string;
  };
  onFilterChange: (filters: any) => void;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const updateFilter = (key: string, value: any) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="space-y-4 p-4 bg-background border rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4" />
        <h3 className="font-medium">Transaction Filters</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Search</label>
          <Input
            placeholder="Search transactions..."
            value={filters.searchTerm || ''}
            onChange={(e) => updateFilter('searchTerm', e.target.value)}
          />
        </div>

        {/* Currency Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Currency</label>
          <Select
            value={filters.currency || 'all'}
            onValueChange={(value) => updateFilter('currency', value === 'all' ? '' : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All currencies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Currencies</SelectItem>
              <SelectItem value="SEK">SEK</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Method Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Method</label>
          <Select
            value={filters.method || 'all'}
            onValueChange={(value) => updateFilter('method', value === 'all' ? '' : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All methods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="bank">Bank Transfer</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="mobile">Mobile</SelectItem>
              <SelectItem value="crypto">Crypto</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Risk Level Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Risk Level</label>
          <Select
            value={filters.riskLevel || 'all'}
            onValueChange={(value) => updateFilter('riskLevel', value === 'all' ? '' : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All risk levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value="low">Low (0-30)</SelectItem>
              <SelectItem value="medium">Medium (31-70)</SelectItem>
              <SelectItem value="high">High (71-100)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Country Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Country</label>
          <Select
            value={filters.country || 'all'}
            onValueChange={(value) => updateFilter('country', value === 'all' ? '' : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All countries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              <SelectItem value="US">United States</SelectItem>
              <SelectItem value="SE">Sweden</SelectItem>
              <SelectItem value="GB">United Kingdom</SelectItem>
              <SelectItem value="DE">Germany</SelectItem>
              <SelectItem value="FR">France</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => updateFilter('status', value === 'all' ? '' : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="under_investigation">Under Investigation</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Date Range</label>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange?.from ? format(filters.dateRange.from, 'PPP') : 'From date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateRange?.from || undefined}
                onSelect={(date) => updateFilter('dateRange', { ...filters.dateRange, from: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange?.to ? format(filters.dateRange.to, 'PPP') : 'To date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateRange?.to || undefined}
                onSelect={(date) => updateFilter('dateRange', { ...filters.dateRange, to: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Amount Range */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Amount Range</label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min amount"
            value={filters.amountRange?.min || ''}
            onChange={(e) => updateFilter('amountRange', {
              ...filters.amountRange,
              min: e.target.value ? Number(e.target.value) : null
            })}
          />
          <Input
            type="number"
            placeholder="Max amount"
            value={filters.amountRange?.max || ''}
            onChange={(e) => updateFilter('amountRange', {
              ...filters.amountRange,
              max: e.target.value ? Number(e.target.value) : null
            })}
          />
        </div>
      </div>

      {/* Clear Filters Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => onFilterChange({
            dateRange: { from: null, to: null },
            amountRange: { min: null, max: null },
            currency: '',
            method: '',
            riskLevel: '',
            country: '',
            status: '',
            searchTerm: '',
          })}
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );
};

export default TransactionFilters;
