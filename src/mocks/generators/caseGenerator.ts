
import { ComplianceCaseDetails } from '@/types/case';
import { userProfiles } from './userGenerator';

const getRandomDateInPast = (daysBack: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date.toISOString();
};

const complianceOfficers = [
  { id: 'admin_001', name: 'Alex Nordström' },
  { id: 'admin_002', name: 'Johan Berg' },
  { id: 'admin_003', name: 'Lena Wikström' },
  { id: 'admin_004', name: 'Maria Svensson' },
  { id: 'admin_005', name: 'Erik Lindqvist' }
];

const getCaseType = (user: typeof userProfiles[0]): 'kyc' | 'aml' | 'sanctions' => {
  if (user.isSanctioned) return 'sanctions';
  if (user.riskScore > 60) return 'aml';
  return 'kyc';
};

const getCaseStatus = (user: typeof userProfiles[0]): 'open' | 'under_review' | 'escalated' | 'pending_info' | 'closed' => {
  if (user.isSanctioned) return 'escalated';
  if (user.kycStatus === 'information_requested') return 'pending_info';
  if (user.kycStatus === 'verified') return Math.random() > 0.7 ? 'closed' : 'under_review';
  if (user.riskScore > 70) return Math.random() > 0.5 ? 'escalated' : 'under_review';
  return Math.random() > 0.6 ? 'open' : 'under_review';
};

const getCasePriority = (user: typeof userProfiles[0]): 'low' | 'medium' | 'high' | 'critical' => {
  if (user.isSanctioned || user.riskScore > 80) return 'critical';
  if (user.riskScore > 70 || user.isPEP) return 'high';
  if (user.riskScore > 50) return 'medium';
  return 'low';
};

const getCaseDescription = (user: typeof userProfiles[0], type: string): string => {
  const descriptions = {
    sanctions: `Sanctions screening identified potential match for ${user.fullName}. Requires immediate investigation and potential account restriction.`,
    aml: `High-risk transaction patterns detected for ${user.fullName}. Risk score: ${user.riskScore}. Enhanced due diligence required.`,
    kyc: `KYC documentation review required for ${user.fullName}. Additional verification needed for identity confirmation.`
  };
  
  return descriptions[type as keyof typeof descriptions] || 'Standard compliance review required.';
};

const getCaseSource = (user: typeof userProfiles[0]): 'manual' | 'transaction_alert' | 'kyc_flag' | 'sanctions_hit' | 'system' | 'risk_assessment' => {
  if (user.isSanctioned) return 'sanctions_hit';
  if (user.riskScore > 70) return 'risk_assessment';
  if (user.kycStatus === 'information_requested') return 'kyc_flag';
  if (user.riskScore > 50) return 'transaction_alert';
  return 'system';
};

export const generateCasesForUser = (user: typeof userProfiles[0]): ComplianceCaseDetails[] => {
  const cases: ComplianceCaseDetails[] = [];
  
  // Determine if user should have cases based on risk profile
  const shouldHaveCases = user.riskScore > 45 || user.isPEP || user.isSanctioned || user.kycStatus !== 'verified';
  
  if (!shouldHaveCases) return cases;
  
  // Number of cases based on risk level
  const caseCount = user.riskScore > 70 ? Math.floor(Math.random() * 3) + 2 : 
                   user.riskScore > 50 ? Math.floor(Math.random() * 2) + 1 : 1;
  
  for (let i = 0; i < caseCount; i++) {
    const type = getCaseType(user);
    const status = getCaseStatus(user);
    const priority = getCasePriority(user);
    const officer = complianceOfficers[Math.floor(Math.random() * complianceOfficers.length)];
    const createdAt = getRandomDateInPast(60);
    const updatedAt = new Date(new Date(createdAt).getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();
    
    cases.push({
      id: `case_${user.id}_${type}_${i + 1}`,
      userId: user.id,
      userName: user.fullName,
      createdAt,
      createdBy: 'system',
      updatedAt,
      type,
      status,
      riskScore: user.riskScore,
      description: getCaseDescription(user, type),
      assignedTo: officer.id,
      assignedToName: officer.name,
      priority,
      source: getCaseSource(user),
      relatedTransactions: [`tx_${user.id}_1`, `tx_${user.id}_2`],
      relatedAlerts: user.riskScore > 60 ? [`alert_${user.id}_1`] : [],
      documents: [`doc_${user.id}_passport`, `doc_${user.id}_id`]
    });
  }
  
  return cases;
};

export const generateAllCases = (): ComplianceCaseDetails[] => {
  return userProfiles.flatMap(user => generateCasesForUser(user));
};
