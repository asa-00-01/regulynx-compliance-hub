import { ComplianceCaseDetails, CaseAction, CaseFilters, CaseSummary } from '@/types/case';
import { User } from '@/types';

export interface UseComplianceCasesReturn {
  cases: ComplianceCaseDetails[];
  caseActions: CaseAction[];
  caseSummary: CaseSummary;
  filters: CaseFilters;
  selectedCase: ComplianceCaseDetails | null;
  loading: boolean;
  setFilters: (filters: CaseFilters) => void;
  selectCase: (caseItem: ComplianceCaseDetails) => void;
  addCaseNote: (caseId: string, note: string) => Promise<CaseAction | null>;
  updateCaseStatus: (
    caseId: string, 
    newStatus: ComplianceCaseDetails['status'],
    note?: string
  ) => Promise<boolean>;
  assignCase: (
    caseId: string, 
    assignToId: string, 
    assignToName: string
  ) => Promise<boolean>;
  createCase: (caseData: Partial<ComplianceCaseDetails>) => Promise<ComplianceCaseDetails | null>;
  fetchCases: () => Promise<void>;
}

export interface CaseServiceOperations {
  fetchCases: (filters: CaseFilters) => Promise<ComplianceCaseDetails[]>;
  createCase: (caseData: Partial<ComplianceCaseDetails>) => Promise<ComplianceCaseDetails>;
  fetchCaseActions: (caseId: string) => Promise<CaseAction[]>;
}
