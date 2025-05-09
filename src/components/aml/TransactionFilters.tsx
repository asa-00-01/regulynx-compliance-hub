
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { HIGH_RISK_COUNTRIES } from '@/types/aml';
import { Filter, Search, UserSearch } from 'lucide-react';
import { useCompliance } from '@/context/ComplianceContext';

interface TransactionFiltersProps {
  filters: {
    dateRange: string;
    minAmount?: number;
    maxAmount?: number;
    country?: string;
    riskLevel: string;
    onlyFlagged: boolean;
    userId?: string;
  };
  onFilterChange: (filters: any) => void;
  allowUserFilter?: boolean;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({ 
  filters, 
  onFilterChange,
  allowUserFilter = true
}) => {
  const { state } = useCompliance();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center">
              <h3 className="text-lg font-medium">Transaction Filters</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2" 
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <Filter className="h-4 w-4 mr-1" />
                {isExpanded ? 'Less Filters' : 'More Filters'}
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select
                value={filters.dateRange}
                onValueChange={(value) => onFilterChange({ dateRange: value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                  <SelectItem value="1year">Last 1 Year</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={filters.riskLevel}
                onValueChange={(value) => onFilterChange({ riskLevel: value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Risk Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="onlyFlagged" 
                  checked={filters.onlyFlagged}
                  onCheckedChange={(checked) => 
                    onFilterChange({ onlyFlagged: checked === true })
                  }
                />
                <label
                  htmlFor="onlyFlagged"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Flagged Only
                </label>
              </div>
            </div>
          </div>
          
          {isExpanded && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="minAmount">Minimum Amount</Label>
                <Input
                  id="minAmount"
                  type="number"
                  placeholder="Min Amount"
                  value={filters.minAmount || ''}
                  onChange={(e) => 
                    onFilterChange({ 
                      minAmount: e.target.value ? parseInt(e.target.value) : undefined 
                    })
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxAmount">Maximum Amount</Label>
                <Input
                  id="maxAmount"
                  type="number"
                  placeholder="Max Amount"
                  value={filters.maxAmount || ''}
                  onChange={(e) => 
                    onFilterChange({ 
                      maxAmount: e.target.value ? parseInt(e.target.value) : undefined 
                    })
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select
                  value={filters.country}
                  onValueChange={(value) => onFilterChange({ country: value })}
                >
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Any Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Country</SelectItem>
                    {HIGH_RISK_COUNTRIES.map((country) => (
                      <SelectItem key={country.countryCode} value={country.countryCode}>
                        {country.countryName} ({country.countryCode})
                      </SelectItem>
                    ))}
                    <SelectItem value="US">United States (US)</SelectItem>
                    <SelectItem value="GB">United Kingdom (GB)</SelectItem>
                    <SelectItem value="DE">Germany (DE)</SelectItem>
                    <SelectItem value="FR">France (FR)</SelectItem>
                    <SelectItem value="ES">Spain (ES)</SelectItem>
                    <SelectItem value="JP">Japan (JP)</SelectItem>
                    <SelectItem value="CN">China (CN)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {allowUserFilter && (
                <div className="space-y-2">
                  <Label htmlFor="userId">Filter by User</Label>
                  <Select
                    value={filters.userId || ""}
                    onValueChange={(value) => onFilterChange({ userId: value || undefined })}
                  >
                    <SelectTrigger id="userId">
                      <SelectValue placeholder="All Users" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Users</SelectItem>
                      {state.users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
          
          {isExpanded && (
            <div className="pt-4 flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  onFilterChange({
                    dateRange: '30days',
                    minAmount: undefined,
                    maxAmount: undefined,
                    country: undefined,
                    riskLevel: 'all',
                    onlyFlagged: false,
                    userId: filters.userId // Keep user filter if it's set
                  });
                }}
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionFilters;
