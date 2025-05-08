
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import RiskBadge from '@/components/common/RiskBadge';
import { UserRiskData } from '@/hooks/useRiskCalculation';
import { KYCUser, UserFlags } from '@/types/kyc';

interface RiskAnalysisTabProps {
  userRiskData: UserRiskData;
  user: KYCUser & { flags: UserFlags };
}

const RiskAnalysisTab: React.FC<RiskAnalysisTabProps> = ({ userRiskData, user }) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-medium">Overall Risk Score</h3>
              <p className="text-muted-foreground text-sm">Based on multiple risk factors</p>
            </div>
            <div className="text-right">
              <RiskBadge score={userRiskData.riskScore} size="lg" showText={true} />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Risk Breakdown</h4>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Transaction Amount</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full bg-yellow-500" style={{ width: `${userRiskData.riskFactors.highAmount ? 80 : 20}%` }}></div>
                    </div>
                    <span className="text-xs font-medium">{userRiskData.riskFactors.highAmount ? "High" : "Low"}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Transaction Frequency</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full bg-yellow-500" style={{ width: `${userRiskData.riskFactors.highFrequency ? 70 : 30}%` }}></div>
                    </div>
                    <span className="text-xs font-medium">{userRiskData.riskFactors.highFrequency ? "High" : "Low"}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Country Risk</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full bg-red-500" style={{ width: `${userRiskData.riskFactors.highRiskCountry ? 90 : 10}%` }}></div>
                    </div>
                    <span className="text-xs font-medium">{userRiskData.riskFactors.highRiskCountry ? "High" : "Low"}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">KYC Status</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${userRiskData.riskFactors.incompleteKYC ? 60 : 10}%` }}></div>
                    </div>
                    <span className="text-xs font-medium">{userRiskData.riskFactors.incompleteKYC ? "Incomplete" : "Complete"}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {(userRiskData.riskScore > 70 || user.flags.is_verified_pep || user.flags.is_sanction_list) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <h4 className="text-sm font-medium text-red-800 mb-1 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  High Risk Indicators
                </h4>
                <ul className="list-disc list-inside text-xs text-red-700 space-y-1">
                  {userRiskData.riskScore > 70 && <li>Overall risk score above threshold (70)</li>}
                  {user.flags.is_verified_pep && <li>Politically Exposed Person</li>}
                  {user.flags.is_sanction_list && <li>Present on sanctions list</li>}
                  {userRiskData.riskFactors.highRiskCountry && <li>Transactions with high-risk countries</li>}
                  {userRiskData.riskFactors.highAmount && <li>High value transactions</li>}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskAnalysisTab;
