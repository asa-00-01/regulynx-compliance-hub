import { useState, useEffect, useMemo } from 'react';
import { config } from '@/config/environment';
import { 
  normalizedComplianceCases, 
  normalizedAlerts, 
  normalizedTransactions,
  normalizedUsers 
} from '@/mocks/normalizedMockData';
import { ComplianceCaseDetails } from '@/types/case';
import { TransactionAlert } from '@/types/transaction';
import { Transaction } from '@/types/transaction';
import { User } from '@/types';

interface ComplianceData {
  overallScore: number;
  status: string;
  lastUpdated: string;
  casesOpened: number;
  casesResolved: number;
  alertsGenerated: number;
  amlAlerts: number;
  kycAlerts: number;
  trainingCompletion: number;
  policyUpdates: number;
}

interface RiskFactor {
  name: string;
  score: number;
  status: 'Healthy' | 'Moderate' | 'Critical';
  description?: string;
  trend?: 'up' | 'down' | 'stable';
}

interface RecentActivity {
  type: string;
  description: string;
  date: string;
  status: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  user?: string;
}

export function useComplianceData() {
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<ComplianceCaseDetails[]>([]);
  const [alerts, setAlerts] = useState<TransactionAlert[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Load data based on configuration
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (config.features.useMockData) {
          console.log('🎭 Using mock compliance data');
          setCases(normalizedComplianceCases);
          setAlerts(normalizedAlerts);
          setTransactions(normalizedTransactions);
          setUsers(normalizedUsers);
        } else {
          console.log('🌐 Real compliance data not yet implemented - using empty arrays');
          // In a real implementation, this would fetch from APIs
          setCases([]);
          setAlerts([]);
          setTransactions([]);
          setUsers([]);
        }
      } catch (error) {
        console.error('Error loading compliance data:', error);
        setCases([]);
        setAlerts([]);
        setTransactions([]);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [config.features.useMockData]);

  // Calculate compliance metrics
  const complianceData = useMemo((): ComplianceData => {
    const now = new Date();
    const lastUpdated = now.toISOString().split('T')[0]; // YYYY-MM-DD format

    // Calculate cases metrics
    const openCases = cases.filter(c => c.status === 'open').length;
    const resolvedCases = cases.filter(c => c.status === 'closed').length;
    const totalCases = cases.length;

    // Calculate alerts metrics
    const totalAlerts = alerts.length;
    const amlAlerts = alerts.filter(a => 
      a.type === 'high_risk_country' || 
      a.type === 'structuring' || 
      a.type === 'suspicious_pattern'
    ).length;
    const kycAlerts = alerts.filter(a => 
      a.type === 'frequency' || 
      a.type === 'high_value'
    ).length;

    // Calculate overall compliance score based on various factors
    const caseResolutionRate = totalCases > 0 ? (resolvedCases / totalCases) * 100 : 100;
    const alertResponseRate = totalAlerts > 0 ? Math.min(95, 100 - (totalAlerts * 2)) : 100;
    const userVerificationRate = users.length > 0 ? 
      (users.filter(u => u.status === 'verified').length / users.length) * 100 : 100;
    
    const overallScore = Math.round(
      (caseResolutionRate * 0.4) + 
      (alertResponseRate * 0.3) + 
      (userVerificationRate * 0.3)
    );

    // Determine status based on score
    let status = 'Healthy';
    if (overallScore < 60) status = 'Critical';
    else if (overallScore < 80) status = 'Moderate';

    // Calculate training completion (mock data - in real app this would come from training system)
    const trainingCompletion = Math.max(85, Math.min(98, overallScore + 5));

    // Calculate policy updates (mock data - in real app this would come from policy management system)
    const policyUpdates = Math.floor(Math.random() * 3) + 1; // 1-3 updates

    return {
      overallScore,
      status,
      lastUpdated,
      casesOpened: openCases,
      casesResolved: resolvedCases,
      alertsGenerated: totalAlerts,
      amlAlerts,
      kycAlerts,
      trainingCompletion,
      policyUpdates
    };
  }, [cases, alerts, users]);

  // Calculate risk factors with enhanced data-driven calculations
  const riskFactors = useMemo((): RiskFactor[] => {
    // Calculate AML alerts count for risk factor calculation
    const amlAlertsCount = alerts.filter(a => 
      a.type === 'high_risk_country' || 
      a.type === 'structuring' || 
      a.type === 'suspicious_pattern'
    ).length;

    // Calculate high-risk transactions
    const highRiskTransactions = transactions.filter(t => t.riskScore > 70).length;
    const totalTransactions = transactions.length;
    const highRiskTransactionRate = totalTransactions > 0 ? (highRiskTransactions / totalTransactions) * 100 : 0;

    // Calculate user verification metrics
    const verifiedUsers = users.filter(u => u.status === 'verified').length;
    const totalUsers = users.length;
    const verificationRate = totalUsers > 0 ? (verifiedUsers / totalUsers) * 100 : 100;

    // Calculate case resolution metrics
    const openCases = cases.filter(c => c.status === 'open').length;
    const totalCases = cases.length;
    const caseResolutionRate = totalCases > 0 ? ((totalCases - openCases) / totalCases) * 100 : 100;

    // Transaction Monitoring - based on alert volume and high-risk transaction rate
    const transactionMonitoring = {
      name: 'Transaction Monitoring',
      score: Math.max(60, Math.min(95, 100 - (alerts.length * 2) - (highRiskTransactionRate * 0.5))),
      status: 'Healthy' as 'Healthy' | 'Moderate' | 'Critical',
      description: `${alerts.length} active alerts, ${highRiskTransactionRate.toFixed(1)}% high-risk transactions`,
      trend: alerts.length > 5 ? ('up' as const) : ('stable' as const)
    };

    // KYC/CDD - based on user verification rates
    const kycCdd = {
      name: 'KYC/CDD',
      score: Math.round(verificationRate),
      status: 'Healthy' as 'Healthy' | 'Moderate' | 'Critical',
      description: `${verifiedUsers}/${totalUsers} users verified (${verificationRate.toFixed(1)}%)`,
      trend: verificationRate > 90 ? ('stable' as const) : ('down' as const)
    };

    // AML Procedures - based on AML alerts and case resolution
    const amlProcedures = {
      name: 'AML Procedures',
      score: Math.max(50, Math.min(90, 100 - (amlAlertsCount * 3) - (openCases * 2))),
      status: 'Moderate' as 'Healthy' | 'Moderate' | 'Critical',
      description: `${amlAlertsCount} AML alerts, ${openCases} open cases`,
      trend: amlAlertsCount > 3 ? ('up' as const) : ('stable' as const)
    };

    // Sanctions Screening - based on sanctions-related data
    const sanctionsAlerts = alerts.filter(a => a.type === 'high_risk_country').length;
    const sanctionsScreening = {
      name: 'Sanctions Screening',
      score: Math.max(85, 100 - (sanctionsAlerts * 5)),
      status: 'Healthy' as 'Healthy' | 'Moderate' | 'Critical',
      description: `${sanctionsAlerts} sanctions-related alerts detected`,
      trend: sanctionsAlerts > 0 ? ('up' as const) : ('stable' as const)
    };

    // Regulatory Reporting - based on case management and resolution
    const regulatoryReporting = {
      name: 'Regulatory Reporting',
      score: Math.max(70, Math.min(95, caseResolutionRate + 10)),
      status: 'Healthy' as 'Healthy' | 'Moderate' | 'Critical',
      description: `${caseResolutionRate.toFixed(1)}% case resolution rate`,
      trend: caseResolutionRate > 80 ? ('stable' as const) : ('down' as const)
    };

    // Adjust status based on scores
    [transactionMonitoring, kycCdd, amlProcedures, sanctionsScreening, regulatoryReporting].forEach(factor => {
      if (factor.score < 60) factor.status = 'Critical' as const;
      else if (factor.score < 80) factor.status = 'Moderate' as const;
      else factor.status = 'Healthy' as const;
    });

    return [transactionMonitoring, kycCdd, amlProcedures, sanctionsScreening, regulatoryReporting];
  }, [alerts, users, cases, transactions]);

  // Generate enhanced recent activities with more detail
  const recentActivities = useMemo((): RecentActivity[] => {
    const activities: RecentActivity[] = [];

    // Add recent alerts with severity levels
    const recentAlerts = alerts
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 3);

    recentAlerts.forEach(alert => {
      let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
      if (alert.type === 'high_risk_country') severity = 'high';
      if (alert.type === 'structuring') severity = 'critical';
      if (alert.type === 'suspicious_pattern') severity = 'high';

      activities.push({
        type: 'AML Alert',
        description: alert.description,
        date: new Date(alert.timestamp).toISOString().split('T')[0],
        status: 'Open',
        severity,
        user: alert.userName
      });
    });

    // Add recent case updates with more context
    const recentCases = cases
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3);

    recentCases.forEach(caseItem => {
      let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
      if (caseItem.priority === 'high') severity = 'high';
      if (caseItem.priority === 'critical') severity = 'critical';
      if (caseItem.priority === 'low') severity = 'low';

      activities.push({
        type: `${caseItem.type.toUpperCase()} Case`,
        description: `${caseItem.description} (Risk Score: ${caseItem.riskScore})`,
        date: new Date(caseItem.updatedAt).toISOString().split('T')[0],
        status: caseItem.status === 'open' ? 'Open' : 
                caseItem.status === 'closed' ? 'Completed' : 'Pending',
        severity,
        user: caseItem.userName
      });
    });

    // Add high-risk transaction alerts
    const highRiskTransactions = transactions
      .filter(t => t.riskScore > 80)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 2);

    highRiskTransactions.forEach(transaction => {
      activities.push({
        type: 'High-Risk Transaction',
        description: `${transaction.amount} ${transaction.currency} transfer to ${transaction.destinationCountry}`,
        date: new Date(transaction.timestamp).toISOString().split('T')[0],
        status: 'Flagged',
        severity: 'high',
        user: transaction.userName
      });
    });

    // Add system activities
    activities.push({
      type: 'System Update',
      description: 'Compliance system updated to v2.5 - Enhanced risk scoring algorithms deployed',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days ago
      status: 'Completed',
      severity: 'low'
    });

    // Add policy update activity
    activities.push({
      type: 'Policy Update',
      description: 'Updated AML policy - Enhanced due diligence requirements for high-risk jurisdictions',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ago
      status: 'Completed',
      severity: 'medium'
    });

    // Sort by date and return top 6
    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  }, [alerts, cases, transactions]);

  return {
    complianceData,
    riskFactors,
    recentActivities,
    loading
  };
}
