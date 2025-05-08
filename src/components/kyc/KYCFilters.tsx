
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, SlidersHorizontal, DownloadCloud } from 'lucide-react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

interface KYCFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  riskFilter: string;
  setRiskFilter: (filter: string) => void;
  sortField: string;
  sortOrder: string;
  handleSortChange: (field: string) => void;
  handleExportData: () => void;
  handleResetFilters: () => void;
  showResetButton: boolean;
}

const KYCFilters: React.FC<KYCFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  riskFilter,
  setRiskFilter,
  sortField,
  sortOrder,
  handleSortChange,
  handleExportData,
  handleResetFilters,
  showResetButton
}) => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users by name or email"
          className="pl-8 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Risk Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Risk Level</SelectLabel>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="high">High Risk</SelectItem>
              <SelectItem value="medium">Medium Risk</SelectItem>
              <SelectItem value="low">Low Risk</SelectItem>
              <SelectItem value="minimal">Minimal Risk</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={() => handleSortChange('risk')}>
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          {sortField === 'risk' 
            ? `Risk Score ${sortOrder === 'asc' ? '↑' : '↓'}` 
            : 'Sort by Risk'}
        </Button>

        <Button variant="outline" onClick={handleExportData}>
          <DownloadCloud className="h-4 w-4 mr-2" />
          Export
        </Button>
        
        {showResetButton && (
          <Button variant="ghost" onClick={handleResetFilters}>
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
};

export default KYCFilters;
