
export interface ComplianceActionsProps {
  user: any; // UnifiedUserData type from context
  onActionTaken?: () => void;
}

export type LoadingState = 'createCase' | 'flag' | 'kyc' | 'documents' | 'transactions' | null;

export type CaseType = 'aml' | 'kyc' | 'sanctions' | 'fraud';

export interface NavigationParams {
  userId: string;
  userName: string;
  description: string;
  type: string;
  source: string;
  riskScore: number;
}
