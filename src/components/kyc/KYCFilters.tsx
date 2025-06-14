
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, SlidersHorizontal, DownloadCloud, HelpCircle } from 'lucide-react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TooltipHelp } from '@/components/ui/tooltip-custom';

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
        <div className="relative">
          <Input
            placeholder="Search users by name or email"
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <TooltipHelp content="Search for users by their full name or email address. Use partial matches to find users quickly." />
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
        <div className="relative">
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Risk Level</SelectLabel>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="high">High Risk (75+)</SelectItem>
                <SelectItem value="medium">Medium Risk (50-74)</SelectItem>
                <SelectItem value="low">Low Risk (25-49)</SelectItem>
                <SelectItem value="minimal">Minimal Risk (<25)</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <TooltipHelp content="Filter users by their calculated risk level. High risk users (75+) require immediate attention and enhanced due diligence." />
        </div>

        <div className="relative">
          <Button variant="outline" onClick={() => handleSortChange('risk')}>
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            {sortField === 'risk' 
              ? `Risk Score ${sortOrder === 'asc' ? '↑' : '↓'}` 
              : 'Sort by Risk'}
          </Button>
          <TooltipHelp content="Sort users by their risk score in ascending (lowest first) or descending (highest first) order to prioritize review." />
        </div>

        <div className="relative">
          <Button variant="outline" onClick={handleExportData}>
            <DownloadCloud className="h-4 w-4 mr-2" />
            Export
          </Button>
          <TooltipHelp content="Export the current filtered list of users to CSV format for offline analysis or reporting purposes." />
        </div>
        
        {showResetButton && (
          <div className="relative">
            <Button variant="ghost" onClick={handleResetFilters}>
              Clear Filters
            </Button>
            <TooltipHelp content="Clear all applied filters and return to the default view showing all users." />
          </div>
        )}
      </div>
    </div>
  );
};

export default KYCFilters;
