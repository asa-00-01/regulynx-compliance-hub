
import { ComplianceState, ComplianceAction } from './types';

export const complianceReducer = (
  state: ComplianceState,
  action: ComplianceAction
): ComplianceState => {
  switch (action.type) {
    case 'SET_USERS':
      console.log('Reducer: Setting users:', action.payload.length);
      return {
        ...state,
        users: action.payload,
        filteredUsers: action.payload
      };
    case 'UPDATE_USER_DATA':
      const existingUserIndex = state.users.findIndex(user => user.id === action.payload.id);
      if (existingUserIndex >= 0) {
        const updatedUsers = [...state.users];
        updatedUsers[existingUserIndex] = action.payload;
        return {
          ...state,
          users: updatedUsers,
          filteredUsers: updatedUsers
        };
      } else {
        const newUsers = [...state.users, action.payload];
        return {
          ...state,
          users: newUsers,
          filteredUsers: newUsers
        };
      }
    case 'SET_SELECTED_USER':
      return {
        ...state,
        selectedUserId: action.payload
      };
    case 'SET_SELECTED_CASE':
      return {
        ...state,
        selectedCase: action.payload
      };
    case 'SET_GLOBAL_FILTERS':
      return {
        ...state,
        globalFilters: action.payload
      };
    case 'UPDATE_USER_STATUS':
      const updatedUsersStatus = state.users.map(user => 
        user.id === action.payload.userId 
          ? { ...user, kycStatus: action.payload.status as any }
          : user
      );
      return {
        ...state,
        users: updatedUsersStatus,
        filteredUsers: updatedUsersStatus
      };
    case 'UPDATE_USER_RISK_SCORE':
      const updatedUsersRisk = state.users.map(user => 
        user.id === action.payload.userId 
          ? { ...user, riskScore: action.payload.riskScore }
          : user
      );
      return {
        ...state,
        users: updatedUsersRisk,
        filteredUsers: updatedUsersRisk,
        userRiskScores: {
          ...state.userRiskScores,
          [action.payload.userId]: action.payload.riskScore
        }
      };
    case 'CREATE_COMPLIANCE_CASE':
      return {
        ...state,
        cases: [...state.cases, action.payload]
      };
    case 'UPDATE_COMPLIANCE_CASE':
      const updatedCases = state.cases.map(caseItem => 
        caseItem.id === action.payload.caseId 
          ? { ...caseItem, ...action.payload.updates }
          : caseItem
      );
      return {
        ...state,
        cases: updatedCases
      };
    case 'FILTER_USERS':
      // Implement filtering logic here if needed
      return state;
    case 'SET_TRANSACTIONS':
      return {
        ...state,
        transactions: action.payload
      };
    case 'SET_CASES':
      return {
        ...state,
        cases: action.payload
      };
    case 'SET_RISK_RULES':
      return {
        ...state,
        riskRules: action.payload
      };
    default:
      return state;
  }
};
