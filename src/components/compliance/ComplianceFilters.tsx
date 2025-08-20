
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface ComplianceFilters {
  kycStatus: string[];
  riskLevel: string[];
  country: string[];
  dateRange: string;
}

interface ComplianceFiltersProps {
  filters: ComplianceFilters;
  onFiltersChange: (filters: ComplianceFilters) => void;
}

const ComplianceFilters: React.FC<ComplianceFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const updateFilter = (key: keyof ComplianceFilters, value: string | string[]) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const removeFilterValue = (key: keyof ComplianceFilters, valueToRemove: string) => {
    if (Array.isArray(filters[key])) {
      const currentValues = filters[key] as string[];
      updateFilter(key, currentValues.filter(v => v !== valueToRemove));
    }
  };

  const clearAllFilters = () => {
    onFiltersChange({
      kycStatus: [],
      riskLevel: [],
      country: [],
      dateRange: 'all'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Filters</h3>
        <Button variant="outline" size="sm" onClick={clearAllFilters}>
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">KYC Status</label>
          <Select
            value=""
            onValueChange={(value) => {
              if (!filters.kycStatus.includes(value)) {
                updateFilter('kycStatus', [...filters.kycStatus, value]);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="information_requested">Info Requested</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Risk Level</label>
          <Select
            value=""
            onValueChange={(value) => {
              if (!filters.riskLevel.includes(value)) {
                updateFilter('riskLevel', [...filters.riskLevel, value]);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select risk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low (0-25)</SelectItem>
              <SelectItem value="medium">Medium (26-50)</SelectItem>
              <SelectItem value="high">High (51-75)</SelectItem>
              <SelectItem value="critical">Critical (76+)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Country</label>
          <Select
            value=""
            onValueChange={(value) => {
              if (!filters.country.includes(value)) {
                updateFilter('country', [...filters.country, value]);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="US">United States</SelectItem>
              <SelectItem value="UK">United Kingdom</SelectItem>
              <SelectItem value="DE">Germany</SelectItem>
              <SelectItem value="FR">France</SelectItem>
              <SelectItem value="SE">Sweden</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Date Range</label>
          <Select
            value={filters.dateRange}
            onValueChange={(value) => updateFilter('dateRange', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.kycStatus.map(status => (
          <Badge key={status} variant="secondary" className="gap-1">
            KYC: {status}
            <X 
              className="h-3 w-3 cursor-pointer" 
              onClick={() => removeFilterValue('kycStatus', status)}
            />
          </Badge>
        ))}
        {filters.riskLevel.map(level => (
          <Badge key={level} variant="secondary" className="gap-1">
            Risk: {level}
            <X 
              className="h-3 w-3 cursor-pointer" 
              onClick={() => removeFilterValue('riskLevel', level)}
            />
          </Badge>
        ))}
        {filters.country.map(country => (
          <Badge key={country} variant="secondary" className="gap-1">
            Country: {country}
            <X 
              className="h-3 w-3 cursor-pointer" 
              onClick={() => removeFilterValue('country', country)}
            />
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default ComplianceFilters;
