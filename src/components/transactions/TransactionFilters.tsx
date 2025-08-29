
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  Filter, 
  X,
  Calendar,
  DollarSign,
  Shield
} from 'lucide-react';
import { TransactionFilters } from '@/services/transactionService';
import { useTranslation } from 'react-i18next';

interface TransactionFiltersProps {
  filters: TransactionFilters;
  onFilterChange: (filters: Partial<TransactionFilters>) => void;
  onClearFilters: () => void;
  totalCount: number;
  filteredCount: number;
}

const TransactionFiltersComponent: React.FC<TransactionFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  totalCount,
  filteredCount
}) => {
  const { t } = useTranslation();

  const hasActiveFilters = 
    filters.status !== 'all' ||
    filters.riskLevel ||
    filters.searchTerm ||
    filters.amountRange?.min ||
    filters.amountRange?.max;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t('transactions.filters')}
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredCount} of {totalCount} transactions
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('transactions.searchPlaceholder')}
            value={filters.searchTerm || ''}
            onChange={(e) => onFilterChange({ searchTerm: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Filter Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('transactions.status')}</label>
            <Select 
              value={filters.status || 'all'} 
              onValueChange={(value) => onFilterChange({ status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('transactions.selectStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('transactions.allStatuses')}</SelectItem>
                <SelectItem value="approved">{t('transactions.approved')}</SelectItem>
                <SelectItem value="pending">{t('transactions.pending')}</SelectItem>
                <SelectItem value="flagged">{t('transactions.flagged')}</SelectItem>
                <SelectItem value="rejected">{t('transactions.rejected')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Risk Level Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <Shield className="h-4 w-4" />
              {t('transactions.riskLevel')}
            </label>
            <Select 
              value={filters.riskLevel || 'all'} 
              onValueChange={(value) => onFilterChange({ riskLevel: value === 'all' ? undefined : value as 'low' | 'medium' | 'high' })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('transactions.selectRiskLevel')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('transactions.allRiskLevels')}</SelectItem>
                <SelectItem value="low">{t('transactions.lowRisk')} (0-30)</SelectItem>
                <SelectItem value="medium">{t('transactions.mediumRisk')} (31-70)</SelectItem>
                <SelectItem value="high">{t('transactions.highRisk')} (71-100)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount Range Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              {t('transactions.amountRange')}
            </label>
            <Select 
              value="all"
              onValueChange={(value) => {
                switch (value) {
                  case 'low':
                    onFilterChange({ amountRange: { min: 0, max: 1000 } });
                    break;
                  case 'medium':
                    onFilterChange({ amountRange: { min: 1000, max: 10000 } });
                    break;
                  case 'high':
                    onFilterChange({ amountRange: { min: 10000, max: undefined } });
                    break;
                  default:
                    onFilterChange({ amountRange: undefined });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('transactions.selectAmountRange')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('transactions.allAmounts')}</SelectItem>
                <SelectItem value="low">{t('transactions.lowAmount')} ($0-$1,000)</SelectItem>
                <SelectItem value="medium">{t('transactions.mediumAmount')} ($1,000-$10,000)</SelectItem>
                <SelectItem value="high">{t('transactions.highAmount')} ($10,000+)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filter Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date Range Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {t('transactions.dateRange')}
            </label>
            <Select 
              value="all"
              onValueChange={(value) => {
                const now = new Date();
                let from: Date | undefined;
                
                switch (value) {
                  case '7days':
                    from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                  case '30days':
                    from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                  case '90days':
                    from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    break;
                  default:
                    from = undefined;
                }
                
                onFilterChange({ dateRange: from ? { from, to: now } : undefined });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('transactions.selectDateRange')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('transactions.allDates')}</SelectItem>
                <SelectItem value="7days">{t('transactions.last7Days')}</SelectItem>
                <SelectItem value="30days">{t('transactions.last30Days')}</SelectItem>
                <SelectItem value="90days">{t('transactions.last90Days')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={onClearFilters}
              disabled={!hasActiveFilters}
              className="w-full"
            >
              <X className="h-4 w-4 mr-2" />
              {t('transactions.clearFilters')}
            </Button>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <span className="text-sm text-muted-foreground">{t('transactions.activeFilters')}:</span>
            {filters.status && filters.status !== 'all' && (
              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Status: {filters.status}
              </span>
            )}
            {filters.riskLevel && (
              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                Risk: {filters.riskLevel}
              </span>
            )}
            {filters.searchTerm && (
              <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                Search: "{filters.searchTerm}"
              </span>
            )}
            {filters.amountRange && (
              <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
                Amount: ${filters.amountRange.min || 0} - {filters.amountRange.max ? `$${filters.amountRange.max}` : '∞'}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionFiltersComponent;
