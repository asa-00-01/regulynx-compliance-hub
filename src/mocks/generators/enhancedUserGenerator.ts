// Re-export everything from the user module for backward compatibility
export * from './user';

// Keep the old exports for backward compatibility
export { enhancedUserProfiles } from './user/profiles';
export { convertToUnifiedUserData } from './user/converter';
export type { EnhancedUserProfile } from './user/types';
