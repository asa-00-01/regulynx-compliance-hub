
import { ComplianceState, ComplianceAction, ComplianceMetrics } from './types';

export const complianceReducer = (state: ComplianceState, action: ComplianceAction): ComplianceState => {
  switch (action.type) {
    case 'SET_USERS':
      const metrics: ComplianceMetrics = {
        totalUsers: action.payload.length,
        highRiskUsers: action.payload.filter(u => u.riskScore > 75).length,
        pendingKYC: action.payload.filter(u => u.kycStatus === 'pending').length,
        verifiedUsers: action.payload.filter(u => u.kycStatus === 'verified').length,
      };
      
      return {
        ...state,
        users: action.payload,
        metrics,
        loading: false,
      };
      
    case 'UPDATE_USER_DATA':
      const updatedUsers = state.users.map(user =>
        user.id === action.payload.id ? action.payload : user
      );
      return {
        ...state,
        users: updatedUsers,
        selectedUser: state.selectedUser?.id === action.payload.id ? action.payload : state.selectedUser,
      };
      
    case 'SET_SELECTED_USER':
      const selectedUser = action.payload 
        ? state.users.find(user => user.id === action.payload) || null
        : null;
      return {
        ...state,
        selectedUserId: action.payload,
        selectedUser,
      };
      
    case 'SET_SELECTED_CASE':
      return {
        ...state,
        selectedCase: action.payload,
      };
      
    case 'SET_GLOBAL_FILTERS':
      return {
        ...state,
        globalFilters: action.payload,
        filters: action.payload,
      };
      
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
      
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
      
    case 'SET_METRICS':
      return {
        ...state,
        metrics: action.payload,
      };
      
    default:
      return state;
  }
};
