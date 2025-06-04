
import { ComplianceState, ComplianceAction } from './types';

export const complianceReducer = (state: ComplianceState, action: ComplianceAction): ComplianceState => {
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
