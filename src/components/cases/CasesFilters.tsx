
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CaseFilters } from '@/types/case';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface CasesFiltersProps {
  filters: CaseFilters;
  setFilters: (filters: CaseFilters) => void;
}

const CasesFilters: React.FC<CasesFiltersProps> = ({ filters, setFilters }) => {
  // Update filters with new values
  const updateFilters = (updates: Partial<CaseFilters>) => {
    setFilters({ ...filters, ...updates });
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setFilters({
      dateRange: '30days',
    });
  };

  // Helper to check if filters are applied
  const hasActiveFilters = () => {
    return (
      filters.status?.length ||
      filters.type?.length ||
      filters.priority?.length ||
      filters.assignedTo ||
      filters.riskScoreMin !== undefined ||
      filters.riskScoreMax !== undefined ||
      filters.searchTerm
    );
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="dateRange">Date Range</Label>
            <Select
              value={filters.dateRange || '30days'}
              onValueChange={(value) => updateFilters({ dateRange: value })}
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
            <Label htmlFor="status">Case Status</Label>
            <Select
              value={filters.status?.length ? filters.status[0] : "all"}
              onValueChange={(value) =>
                updateFilters({ 
                  status: value !== "all" ? [value] : undefined 
                })
              }
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
                <SelectItem value="pending_info">Pending Information</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Case Type</Label>
            <Select
              value={filters.type?.length ? filters.type[0] : "all"}
              onValueChange={(value) =>
                updateFilters({ 
                  type: value !== "all" ? [value] : undefined 
                })
              }
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="kyc">KYC</SelectItem>
                <SelectItem value="aml">AML</SelectItem>
                <SelectItem value="sanctions">Sanctions</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={filters.priority?.length ? filters.priority[0] : "all"}
              onValueChange={(value) =>
                updateFilters({ 
                  priority: value !== "all" ? [value as any] : undefined 
                })
              }
            >
              <SelectTrigger id="priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="searchTerm">Search</Label>
            <Input
              id="searchTerm"
              placeholder="Search by name or description"
              value={filters.searchTerm || ''}
              onChange={(e) => updateFilters({ searchTerm: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Risk Score Range</Label>
            <div className="px-3 pt-6">
              <Slider
                defaultValue={[0, 100]}
                max={100}
                step={1}
                value={[
                  filters.riskScoreMin ?? 0,
                  filters.riskScoreMax ?? 100
                ]}
                onValueChange={([min, max]) => {
                  updateFilters({
                    riskScoreMin: min || undefined,
                    riskScoreMax: max || undefined
                  });
                }}
              />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>{filters.riskScoreMin ?? 0}</span>
                <span>{filters.riskScoreMax ?? 100}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex flex-wrap gap-2">
            {hasActiveFilters() && (
              <>
                {filters.status?.map(status => (
                  <Badge key={status} variant="secondary" className="capitalize">
                    {status.replace(/_/g, ' ')}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => updateFilters({ status: undefined })}
                    />
                  </Badge>
                ))}
                {filters.type?.map(type => (
                  <Badge key={type} variant="secondary" className="uppercase">
                    {type}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => updateFilters({ type: undefined })}
                    />
                  </Badge>
                ))}
                {filters.priority?.map(priority => (
                  <Badge key={priority} variant="secondary" className="capitalize">
                    {priority} Priority
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => updateFilters({ priority: undefined })}
                    />
                  </Badge>
                ))}
                {(filters.riskScoreMin !== undefined || filters.riskScoreMax !== undefined) && (
                  <Badge variant="secondary">
                    Risk: {filters.riskScoreMin ?? 0}-{filters.riskScoreMax ?? 100}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => updateFilters({ 
                        riskScoreMin: undefined,
                        riskScoreMax: undefined 
                      })}
                    />
                  </Badge>
                )}
                {filters.searchTerm && (
                  <Badge variant="secondary">
                    "{filters.searchTerm}"
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => updateFilters({ searchTerm: undefined })}
                    />
                  </Badge>
                )}
              </>
            )}
          </div>
          <Button
            variant="outline"
            onClick={handleResetFilters}
            size="sm"
          >
            Reset Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CasesFilters;
