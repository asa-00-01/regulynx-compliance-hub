
import { AMLTransaction } from '@/types/aml';
import { UnifiedUserData } from '@/context/compliance/types';
import { ComplianceCaseDetails } from '@/types/compliance-cases';

export class MockDataService {
  static async delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async getTransactions(): Promise<AMLTransaction[]> {
    await this.delay();
    return [];
  }

  static async getUsers(): Promise<UnifiedUserData[]> {
    await this.delay();
    return [];
  }

  static async getCases(): Promise<ComplianceCaseDetails[]> {
    await this.delay();
    return [];
  }

  static async getTransactionById(id: string): Promise<AMLTransaction | null> {
    await this.delay();
    return null;
  }

  static async getUserById(id: string): Promise<UnifiedUserData | null> {
    await this.delay();
    return null;
  }

  static async getCaseById(id: string): Promise<ComplianceCaseDetails | null> {
    await this.delay();
    return null;
  }

  static async getDocuments() {
    await this.delay();
    return [];
  }

  static async getUnifiedUserData(): Promise<UnifiedUserData[]> {
    await this.delay();
    return [];
  }

  static async getAuditLogs() {
    await this.delay();
    return [];
  }

  static validateData(data: any) {
    return { isValid: true, errors: [] };
  }

  static async createCase(caseData: Partial<ComplianceCaseDetails>): Promise<ComplianceCaseDetails> {
    await this.delay(1000);
    
    const newCase: ComplianceCaseDetails = {
      id: Math.random().toString(36).substr(2, 9),
      type: caseData.type || 'kyc',
      status: 'open',
      risk_score: caseData.risk_score || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      priority: caseData.priority || 'medium',
      source: 'manual',
      user_name: caseData.user_name || '',
      description: caseData.description || '',
      assigned_to: caseData.assigned_to || null,
      assigned_to_name: caseData.assigned_to_name || null,
      created_by: caseData.created_by || 'current_user',
      resolved_at: null,
      related_alerts: [],
      related_transactions: [],
      documents: [],
      actions: []
    };
    
    return newCase;
  }
}

export default MockDataService;
