
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export interface SARFilters {
  status: string[];
  dateRange: {
    from?: Date;
    to?: Date;
  };
  amount: {
    min?: number;
    max?: number;
  };
  country: string[];
  patternType: string[];
  searchTerm: string;
}

interface SARAdvancedFiltersProps {
  filters: SARFilters;
  onFiltersChange: (filters: SARFilters) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const SARAdvancedFilters: React.FC<SARAdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  isOpen,
  onToggle,
}) => {
  const updateFilter = (key: keyof SARFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const addToArrayFilter = (key: keyof SARFilters, value: string) => {
    const currentArray = filters[key] as string[];
    if (!currentArray.includes(value)) {
      updateFilter(key, [...currentArray, value]);
    }
  };

  const removeFromArrayFilter = (key: keyof SARFilters, value: string) => {
    const currentArray = filters[key] as string[];
    updateFilter(key, currentArray.filter(item => item !== value));
  };

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="mb-4">
          <Filter className="h-4 w-4 mr-2" />
          Advanced Filters
          {Object.values(filters).some(v => Array.isArray(v) ? v.length > 0 : v) && (
            <Badge variant="secondary" className="ml-2">Active</Badge>
          )}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <Card>
          <CardHeader>
            <CardTitle>Filter SARs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Term */}
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by user name, ID, or description..."
                value={filters.searchTerm}
                onChange={(e) => updateFilter('searchTerm', e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div>
              <Label>Status</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {filters.status.map((status) => (
                  <Badge key={status} variant="secondary" className="flex items-center gap-1">
                    {status}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeFromArrayFilter('status', status)}
                    />
                  </Badge>
                ))}
              </div>
              <Select onValueChange={(value) => addToArrayFilter('status', value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Add status filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="filed">Filed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div>
              <Label>Date Range</Label>
              <div className="flex gap-2 mt-2">
                <DatePicker
                  date={filters.dateRange.from}
                  setDate={(date) => updateFilter('dateRange', { ...filters.dateRange, from: date })}
                  placeholder="From date"
                />
                <DatePicker
                  date={filters.dateRange.to}
                  setDate={(date) => updateFilter('dateRange', { ...filters.dateRange, to: date })}
                  placeholder="To date"
                />
              </div>
            </div>

            {/* Amount Range */}
            <div>
              <Label>Amount Range</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="number"
                  placeholder="Min amount"
                  value={filters.amount.min || ''}
                  onChange={(e) => updateFilter('amount', { 
                    ...filters.amount, 
                    min: e.target.value ? Number(e.target.value) : undefined 
                  })}
                />
                <Input
                  type="number"
                  placeholder="Max amount"
                  value={filters.amount.max || ''}
                  onChange={(e) => updateFilter('amount', { 
                    ...filters.amount, 
                    max: e.target.value ? Number(e.target.value) : undefined 
                  })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default SARAdvancedFilters;
export type { SARFilters };
