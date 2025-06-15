
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RiskBadge from '@/components/common/RiskBadge';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useTranslation } from 'react-i18next';

const RiskAnalysis = () => {
  const { t } = useTranslation();

  const riskDistributionData = [
    { name: t('riskAnalysisPage.lowRisk'), value: 60, color: '#22c55e' },
    { name: t('riskAnalysisPage.mediumRisk'), value: 30, color: '#eab308' },
    { name: t('riskAnalysisPage.highRisk'), value: 10, color: '#ef4444' },
  ];

  const riskFactorData = [
    { factor: t('riskAnalysisPage.factorTransactionPatterns'), highRiskPercentage: 15 },
    { factor: t('riskAnalysisPage.factorGeographicLocation'), highRiskPercentage: 22 },
    { factor: t('riskAnalysisPage.factorCustomerType'), highRiskPercentage: 8 },
    { factor: t('riskAnalysisPage.factorTransactionVolume'), highRiskPercentage: 18 },
    { factor: t('riskAnalysisPage.factorTransactionAmount'), highRiskPercentage: 12 },
  ];

  return (
    <DashboardLayout requiredRoles={['complianceOfficer', 'admin', 'executive']}>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t('navigation.riskAnalysis')}</h1>
          <p className="text-muted-foreground">
            {t('riskAnalysisPage.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Risk Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>{t('riskAnalysisPage.riskDistributionTitle')}</CardTitle>
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
                  <span className="text-sm">{t('riskAnalysisPage.lowRisk')}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
                  <span className="text-sm">{t('riskAnalysisPage.mediumRisk')}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                  <span className="text-sm">{t('riskAnalysisPage.highRisk')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Factors Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t('riskAnalysisPage.keyRiskFactorsTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskFactorData.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{item.factor}</span>
                      <span className="text-sm font-medium">{item.highRiskPercentage}% {t('riskAnalysisPage.highRisk')}</span>
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
              <CardTitle>{t('riskAnalysisPage.customerRiskBreakdownTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-3xl font-bold text-green-500">60%</span>
                    <span className="text-sm text-muted-foreground mt-1">{t('riskAnalysisPage.lowRisk')}</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-3xl font-bold text-yellow-500">30%</span>
                    <span className="text-sm text-muted-foreground mt-1">{t('riskAnalysisPage.mediumRisk')}</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-3xl font-bold text-red-500">10%</span>
                    <span className="text-sm text-muted-foreground mt-1">{t('riskAnalysisPage.highRisk')}</span>
                  </div>
                </div>
                <div className="pt-4">
                  <h4 className="text-sm font-medium mb-2">{t('riskAnalysisPage.highRiskFlagsTitle')}</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm">
                      <span className="mr-2">•</span>
                      <span>{t('riskAnalysisPage.pepFlag')}</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <span className="mr-2">•</span>
                      <span>{t('riskAnalysisPage.highVolumeFlag')}</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <span className="mr-2">•</span>
                      <span>{t('riskAnalysisPage.sanctionedCountriesFlag')}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Management Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t('riskAnalysisPage.riskManagementActionsTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">{t('riskAnalysisPage.actionEnhancedDiligence')}</h4>
                    <p className="text-xs text-muted-foreground">{t('riskAnalysisPage.actionEnhancedDiligenceDesc')}</p>
                  </div>
                  <RiskBadge score={85} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">{t('riskAnalysisPage.actionTransactionMonitoring')}</h4>
                    <p className="text-xs text-muted-foreground">{t('riskAnalysisPage.actionTransactionMonitoringDesc')}</p>
                  </div>
                  <RiskBadge score={65} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">{t('riskAnalysisPage.actionDocumentVerification')}</h4>
                    <p className="text-xs text-muted-foreground">{t('riskAnalysisPage.actionDocumentVerificationDesc')}</p>
                  </div>
                  <RiskBadge score={45} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">{t('riskAnalysisPage.actionPeriodicReviews')}</h4>
                    <p className="text-xs text-muted-foreground">{t('riskAnalysisPage.actionPeriodicReviewsDesc')}</p>
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
