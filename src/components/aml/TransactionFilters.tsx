
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { HIGH_RISK_COUNTRIES } from '@/types/aml';

interface TransactionFiltersProps {
  onFilterChange: (filters: any) => void;
  filters: any;
}

const TransactionFilters = ({ onFilterChange, filters }: TransactionFiltersProps) => {
  const handleReset = () => {
    onFilterChange({
      dateRange: '30days',
      minAmount: undefined,
      maxAmount: undefined,
      countries: [],
      riskLevel: 'all',
      onlyFlagged: false,
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dateRange">Date Range</Label>
            <Select
              value={filters.dateRange}
              onValueChange={(value) => onFilterChange({ ...filters, dateRange: value })}
            >
              <SelectTrigger id="dateRange">
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
            <Label htmlFor="minAmount">Min Amount</Label>
            <Input
              id="minAmount"
              type="number"
              placeholder="0"
              value={filters.minAmount || ''}
              onChange={(e) => onFilterChange({ ...filters, minAmount: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxAmount">Max Amount</Label>
            <Input
              id="maxAmount"
              type="number"
              placeholder="Any"
              value={filters.maxAmount || ''}
              onChange={(e) => onFilterChange({ ...filters, maxAmount: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select
              value={filters.country || ''}
              onValueChange={(value) => onFilterChange({ ...filters, country: value })}
            >
              <SelectTrigger id="country">
                <SelectValue placeholder="Any country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any country</SelectItem>
                {HIGH_RISK_COUNTRIES.map((country) => (
                  <SelectItem key={country.countryCode} value={country.countryCode}>
                    {country.countryName} ({country.countryCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="riskLevel">Risk Level</Label>
            <Select
              value={filters.riskLevel || 'all'}
              onValueChange={(value) => onFilterChange({ ...filters, riskLevel: value })}
            >
              <SelectTrigger id="riskLevel">
                <SelectValue placeholder="Any risk level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All risk levels</SelectItem>
                <SelectItem value="high">High risk</SelectItem>
                <SelectItem value="medium">Medium risk</SelectItem>
                <SelectItem value="low">Low risk</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end space-x-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="onlyFlagged"
                checked={filters.onlyFlagged || false}
                onCheckedChange={(checked) => onFilterChange({ ...filters, onlyFlagged: checked })}
              />
              <Label htmlFor="onlyFlagged" className="cursor-pointer">Flagged only</Label>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-4">
          <Button variant="secondary" onClick={handleReset} type="button">
            <X className="h-4 w-4 mr-2" /> Reset
          </Button>
          <Button onClick={() => onFilterChange({ ...filters })}>
            <Search className="h-4 w-4 mr-2" /> Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionFilters;
