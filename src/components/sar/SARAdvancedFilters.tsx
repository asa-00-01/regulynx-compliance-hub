import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Filter, X, Calendar } from 'lucide-react';
import { SAR } from '@/types/sar';

export interface SARFilters {
  searchTerm: string;
  status: string;
  dateRange: {
    start: string;
    end: string;
  };
  riskLevel: string;
  transactionCount: string;
  hasDocuments: boolean;
  hasNotes: boolean;
}

interface SARAdvancedFiltersProps {
  filters: SARFilters;
  onFiltersChange: (filters: SARFilters) => void;
  onClearFilters: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const SARAdvancedFilters: React.FC<SARAdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  isOpen,
  onToggle
}) => {
  const [localFilters, setLocalFilters] = useState<SARFilters>(filters);

  const handleFilterChange = (key: keyof SARFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleNestedFilterChange = (parentKey: keyof SARFilters, childKey: string, value: any) => {
    const newFilters = {
      ...localFilters,
      [parentKey]: {
        ...localFilters[parentKey],
        [childKey]: value
      }
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleClearFilters = () => {
    const defaultFilters: SARFilters = {
      searchTerm: '',
      status: 'all',
      dateRange: { start: '', end: '' },
      riskLevel: 'all',
      transactionCount: 'all',
      hasDocuments: false,
      hasNotes: false
    };
    setLocalFilters(defaultFilters);
    onClearFilters();
  };

  const activeFilterCount = Object.values(filters).filter(value => {
    if (typeof value === 'string') return value !== '' && value !== 'all';
    if (typeof value === 'object') {
      if (Array.isArray(value)) return value.length > 0;
      return Object.values(value).some(v => v !== '' && v !== false);
    }
    return value !== false;
  }).length;

  if (!isOpen) {
    return (
      <Button variant="outline" onClick={onToggle} className="flex items-center gap-2">
        <Filter className="h-4 w-4" />
        Filters
        {activeFilterCount > 0 && (
          <Badge variant="secondary" className="ml-1">
            {activeFilterCount}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Filters
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
            <Button variant="outline" size="sm" onClick={onToggle}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <Label htmlFor="status-filter">Status</Label>
            <Select
              value={localFilters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="filed">Filed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div>
            <Label htmlFor="date-start">Date Range Start</Label>
            <Input
              id="date-start"
              type="date"
              value={localFilters.dateRange.start}
              onChange={(e) => handleNestedFilterChange('dateRange', 'start', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="date-end">Date Range End</Label>
            <Input
              id="date-end"
              type="date"
              value={localFilters.dateRange.end}
              onChange={(e) => handleNestedFilterChange('dateRange', 'end', e.target.value)}
            />
          </div>

          {/* Risk Level */}
          <div>
            <Label htmlFor="risk-level">Risk Level</Label>
            <Select
              value={localFilters.riskLevel}
              onValueChange={(value) => handleFilterChange('riskLevel', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select risk level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transaction Count */}
          <div>
            <Label htmlFor="transaction-count">Transaction Count</Label>
            <Select
              value={localFilters.transactionCount}
              onValueChange={(value) => handleFilterChange('transactionCount', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select transaction count" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Count</SelectItem>
                <SelectItem value="0">No Transactions</SelectItem>
                <SelectItem value="1-5">1-5 Transactions</SelectItem>
                <SelectItem value="6-10">6-10 Transactions</SelectItem>
                <SelectItem value="10+">10+ Transactions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Has Documents */}
          <div>
            <Label htmlFor="has-documents">Has Documents</Label>
            <Select
              value={localFilters.hasDocuments ? 'yes' : 'no'}
              onValueChange={(value) => handleFilterChange('hasDocuments', value === 'yes')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no">Any</SelectItem>
                <SelectItem value="yes">Has Documents</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Has Notes */}
          <div>
            <Label htmlFor="has-notes">Has Notes</Label>
            <Select
              value={localFilters.hasNotes ? 'yes' : 'no'}
              onValueChange={(value) => handleFilterChange('hasNotes', value === 'yes')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no">Any</SelectItem>
                <SelectItem value="yes">Has Notes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button onClick={handleApplyFilters}>
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SARAdvancedFilters;
