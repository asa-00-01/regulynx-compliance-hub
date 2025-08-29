
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import TransactionFilters from './TransactionFilters';
import { AMLTransactionFilters } from '@/types/aml';

interface AMLFiltersSectionProps {
  filters: AMLTransactionFilters;
  onFilterChange: (filters: AMLTransactionFilters) => void;
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
    <div className="space-y-4">
      {/* Export button positioned at the top right */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={onExport}>
          <Download className="mr-2 h-4 w-4" />
          Export ({filteredTransactionsCount})
        </Button>
      </div>

      {/* Filters section */}
      <TransactionFilters
        filters={filters}
        onFilterChange={onFilterChange}
      />
    </div>
  );
};

export default AMLFiltersSection;
