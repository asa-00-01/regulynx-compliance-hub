
import { ComplianceCaseDetails, CasePriority, CaseSource } from '@/types/case';

// Generate consistent UUIDs for mock data
const generateUUID = (seed?: string): string => {
  if (seed) {
    // Simple hash function to generate consistent UUIDs
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Convert to UUID format
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32).padEnd(12, '0')}`;
  }
  
  // Fallback to crypto.randomUUID() if available, otherwise use Math.random()
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Legacy fallback (less secure but functional)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Case types and sources for realistic generation
const caseTypes: ('kyc' | 'aml' | 'sanctions')[] = ['kyc', 'aml', 'sanctions'];
const caseSources: CaseSource[] = ['manual_review', 'system_alert', 'external_report', 'regulatory_request'];
const caseStatuses = ['open', 'under_review', 'escalated', 'pending_info', 'closed'] as const;
const priorities: CasePriority[] = ['low', 'medium', 'high', 'critical'];

// Compliance officers for case assignment
const complianceOfficers = [
  { id: 'admin_001', name: 'Alex Nordström' },
  { id: 'admin_002', name: 'Johan Berg' },
  { id: 'admin_003', name: 'Lena Wikström' },
  { id: 'admin_004', name: 'Maria Svensson' },
  { id: 'admin_005', name: 'Erik Lindqvist' }
];

interface UserProfile {
  id: string;
  fullName: string;
  riskScore: number;
  isPEP: boolean;
  isSanctioned: boolean;
  kycStatus: string;
}

export const generateCasesForUser = (user: UserProfile): ComplianceCaseDetails[] => {
  const cases: ComplianceCaseDetails[] = [];
  
  // Determine number of cases based on risk factors
  let numCases = 0;
  if (user.riskScore > 80) numCases = Math.floor(Math.random() * 3) + 2; // 2-4 cases
  else if (user.riskScore > 60) numCases = Math.floor(Math.random() * 2) + 1; // 1-2 cases
  else if (user.isPEP || user.isSanctioned) numCases = Math.floor(Math.random() * 2) + 1; // 1-2 cases
  else if (user.kycStatus !== 'verified') numCases = 1;
  else if (Math.random() < 0.3) numCases = 1; // 30% chance for low-risk users
  
  for (let i = 0; i < numCases; i++) {
    const officer = complianceOfficers[Math.floor(Math.random() * complianceOfficers.length)];
    const caseType = caseTypes[Math.floor(Math.random() * caseTypes.length)];
    const source = caseSources[Math.floor(Math.random() * caseSources.length)];
    const status = caseStatuses[Math.floor(Math.random() * caseStatuses.length)];
    
    // Determine priority based on user risk factors
    let priority: CasePriority;
    if (user.isSanctioned) priority = 'critical';
    else if (user.riskScore > 90) priority = 'critical';
    else if (user.riskScore > 70 || user.isPEP) priority = 'high';
    else if (user.riskScore > 50) priority = 'medium';
    else priority = 'low';
    
    // Generate realistic descriptions based on case type and user factors
    let description = '';
    switch (caseType) {
      case 'kyc':
        if (user.isPEP) description = `PEP verification required for ${user.fullName} - Enhanced due diligence needed`;
        else if (user.kycStatus === 'information_requested') description = `Additional KYC information requested for ${user.fullName}`;
        else description = `KYC review for ${user.fullName} - Risk score: ${user.riskScore}`;
        break;
      case 'aml':
        if (user.riskScore > 70) description = `High-risk transaction patterns detected for ${user.fullName}`;
        else description = `AML monitoring alert for ${user.fullName} - Unusual transaction activity`;
        break;
      case 'sanctions':
        if (user.isSanctioned) description = `SANCTIONS HIT: ${user.fullName} found on sanctions list - Immediate review required`;
        else description = `Sanctions screening review for ${user.fullName}`;
        break;
    }
    
    const createdDaysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date(Date.now() - createdDaysAgo * 24 * 60 * 60 * 1000).toISOString();
    const updatedAt = new Date(Date.now() - Math.floor(Math.random() * createdDaysAgo) * 24 * 60 * 60 * 1000).toISOString();
    
    const caseItem: ComplianceCaseDetails = {
      id: generateUUID(),
      userId: user.id, // Use the actual user ID from the UnifiedUserData
      userName: user.fullName,
      createdAt,
      createdBy: officer.id,
      updatedAt,
      type: caseType,
      status,
      riskScore: user.riskScore,
      description,
      assignedTo: Math.random() > 0.3 ? officer.id : undefined,
      assignedToName: Math.random() > 0.3 ? officer.name : undefined,
      priority,
      source,
      relatedTransactions: caseType === 'aml' ? [`tx_${user.id}_${i + 1}`] : [],
      relatedAlerts: [`alert_${generateUUID()}`],
      documents: [`doc_${user.id}_passport`, `doc_${user.id}_drivers_license`]
    };
    
    cases.push(caseItem);
  }
  
  console.log(`Generated ${cases.length} cases for user ${user.fullName} (${user.id})`);
  return cases;
};
