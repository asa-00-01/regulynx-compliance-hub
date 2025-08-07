
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
        users: action.payload
      };
    case 'UPDATE_USER_DATA':
      const existingUserIndex = state.users.findIndex(user => user.id === action.payload.id);
      if (existingUserIndex >= 0) {
        const updatedUsers = [...state.users];
        updatedUsers[existingUserIndex] = action.payload;
        return {
          ...state,
          users: updatedUsers
        };
      } else {
        return {
          ...state,
          users: [...state.users, action.payload]
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
    default:
      return state;
  }
};
