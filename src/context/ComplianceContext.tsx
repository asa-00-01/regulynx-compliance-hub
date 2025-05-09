import React, { createContext, useContext, useState, useReducer, useEffect } from 'react';
import { KYCUser, UserFlags } from '@/types/kyc';
import { AMLTransaction } from '@/types/aml';
import { Document } from '@/types';
import { ComplianceCaseDetails } from '@/types/case';
import { mockUsers } from '@/components/kyc/mockKycData';
import { mockTransactions } from '@/components/aml/mockTransactionData';
import { generateMockDocuments } from '@/components/documents/mockDocumentData';
import { generateMockUser } from '@/mocks/userDataGenerator';

// Define the shape of our unified user data model
export interface UnifiedUserData {
  id: string;
  fullName: string;
  email: string;
  dateOfBirth?: string;
  nationality?: string;
  identityNumber?: string;
  phoneNumber?: string;
  address?: string;
  createdAt: string;
  kycStatus: 'verified' | 'pending' | 'rejected' | 'information_requested';
  kycFlags: UserFlags;
  riskScore: number;
  documents: Document[];
  transactions: AMLTransaction[];
  complianceCases: ComplianceCaseDetails[];
  notes?: string[];
  isPEP: boolean;
  isSanctioned: boolean;
}

interface ComplianceState {
  users: UnifiedUserData[];
  selectedUserId: string | null;
  selectedCase: ComplianceCaseDetails | null;
  globalFilters: {
    searchTerm: string;
    riskLevel: string;
    dateRange: string;
    kycStatus: string[];
    country: string | undefined;
  };
}

type ComplianceAction =
  | { type: 'SET_SELECTED_USER'; payload: string | null }
  | { type: 'SET_SELECTED_CASE'; payload: ComplianceCaseDetails | null }
  | { type: 'UPDATE_USER_DATA'; payload: Partial<UnifiedUserData> & { id: string } }
  | { type: 'SET_GLOBAL_FILTERS'; payload: Partial<ComplianceState['globalFilters']> }
  | { type: 'ADD_CASE_TO_USER'; payload: { userId: string; caseData: ComplianceCaseDetails } }
  | { type: 'ADD_DOCUMENT_TO_USER'; payload: { userId: string; document: Document } }
  | { type: 'ADD_TRANSACTION_TO_USER'; payload: { userId: string; transaction: AMLTransaction } };

const initialState: ComplianceState = {
  users: [],
  selectedUserId: null,
  selectedCase: null,
  globalFilters: {
    searchTerm: '',
    riskLevel: 'all',
    dateRange: '30days',
    kycStatus: [],
    country: undefined,
  },
};

const complianceReducer = (state: ComplianceState, action: ComplianceAction): ComplianceState => {
  switch (action.type) {
    case 'SET_SELECTED_USER':
      return {
        ...state,
        selectedUserId: action.payload,
      };
    case 'SET_SELECTED_CASE':
      return {
        ...state,
        selectedCase: action.payload,
      };
    case 'UPDATE_USER_DATA':
      return {
        ...state,
        users: state.users.map((user) =>
          user.id === action.payload.id ? { ...user, ...action.payload } : user
        ),
      };
    case 'SET_GLOBAL_FILTERS':
      return {
        ...state,
        globalFilters: {
          ...state.globalFilters,
          ...action.payload,
        },
      };
    case 'ADD_CASE_TO_USER':
      return {
        ...state,
        users: state.users.map((user) =>
          user.id === action.payload.userId
            ? {
                ...user,
                complianceCases: [...user.complianceCases, action.payload.caseData],
              }
            : user
        ),
      };
    case 'ADD_DOCUMENT_TO_USER':
      return {
        ...state,
        users: state.users.map((user) =>
          user.id === action.payload.userId
            ? {
                ...user,
                documents: [...user.documents, action.payload.document],
              }
            : user
        ),
      };
    case 'ADD_TRANSACTION_TO_USER':
      return {
        ...state,
        users: state.users.map((user) =>
          user.id === action.payload.userId
            ? {
                ...user,
                transactions: [...user.transactions, action.payload.transaction],
              }
            : user
        ),
      };
    default:
      return state;
  }
};

// Create the context
const ComplianceContext = createContext<{
  state: ComplianceState;
  dispatch: React.Dispatch<ComplianceAction>;
  selectedUser: UnifiedUserData | null;
  setSelectedUser: (userId: string | null) => void;
  getUserById: (userId: string) => UnifiedUserData | null;
  getRelatedDocuments: (userId: string) => Document[];
  getRelatedTransactions: (userId: string) => AMLTransaction[];
  getRelatedCases: (userId: string) => ComplianceCaseDetails[];
}>({
  state: initialState,
  dispatch: () => null,
  selectedUser: null,
  setSelectedUser: () => null,
  getUserById: () => null,
  getRelatedDocuments: () => [],
  getRelatedTransactions: () => [],
  getRelatedCases: () => [],
});

// Create the provider component
export const ComplianceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(complianceReducer, initialState);
  
  // Initialize with mock data
  useEffect(() => {
    const initializeMockData = () => {
      // Generate 5 mock users with associated data
      const generatedUsers: UnifiedUserData[] = [];
      
      for (let i = 0; i < 5; i++) {
        // Take existing mock users from KYC and combine with generated data
        const kycUser = mockUsers[i] || generateMockUser(i.toString());
        const userTransactions = mockTransactions
          .filter(t => t.senderUserId === kycUser.id || (i < 2 && Math.random() > 0.7))
          .map(t => ({...t, senderUserId: kycUser.id}));
        
        // Generate documents and map them to the correct format
        const mockDocuments = generateMockDocuments(2).map(doc => {
          // Transform the document to match the Document type from @/types
          return {
            id: doc.id,
            userId: kycUser.id,
            type: doc.type,
            fileName: doc.file_name,
            uploadDate: doc.upload_date,
            status: doc.status,
            verifiedBy: doc.verified_by,
            verificationDate: doc.verification_date,
            extractedData: doc.extracted_data
          } as Document;
        });
        
        generatedUsers.push({
          id: kycUser.id,
          fullName: kycUser.fullName,
          email: kycUser.email,
          dateOfBirth: kycUser.dateOfBirth,
          identityNumber: kycUser.identityNumber,
          phoneNumber: kycUser.phoneNumber,
          address: kycUser.address,
          createdAt: kycUser.createdAt,
          kycStatus: kycUser.flags.is_verified_pep ? 'information_requested' : 'pending',
          kycFlags: kycUser.flags,
          riskScore: kycUser.flags.riskScore,
          documents: mockDocuments,
          transactions: userTransactions,
          complianceCases: [],
          isPEP: kycUser.flags.is_verified_pep,
          isSanctioned: kycUser.flags.is_sanction_list,
        });
      }
      
      dispatch({ type: 'SET_GLOBAL_FILTERS', payload: initialState.globalFilters });
      
      // Set mock users in state
      generatedUsers.forEach(user => {
        dispatch({ 
          type: 'UPDATE_USER_DATA', 
          payload: user
        });
      });
    };
    
    initializeMockData();
  }, []);
  
  const selectedUser = state.selectedUserId 
    ? state.users.find(user => user.id === state.selectedUserId) || null
    : null;
    
  const setSelectedUser = (userId: string | null) => {
    dispatch({ type: 'SET_SELECTED_USER', payload: userId });
  };
  
  const getUserById = (userId: string): UnifiedUserData | null => {
    return state.users.find(user => user.id === userId) || null;
  };
  
  const getRelatedDocuments = (userId: string): Document[] => {
    const user = getUserById(userId);
    return user ? user.documents : [];
  };
  
  const getRelatedTransactions = (userId: string): AMLTransaction[] => {
    const user = getUserById(userId);
    return user ? user.transactions : [];
  };
  
  const getRelatedCases = (userId: string): ComplianceCaseDetails[] => {
    const user = getUserById(userId);
    return user ? user.complianceCases : [];
  };

  return (
    <ComplianceContext.Provider 
      value={{ 
        state, 
        dispatch, 
        selectedUser, 
        setSelectedUser,
        getUserById,
        getRelatedDocuments,
        getRelatedTransactions,
        getRelatedCases
      }}
    >
      {children}
    </ComplianceContext.Provider>
  );
};

// Custom hook to use the compliance context
export const useCompliance = () => {
  const context = useContext(ComplianceContext);
  if (!context) {
    throw new Error('useCompliance must be used within a ComplianceProvider');
  }
  return context;
};
