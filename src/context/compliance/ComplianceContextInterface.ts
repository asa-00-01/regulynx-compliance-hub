
import React from 'react';
import { ComplianceState, ComplianceAction, UnifiedUserData } from './types';
import { Document } from '@/types/supabase';
import { AMLTransaction } from '@/types/aml';
import { ComplianceCaseDetails } from '@/types/case';

export interface ComplianceContextInterface {
  state: ComplianceState;
  dispatch: React.Dispatch<ComplianceAction>;
  selectedUser: UnifiedUserData | null;
  setSelectedUser: (userId: string | null) => void;
  getUserById: (userId: string) => UnifiedUserData | null;
  getRelatedDocuments: (userId: string) => Document[];
  getRelatedTransactions: (userId: string) => AMLTransaction[];
  getRelatedCases: (userId: string) => ComplianceCaseDetails[];
  // Operations from useComplianceOperations
  getUserDocuments: (userId: string) => Document[];
  getUserTransactions: (userId: string) => AMLTransaction[];
  getUserCases: (userId: string) => ComplianceCaseDetails[];
  updateUserStatus: (userId: string, status: 'verified' | 'pending' | 'flagged') => void;
  updateUserRiskScore: (userId: string, riskScore: number) => void;
  calculateUserRiskScore: (userId: string) => number;
  createComplianceCase: (caseData: Omit<ComplianceCaseDetails, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateComplianceCase: (caseId: string, updates: Partial<ComplianceCaseDetails>) => void;
  filterUsers: (filters: any) => void;
  users: UnifiedUserData[];
  allUsers: UnifiedUserData[];
  transactions: AMLTransaction[];
  cases: ComplianceCaseDetails[];
  riskRules: any[];
}
