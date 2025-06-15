
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import TransactionFilters from './TransactionFilters';

interface AMLFiltersSectionProps {
  filters: any;
  onFilterChange: (filters: any) => void;
  filteredTransactionsCount: number;
  onExport: () => void;
}

const AMLFiltersSection: React.FC<AMLFiltersSectionProps> = ({
  filters,
  onFilterChange,
  filteredTransactionsCount,
  onExport,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-4">
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
