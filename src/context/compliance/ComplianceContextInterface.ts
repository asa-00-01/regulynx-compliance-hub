
import React from 'react';
import { ComplianceState, ComplianceAction, UnifiedUserData, GlobalFilters, ComplianceMetrics } from './types';
import { Document } from '@/types';
import { AMLTransaction } from '@/types/aml';
import { ComplianceCaseDetails } from '@/types/case';

export interface ComplianceActions {
  loadUsers: () => Promise<void>;
  selectUser: (user: UnifiedUserData) => void;
  updateFilters: (filters: GlobalFilters) => void;
  refreshMetrics: () => Promise<void>;
}

export interface ComplianceContextInterface {
  state: ComplianceState;
  dispatch: React.Dispatch<ComplianceAction>;
  selectedUser: UnifiedUserData | null;
  setSelectedUser: (userId: string | null) => void;
  getUserById: (userId: string) => UnifiedUserData | null;
  getRelatedDocuments: (userId: string) => Document[];
  getRelatedTransactions: (userId: string) => AMLTransaction[];
  getRelatedCases: (userId: string) => ComplianceCaseDetails[];
  actions: ComplianceActions;
}
