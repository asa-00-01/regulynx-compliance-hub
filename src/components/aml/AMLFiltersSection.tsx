
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Download } from 'lucide-react';
import TransactionFilters from './TransactionFilters';

interface AMLFiltersSectionProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filters: any;
  onFilterChange: (filters: any) => void;
  filteredTransactionsCount: number;
  onExport: () => void;
}

const AMLFiltersSection: React.FC<AMLFiltersSectionProps> = ({
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
  filteredTransactionsCount,
  onExport,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search transactions..."
          className="pl-8 w-full sm:w-[300px]"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <TransactionFilters
        filters={filters}
        onFilterChange={onFilterChange}
      />

      <Button variant="outline" className="ml-auto" onClick={onExport}>
        <Download className="mr-2 h-4 w-4" />
        Export ({filteredTransactionsCount})
      </Button>
    </div>
  );
};

export default AMLFiltersSection;
