
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RiskBadge from '@/components/common/RiskBadge';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const RiskAnalysis = () => {
  // Mock data for risk distribution
  const riskDistributionData = [
    { name: 'Low Risk', value: 60, color: '#22c55e' },
    { name: 'Medium Risk', value: 30, color: '#eab308' },
    { name: 'High Risk', value: 10, color: '#ef4444' },
  ];

  // Mock data for risk factors
  const riskFactorData = [
    { factor: 'Transaction Patterns', highRiskPercentage: 15 },
    { factor: 'Geographic Location', highRiskPercentage: 22 },
    { factor: 'Customer Type', highRiskPercentage: 8 },
    { factor: 'Transaction Volume', highRiskPercentage: 18 },
    { factor: 'Transaction Amount', highRiskPercentage: 12 },
  ];

  return (
    <DashboardLayout requiredRoles={['complianceOfficer', 'admin', 'executive']}>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Risk Analysis</h1>
          <p className="text-muted-foreground">
            Analyze customer risk profiles and identify high-risk factors
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Risk Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {riskDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" height={36} />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm">Low Risk</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
                  <span className="text-sm">Medium Risk</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                  <span className="text-sm">High Risk</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Factors Card */}
          <Card>
            <CardHeader>
              <CardTitle>Key Risk Factors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskFactorData.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{item.factor}</span>
                      <span className="text-sm font-medium">{item.highRiskPercentage}% High Risk</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div 
                        className="h-2.5 rounded-full bg-red-500" 
                        style={{ width: `${item.highRiskPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Risk Trends Card */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Risk Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-3xl font-bold text-green-500">60%</span>
                    <span className="text-sm text-muted-foreground mt-1">Low Risk</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-3xl font-bold text-yellow-500">30%</span>
                    <span className="text-sm text-muted-foreground mt-1">Medium Risk</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-3xl font-bold text-red-500">10%</span>
                    <span className="text-sm text-muted-foreground mt-1">High Risk</span>
                  </div>
                </div>
                <div className="pt-4">
                  <h4 className="text-sm font-medium mb-2">High Risk Customer Flags</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm">
                      <span className="mr-2">•</span>
                      <span>3 PEP (Politically Exposed Persons)</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <span className="mr-2">•</span>
                      <span>5 High-Volume Transactors</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <span className="mr-2">•</span>
                      <span>2 Sanctioned Countries</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Management Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Management Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Enhanced Due Diligence</h4>
                    <p className="text-xs text-muted-foreground">Required for all high risk customers</p>
                  </div>
                  <RiskBadge score={85} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Transaction Monitoring</h4>
                    <p className="text-xs text-muted-foreground">Increased frequency for medium/high risk</p>
                  </div>
                  <RiskBadge score={65} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Document Verification</h4>
                    <p className="text-xs text-muted-foreground">Additional verification steps</p>
                  </div>
                  <RiskBadge score={45} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Periodic Reviews</h4>
                    <p className="text-xs text-muted-foreground">Schedule based on risk category</p>
                  </div>
                  <RiskBadge score={55} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RiskAnalysis;
