import { UnifiedUserData } from '@/context/compliance/types';
import { ComplianceCaseDetails } from '@/types/case';

export interface RiskAssessmentResult {
  shouldCreateCase: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  caseType: 'kyc_review' | 'aml_alert' | 'sanctions_hit' | 'pep_review' | 'transaction_monitoring' | 'suspicious_activity' | 'document_review' | 'compliance_breach';
  reason: string;
  riskFactors: string[];
  riskScore: number;
}

export interface ComplianceCaseWorkflowConfig {
  // Risk thresholds
  criticalRiskThreshold: number;
  highRiskThreshold: number;
  mediumRiskThreshold: number;
  
  // Automatic case creation rules
  autoCreateForPEP: boolean;
  autoCreateForSanctions: boolean;
  autoCreateForHighRisk: boolean;
  autoCreateForMultipleRiskFactors: boolean;
  
  // Risk factor weights
  riskFactorWeights: {
    pep: number;
    sanctions: number;
    riskScore: number;
    kycStatus: number;
    transactionPatterns: number;
    documentIssues: number;
  };
}

const DEFAULT_CONFIG: ComplianceCaseWorkflowConfig = {
  criticalRiskThreshold: 90,
  highRiskThreshold: 75,
  mediumRiskThreshold: 50,
  
  autoCreateForPEP: true,
  autoCreateForSanctions: true,
  autoCreateForHighRisk: true,
  autoCreateForMultipleRiskFactors: true,
  
  riskFactorWeights: {
    pep: 40,
    sanctions: 50,
    riskScore: 30,
    kycStatus: 20,
    transactionPatterns: 25,
    documentIssues: 15
  }
};

export class ComplianceCaseWorkflowService {
  private config: ComplianceCaseWorkflowConfig;

  constructor(config: Partial<ComplianceCaseWorkflowConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Assess whether a compliance case should be created for a user
   */
  assessCaseCreation(user: UnifiedUserData): RiskAssessmentResult {
    const riskFactors: string[] = [];
    let totalRiskScore = user.riskScore || 0;
    let caseType: RiskAssessmentResult['caseType'] = 'kyc_review';
    let reason = '';

    // 1. Check for PEP (Politically Exposed Person)
    if (user.isPEP) {
      riskFactors.push('PEP (Politically Exposed Person)');
      totalRiskScore += this.config.riskFactorWeights.pep;
      caseType = 'pep_review';
      reason = 'User identified as Politically Exposed Person (PEP)';
    }

    // 2. Check for Sanctions List Match
    if (user.isSanctioned) {
      riskFactors.push('Sanctions List Match');
      totalRiskScore += this.config.riskFactorWeights.sanctions;
      caseType = 'sanctions_hit';
      reason = 'User found on sanctions list';
    }

    // 3. Check KYC Status Issues
    if (user.kycStatus === 'rejected') {
      riskFactors.push('KYC Rejected');
      totalRiskScore += this.config.riskFactorWeights.kycStatus;
      caseType = 'kyc_review';
      reason = 'KYC verification was rejected';
    } else if (user.kycStatus === 'information_requested') {
      riskFactors.push('KYC Information Requested');
      totalRiskScore += this.config.riskFactorWeights.kycStatus * 0.5;
      if (!reason) reason = 'Additional KYC information requested';
    }

    // 4. Check for High Risk Score
    if (user.riskScore >= this.config.highRiskThreshold) {
      riskFactors.push(`High Risk Score (${user.riskScore})`);
      totalRiskScore += this.config.riskFactorWeights.riskScore;
      if (!reason) reason = `High risk score of ${user.riskScore}`;
    }

    // 5. Check for Transaction Pattern Issues
    const highRiskTransactions = user.transactions?.filter(t => t.riskScore > 70).length || 0;
    if (highRiskTransactions > 0) {
      riskFactors.push(`${highRiskTransactions} High-Risk Transactions`);
      totalRiskScore += this.config.riskFactorWeights.transactionPatterns;
      if (!reason) reason = `${highRiskTransactions} high-risk transactions detected`;
    }

    // 6. Check for Document Issues
    const pendingDocuments = user.documents?.filter(d => d.status === 'pending').length || 0;
    if (pendingDocuments > 0) {
      riskFactors.push(`${pendingDocuments} Pending Documents`);
      totalRiskScore += this.config.riskFactorWeights.documentIssues;
      if (!reason) reason = `${pendingDocuments} documents pending verification`;
    }

    // Determine if case should be created
    let shouldCreateCase = false;

    // Automatic case creation rules
    if (this.config.autoCreateForPEP && user.isPEP) {
      shouldCreateCase = true;
    } else if (this.config.autoCreateForSanctions && user.isSanctioned) {
      shouldCreateCase = true;
    } else if (this.config.autoCreateForHighRisk && user.riskScore >= this.config.highRiskThreshold) {
      shouldCreateCase = true;
    } else if (this.config.autoCreateForMultipleRiskFactors && riskFactors.length >= 2) {
      shouldCreateCase = true;
    }

    // Determine priority
    let priority: RiskAssessmentResult['priority'] = 'low';
    if (totalRiskScore >= this.config.criticalRiskThreshold || user.isSanctioned) {
      priority = 'critical';
    } else if (totalRiskScore >= this.config.highRiskThreshold || user.isPEP) {
      priority = 'high';
    } else if (totalRiskScore >= this.config.mediumRiskThreshold) {
      priority = 'medium';
    }

    return {
      shouldCreateCase,
      priority,
      caseType,
      reason,
      riskFactors,
      riskScore: Math.min(100, totalRiskScore)
    };
  }

  /**
   * Generate compliance case data for a user
   */
  generateCaseData(user: UnifiedUserData, assessment: RiskAssessmentResult): Partial<ComplianceCaseDetails> {
    const description = this.generateCaseDescription(user, assessment);
    
    return {
      userId: user.id,
      userName: user.fullName,
      type: assessment.caseType,
      priority: assessment.priority,
      riskScore: assessment.riskScore,
      description,
      source: 'system_alert' as const,
      relatedTransactions: user.transactions?.map(t => t.id) || [],
      documents: user.documents?.map(d => d.id) || []
    };
  }

  /**
   * Generate a detailed case description
   */
  private generateCaseDescription(user: UnifiedUserData, assessment: RiskAssessmentResult): string {
    const parts: string[] = [];
    
    parts.push(`Compliance case for ${user.fullName} (${user.email})`);
    parts.push(`Risk Score: ${assessment.riskScore}`);
    
    if (assessment.riskFactors.length > 0) {
      parts.push(`Risk Factors: ${assessment.riskFactors.join(', ')}`);
    }
    
    if (user.isPEP) {
      parts.push('User identified as Politically Exposed Person (PEP) - Enhanced Due Diligence required');
    }
    
    if (user.isSanctioned) {
      parts.push('CRITICAL: User found on sanctions list - Immediate action required');
    }
    
    if (user.kycStatus !== 'verified') {
      parts.push(`KYC Status: ${user.kycStatus} - Verification process incomplete`);
    }
    
    const highRiskTransactions = user.transactions?.filter(t => t.riskScore > 70).length || 0;
    if (highRiskTransactions > 0) {
      parts.push(`${highRiskTransactions} high-risk transactions detected requiring review`);
    }
    
    return parts.join('. ');
  }

  /**
   * Get workflow recommendations for a user
   */
  getWorkflowRecommendations(user: UnifiedUserData, assessment: RiskAssessmentResult): string[] {
    const recommendations: string[] = [];

    if (user.isSanctioned) {
      recommendations.push('IMMEDIATE: Block all transactions and freeze account');
      recommendations.push('Notify compliance officer and legal team');
      recommendations.push('Prepare regulatory reporting documentation');
    }

    if (user.isPEP) {
      recommendations.push('Implement Enhanced Due Diligence (EDD) procedures');
      recommendations.push('Obtain senior management approval for relationship');
      recommendations.push('Conduct ongoing monitoring of transactions');
    }

    if (user.riskScore >= this.config.highRiskThreshold) {
      recommendations.push('Implement enhanced monitoring procedures');
      recommendations.push('Review transaction patterns for suspicious activity');
      recommendations.push('Consider additional documentation requirements');
    }

    if (user.kycStatus === 'rejected') {
      recommendations.push('Review rejection reasons and documentation');
      recommendations.push('Consider additional verification methods');
      recommendations.push('Document decision-making process');
    }

    if (user.kycStatus === 'information_requested') {
      recommendations.push('Follow up on requested documentation');
      recommendations.push('Set reminders for document collection');
      recommendations.push('Consider escalation if documents not provided');
    }

    const pendingDocuments = user.documents?.filter(d => d.status === 'pending').length || 0;
    if (pendingDocuments > 0) {
      recommendations.push(`Follow up on ${pendingDocuments} pending document(s)`);
    }

    return recommendations;
  }
}

// Export default instance
export const complianceCaseWorkflow = new ComplianceCaseWorkflowService();
