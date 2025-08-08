
import { UnifiedUserData } from '@/context/compliance/types';
import { AMLTransaction } from '@/types/aml';
import { Document } from '@/types';
import { ComplianceCaseDetails } from '@/types/case';
import { unifiedMockData } from '@/mocks/centralizedMockData';

/**
 * Service for managing coherent mock data connections across all modules
 * Ensures that customer users have complete, interconnected test data
 */
export class CoherentMockDataService {
  
  /**
   * Get a complete test user with all related data
   */
  static getCompleteTestUser(userId?: string): UnifiedUserData | null {
    if (userId) {
      return unifiedMockData.find(user => user.id === userId) || null;
    }
    
    // Return the first user with complete data for testing
    return unifiedMockData.find(user => 
      user.documents.length > 0 && 
      user.transactions.length > 0 && 
      user.complianceCases.length > 0
    ) || unifiedMockData[0] || null;
  }

  /**
   * Get all users with their complete related data
   */
  static getAllUsersWithRelatedData(): UnifiedUserData[] {
    return unifiedMockData.map(user => ({
      ...user,
      // Ensure metadata is available for enhanced testing
      metadata: {
        hasDocuments: user.documents.length > 0,
        hasTransactions: user.transactions.length > 0,
        hasCases: user.complianceCases.length > 0,
        totalTransactionAmount: user.transactions.reduce((sum, tx) => sum + tx.senderAmount, 0),
        lastActivityDate: this.getLastActivityDate(user),
        completenessScore: this.calculateCompletenessScore(user)
      }
    }));
  }

  /**
   * Get documents for a specific user
   */
  static getUserDocuments(userId: string): Document[] {
    const user = unifiedMockData.find(u => u.id === userId);
    return user?.documents || [];
  }

  /**
   * Get transactions for a specific user
   */
  static getUserTransactions(userId: string): AMLTransaction[] {
    const user = unifiedMockData.find(u => u.id === userId);
    return user?.transactions || [];
  }

  /**
   * Get compliance cases for a specific user
   */
  static getUserComplianceCases(userId: string): ComplianceCaseDetails[] {
    const user = unifiedMockData.find(u => u.id === userId);
    return user?.complianceCases || [];
  }

  /**
   * Get high-risk users for testing compliance workflows
   */
  static getHighRiskTestUsers(): UnifiedUserData[] {
    return unifiedMockData.filter(user => 
      user.riskScore > 70 || 
      user.isPEP || 
      user.isSanctioned ||
      user.transactions.some(tx => tx.riskScore > 70)
    );
  }

  /**
   * Get users with pending KYC for testing KYC workflows
   */
  static getPendingKYCUsers(): UnifiedUserData[] {
    return unifiedMockData.filter(user => 
      user.kycStatus === 'pending' || 
      user.kycStatus === 'information_requested' ||
      user.documents.some(doc => doc.status === 'pending')
    );
  }

  /**
   * Get users with suspicious transactions for testing AML workflows
   */
  static getSuspiciousTransactionUsers(): UnifiedUserData[] {
    return unifiedMockData.filter(user => 
      user.transactions.some(tx => tx.isSuspect || tx.riskScore > 80)
    );
  }

  /**
   * Get a test scenario dataset for specific compliance testing
   */
  static getTestScenario(scenario: 'high_risk' | 'pending_kyc' | 'suspicious_aml' | 'pep' | 'sanctioned'): UnifiedUserData[] {
    switch (scenario) {
      case 'high_risk':
        return this.getHighRiskTestUsers();
      case 'pending_kyc':
        return this.getPendingKYCUsers();
      case 'suspicious_aml':
        return this.getSuspiciousTransactionUsers();
      case 'pep':
        return unifiedMockData.filter(user => user.isPEP);
      case 'sanctioned':
        return unifiedMockData.filter(user => user.isSanctioned);
      default:
        return unifiedMockData;
    }
  }

  /**
   * Validate data consistency across all related entities
   */
  static validateDataConsistency(): {
    isValid: boolean;
    issues: string[];
    summary: {
      totalUsers: number;
      usersWithDocuments: number;
      usersWithTransactions: number;
      usersWithCases: number;
      orphanedDocuments: number;
      orphanedTransactions: number;
      orphanedCases: number;
    };
  } {
    const issues: string[] = [];
    
    // Check for users without essential data
    const usersWithoutDocuments = unifiedMockData.filter(u => u.documents.length === 0);
    const usersWithoutTransactions = unifiedMockData.filter(u => u.transactions.length === 0);
    
    if (usersWithoutDocuments.length > 0) {
      issues.push(`${usersWithoutDocuments.length} users have no documents`);
    }
    
    if (usersWithoutTransactions.length > 0) {
      issues.push(`${usersWithoutTransactions.length} users have no transactions`);
    }

    // Check for data consistency
    unifiedMockData.forEach(user => {
      // Check if documents belong to the user
      const invalidDocs = user.documents.filter(doc => doc.userId !== user.id);
      if (invalidDocs.length > 0) {
        issues.push(`User ${user.fullName} has ${invalidDocs.length} documents with mismatched user IDs`);
      }

      // Check if transactions belong to the user
      const invalidTxs = user.transactions.filter(tx => tx.senderUserId !== user.id);
      if (invalidTxs.length > 0) {
        issues.push(`User ${user.fullName} has ${invalidTxs.length} transactions with mismatched user IDs`);
      }

      // Check if cases belong to the user
      const invalidCases = user.complianceCases.filter(case_ => case_.userId !== user.id);
      if (invalidCases.length > 0) {
        issues.push(`User ${user.fullName} has ${invalidCases.length} cases with mismatched user IDs`);
      }
    });

    const summary = {
      totalUsers: unifiedMockData.length,
      usersWithDocuments: unifiedMockData.filter(u => u.documents.length > 0).length,
      usersWithTransactions: unifiedMockData.filter(u => u.transactions.length > 0).length,
      usersWithCases: unifiedMockData.filter(u => u.complianceCases.length > 0).length,
      orphanedDocuments: 0, // All documents are properly linked in unified data
      orphanedTransactions: 0, // All transactions are properly linked in unified data
      orphanedCases: 0 // All cases are properly linked in unified data
    };

    return {
      isValid: issues.length === 0,
      issues,
      summary
    };
  }

  private static getLastActivityDate(user: UnifiedUserData): string {
    const dates = [
      ...user.transactions.map(tx => tx.timestamp),
      ...user.documents.map(doc => doc.uploadDate),
      ...user.complianceCases.map(case_ => case_.updatedAt),
      user.createdAt
    ];
    
    return dates.reduce((latest, date) => 
      new Date(date) > new Date(latest) ? date : latest
    );
  }

  private static calculateCompletenessScore(user: UnifiedUserData): number {
    let score = 0;
    
    // Basic user info (20 points)
    if (user.fullName) score += 5;
    if (user.email) score += 5;
    if (user.phoneNumber) score += 5;
    if (user.address) score += 5;
    
    // Documents (30 points)
    if (user.documents.length > 0) score += 10;
    if (user.documents.some(doc => doc.status === 'verified')) score += 10;
    if (user.documents.length >= 3) score += 10;
    
    // Transactions (30 points)
    if (user.transactions.length > 0) score += 15;
    if (user.transactions.length >= 5) score += 15;
    
    // Compliance (20 points)
    if (user.kycStatus === 'verified') score += 10;
    if (user.complianceCases.length > 0) score += 10;
    
    return score;
  }
}
