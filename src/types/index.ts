
// Re-export standardized types from the main type files
export type { StandardUser as User, UserRole, UserStatus, UserPreferences } from './user';
export type { ExtendedUser } from './auth';

// Legacy type aliases for backward compatibility
export type { UserRole as LegacyUserRole } from './user';

// Export document types
export type { Document } from './document';

// Export compliance types
export type { ComplianceCase, DashboardMetrics } from './compliance';
