
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface DashboardFilterControlsProps {
  kycFilter: string;
  setKYCFilter: (value: string) => void;
  riskFilter: string;
  setRiskFilter: (value: string) => void;
  countryFilter: string;
  setCountryFilter: (value: string) => void;
}

const DashboardFilterControls: React.FC<DashboardFilterControlsProps> = ({
  kycFilter,
  setKYCFilter,
  riskFilter,
  setRiskFilter,
  countryFilter,
  setCountryFilter,
}) => {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
      <div className="w-full md:w-1/3">
        <label className="text-sm font-medium text-muted-foreground">
          KYC Status
        </label>
        <Select
          value={kycFilter}
          onValueChange={setKYCFilter}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="information_requested">Information Requested</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="w-full md:w-1/3">
        <label className="text-sm font-medium text-muted-foreground">
          Risk Level
        </label>
        <Select
          value={riskFilter}
          onValueChange={setRiskFilter}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Risk Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risk Levels</SelectItem>
            <SelectItem value="low">Low (0-30)</SelectItem>
            <SelectItem value="medium">Medium (31-70)</SelectItem>
            <SelectItem value="high">High (71-100)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="w-full md:w-1/3">
        <label className="text-sm font-medium text-muted-foreground">
          Country
        </label>
        <Input
          type="text"
          placeholder="Filter by country"
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
        />
      </div>
    </div>
  );
};

export default DashboardFilterControls;
