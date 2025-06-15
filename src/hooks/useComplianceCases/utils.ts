
import { ComplianceCaseDetails, CaseSummary } from '@/types/case';

export const calculateCaseSummary = (caseData: ComplianceCaseDetails[]): CaseSummary => {
  const summary: CaseSummary = {
    totalCases: caseData.length,
    openCases: caseData.filter(c => c.status === 'open').length,
    highRiskCases: caseData.filter(c => c.riskScore >= 70).length,
    escalatedCases: caseData.filter(c => c.status === 'escalated').length,
    resolvedLastWeek: caseData.filter(c => 
      c.status === 'closed' && 
      new Date(c.updatedAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length,
    averageResolutionDays: 0,
    casesByType: {},
    casesByStatus: {}
  };
  
  // Calculate cases by type
  caseData.forEach(c => {
    summary.casesByType[c.type] = (summary.casesByType[c.type] || 0) + 1;
    summary.casesByStatus[c.status] = (summary.casesByStatus[c.status] || 0) + 1;
  });
  
  // Calculate average resolution days
  const closedCases = caseData.filter(c => c.status === 'closed');
  if (closedCases.length > 0) {
    const totalDays = closedCases.reduce((total, c) => {
      const created = new Date(c.createdAt);
      const updated = new Date(c.updatedAt);
      const diffTime = Math.abs(updated.getTime() - created.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return total + diffDays;
    }, 0);
    summary.averageResolutionDays = Math.round((totalDays / closedCases.length) * 10) / 10;
  }
  
  return summary;
};
