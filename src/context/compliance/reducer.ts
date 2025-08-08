
import { ComplianceState, ComplianceAction } from './types';

/**
 * Compliance state reducer managing user data, selections, cases, and global filters.
 * Handles all state transitions for the compliance context.
 */
export const complianceReducer = (
  currentState: ComplianceState,
  dispatchedAction: ComplianceAction
): ComplianceState => {
  switch (dispatchedAction.type) {
    case 'SET_USERS':
      return handleSetUsers(currentState, dispatchedAction.payload);
    
    case 'UPDATE_USER_DATA':
      return handleUpdateUserData(currentState, dispatchedAction.payload);
    
    case 'SET_SELECTED_USER':
      return handleSetSelectedUser(currentState, dispatchedAction.payload);
    
    case 'SET_SELECTED_CASE':
      return handleSetSelectedCase(currentState, dispatchedAction.payload);
    
    case 'SET_GLOBAL_FILTERS':
      return handleSetGlobalFilters(currentState, dispatchedAction.payload);
    
    default:
      return currentState;
  }
};

/**
 * Handles setting the complete users list
 */
function handleSetUsers(currentState: ComplianceState, usersList: any[]): ComplianceState {
  console.log('Reducer: Setting users:', usersList.length);
  return {
    ...currentState,
    users: usersList
  };
}

/**
 * Handles updating or adding individual user data
 */
function handleUpdateUserData(currentState: ComplianceState, updatedUserData: any): ComplianceState {
  const existingUserIndex = currentState.users.findIndex(user => user.id === updatedUserData.id);
  
  if (existingUserIndex >= 0) {
    return updateExistingUser(currentState, existingUserIndex, updatedUserData);
  } else {
    return addNewUser(currentState, updatedUserData);
  }
}

/**
 * Updates existing user in the users list
 */
function updateExistingUser(
  currentState: ComplianceState, 
  userIndex: number, 
  updatedUserData: any
): ComplianceState {
  const updatedUsersList = [...currentState.users];
  updatedUsersList[userIndex] = updatedUserData;
  
  return {
    ...currentState,
    users: updatedUsersList
  };
}

/**
 * Adds new user to the users list
 */
function addNewUser(currentState: ComplianceState, newUserData: any): ComplianceState {
  return {
    ...currentState,
    users: [...currentState.users, newUserData]
  };
}

/**
 * Handles setting the selected user ID
 */
function handleSetSelectedUser(currentState: ComplianceState, selectedUserId: string | null): ComplianceState {
  return {
    ...currentState,
    selectedUserId: selectedUserId
  };
}

/**
 * Handles setting the selected case
 */
function handleSetSelectedCase(currentState: ComplianceState, selectedCaseData: any): ComplianceState {
  return {
    ...currentState,
    selectedCase: selectedCaseData
  };
}

/**
 * Handles setting global filter configuration
 */
function handleSetGlobalFilters(currentState: ComplianceState, globalFilterSettings: any): ComplianceState {
  return {
    ...currentState,
    globalFilters: globalFilterSettings
  };
}
