
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, Filter, RotateCcw, Search } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { DocumentStatus, DocumentType } from '@/types/supabase';

interface AdvancedDocumentFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: DocumentStatus | 'all';
  setStatusFilter: (status: DocumentStatus | 'all') => void;
  typeFilter: DocumentType | 'all';
  setTypeFilter: (type: DocumentType | 'all') => void;
  customerFilter: string;
  setCustomerFilter: (customer: string) => void;
  dateRange: { from?: Date; to?: Date };
  setDateRange: (range: { from?: Date; to?: Date }) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  onExportData: () => void;
  activeFiltersCount: number;
  totalDocuments: number;
  filteredDocuments: number;
}

const AdvancedDocumentFilters: React.FC<AdvancedDocumentFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  customerFilter,
  setCustomerFilter,
  dateRange,
  setDateRange,
  onApplyFilters,
  onResetFilters,
  onExportData,
  activeFiltersCount,
  totalDocuments,
  filteredDocuments
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Document Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount} active</Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            Showing {filteredDocuments} of {totalDocuments} documents
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <Label>Search Documents</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by filename, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Document Status</Label>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as DocumentStatus | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Type Filter */}
          <div className="space-y-2">
            <Label>Document Type</Label>
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as DocumentType | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="passport">Passport</SelectItem>
                <SelectItem value="national_id">ID Card</SelectItem>
                <SelectItem value="drivers_license">Driver's License</SelectItem>
                <SelectItem value="utility_bill">Utility Bill</SelectItem>
                <SelectItem value="bank_statement">Bank Statement</SelectItem>
                <SelectItem value="proof_of_income">Proof of Income</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Customer Filter */}
          <div className="space-y-2">
            <Label>Customer Name</Label>
            <Input
              placeholder="Filter by customer name..."
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Upload Date From</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? format(dateRange.from, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange.from}
                  onSelect={(date) => setDateRange({ ...dateRange, from: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Upload Date To</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange.to && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.to ? format(dateRange.to, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange.to}
                  onSelect={(date) => setDateRange({ ...dateRange, to: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-2">
          <Button onClick={onApplyFilters}>
            <Filter className="h-4 w-4 mr-2" />
            Apply Filters
          </Button>
          {activeFiltersCount > 0 && (
            <Button variant="outline" onClick={onResetFilters}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Filters
            </Button>
          )}
          <Button variant="outline" onClick={onExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedDocumentFilters;
