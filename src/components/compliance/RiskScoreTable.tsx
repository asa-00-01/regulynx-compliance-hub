
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Activity } from 'lucide-react';
import { UserWithRiskScore } from './types/riskScoringTypes';

interface RiskScoreTableProps {
  usersWithRiskScores: UserWithRiskScore[];
  getRiskScoreClass: (score: number) => string;
}

const RiskScoreTable: React.FC<RiskScoreTableProps> = ({ 
  usersWithRiskScores, 
  getRiskScoreClass 
}) => {
  return (
    <div>
      <h3 className="mb-4 text-sm font-medium">User Risk Scores</h3>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Country</TableHead>
              <TableHead className="text-center">Risk Score</TableHead>
              <TableHead>Risk Factors</TableHead>
              <TableHead>Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersWithRiskScores.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.country}</TableCell>
                <TableCell className="text-center">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getRiskScoreClass(
                      user.riskScore
                    )}`}
                  >
                    {user.riskScore}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Country:</span>
                      <span className={`${getRiskScoreClass(user.countryRisk)}`}>
                        {user.countryRisk}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Transaction Frequency:</span>
                      <span className={`${getRiskScoreClass(user.frequencyRisk)}`}>
                        {user.frequencyRisk}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Transaction Amount:</span>
                      <span className={`${getRiskScoreClass(user.amountRisk)}`}>
                        {user.amountRisk}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>KYC Status:</span>
                      <span className={`${getRiskScoreClass(user.kycRisk)}`}>
                        {user.kycRisk}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {user.riskScore > (user.previousScore || 0) ? (
                    <div className="flex items-center text-red-500">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      +{user.riskScore - (user.previousScore || 0)}
                    </div>
                  ) : user.riskScore < (user.previousScore || 0) ? (
                    <div className="flex items-center text-green-500">
                      <ArrowDownRight className="h-4 w-4 mr-1" />
                      {user.riskScore - (user.previousScore || 0)}
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-500">
                      <Activity className="h-4 w-4 mr-1" />
                      No change
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default RiskScoreTable;
