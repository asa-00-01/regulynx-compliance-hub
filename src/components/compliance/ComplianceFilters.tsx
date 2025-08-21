
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { GlobalFilters } from '@/context/compliance/types';

interface ComplianceFiltersProps {
  filters: GlobalFilters;
  onFiltersChange: (filters: GlobalFilters) => void;
}

const ComplianceFilters: React.FC<ComplianceFiltersProps> = ({ filters, onFiltersChange }) => {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, searchTerm: value });
  };

  const handleRiskLevelChange = (value: string) => {
    onFiltersChange({ 
      ...filters, 
      riskLevel: value as GlobalFilters['riskLevel']
    });
  };

  const handleKycStatusChange = (status: string) => {
    const newKycStatus = filters.kycStatus.includes(status as any)
      ? filters.kycStatus.filter(s => s !== status)
      : [...filters.kycStatus, status as any];
    
    onFiltersChange({ ...filters, kycStatus: newKycStatus });
  };

  const removeKycStatus = (status: string) => {
    onFiltersChange({
      ...filters,
      kycStatus: filters.kycStatus.filter(s => s !== status)
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      searchTerm: '',
      riskLevel: 'all',
      dateRange: '30days',
      kycStatus: [],
      country: undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Search</label>
          <Input
            placeholder="Search users..."
            value={filters.searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Risk Level</label>
          <Select value={filters.riskLevel} onValueChange={handleRiskLevelChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">KYC Status</label>
          <Select onValueChange={handleKycStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Add KYC status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="information_requested">Information Requested</SelectItem>
            </SelectContent>
          </Select>
          
          {filters.kycStatus.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {filters.kycStatus.map((status) => (
                <Badge key={status} variant="secondary" className="flex items-center gap-1">
                  {status}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeKycStatus(status)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Button variant="outline" onClick={clearFilters} className="w-full">
          Clear All Filters
        </Button>
      </CardContent>
    </Card>
  );
};

export default ComplianceFilters;
