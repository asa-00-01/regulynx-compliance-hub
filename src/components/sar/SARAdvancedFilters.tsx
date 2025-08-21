
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface SARFilters {
  reportType: string;
  status: string;
  priority: string;
  dateRange: {
    start?: string;
    end?: string;
  };
  assignedTo: string;
  tags: string[];
}

interface SARAdvancedFiltersProps {
  filters: SARFilters;
  onFiltersChange: (filters: SARFilters) => void;
  onReset: () => void;
}

const SARAdvancedFilters: React.FC<SARAdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset
}) => {
  const handleFilterChange = (key: keyof SARFilters, value: any) => {
    const updatedFilters = { ...filters, [key]: value };
    onFiltersChange(updatedFilters);
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    const updatedFilters = {
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: value
      }
    };
    onFiltersChange(updatedFilters);
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = filters.tags.filter(tag => tag !== tagToRemove);
    handleFilterChange('tags', updatedTags);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="reportType">Report Type</Label>
            <Select 
              value={filters.reportType} 
              onValueChange={(value) => handleFilterChange('reportType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="suspicious">Suspicious Activity</SelectItem>
                <SelectItem value="currency">Currency Transaction</SelectItem>
                <SelectItem value="cross-border">Cross-Border</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="status">Status</Label>
            <Select 
              value={filters.status} 
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              type="date"
              value={filters.dateRange.start || ''}
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              type="date"
              value={filters.dateRange.end || ''}
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="assignedTo">Assigned To</Label>
          <Select 
            value={filters.assignedTo} 
            onValueChange={(value) => handleFilterChange('assignedTo', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="me">Assigned to Me</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filters.tags.length > 0 && (
          <div>
            <Label>Active Tags</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {filters.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onReset}>
            Reset Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SARAdvancedFilters;
