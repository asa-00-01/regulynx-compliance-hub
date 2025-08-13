// Centralized role definitions for Regulynx Compliance Hub
// This file enforces strict separation between Customer (Subscriber) and Platform Management areas

// Customer (Subscriber) Roles - Access to /dashboard/* routes with CustomerLayout
export const SUBSCRIBER_ROLES = [
  'customer_admin',
  'customer_compliance', 
  'customer_support',
  'executive'
] as const;

// Platform Management Roles - Access to /platform/* routes with ManagementLayout
export const MANAGEMENT_ROLES = [
  'platform_admin',
  'owner'
] as const;

// Union type for all valid roles
export type SubscriberRole = typeof SUBSCRIBER_ROLES[number];
export type ManagementRole = typeof MANAGEMENT_ROLES[number];
export type Role = SubscriberRole | ManagementRole;

// Role validation helpers
export const isSubscriberRole = (role?: string): role is SubscriberRole => {
  return !!role && SUBSCRIBER_ROLES.includes(role as SubscriberRole);
};

export const isManagementRole = (role?: string): role is ManagementRole => {
  return !!role && MANAGEMENT_ROLES.includes(role as ManagementRole);
};

// Role group validation
export const isSubscriberUser = (user: { role?: string; customer_roles?: string[] } | null): boolean => {
  if (!user) return false;
  
  // Check primary role
  if (isSubscriberRole(user.role)) return true;
  
  // Check customer roles array
  if (user.customer_roles?.some(isSubscriberRole)) return true;
  
  return false;
};

export const isManagementUser = (user: { role?: string; platform_roles?: string[]; isPlatformOwner?: boolean } | null): boolean => {
  if (!user) return false;
  
  // Platform owner always has management access
  if (user.isPlatformOwner) return true;
  
  // Check primary role
  if (isManagementRole(user.role)) return true;
  
  // Check platform roles array
  if (user.platform_roles?.some(isManagementRole)) return true;
  
  return false;
};

// Route access validation
export const canAccessSubscriberRoutes = (user: any): boolean => {
  return isSubscriberUser(user);
};

export const canAccessManagementRoutes = (user: any): boolean => {
  return isManagementUser(user);
};

// Role display names for UI
export const getRoleDisplayName = (role: string): string => {
  const displayNames: Record<string, string> = {
    // Subscriber roles
    customer_admin: 'Customer Administrator',
    customer_compliance: 'Compliance Officer',
    customer_support: 'Support Staff',
    executive: 'Executive',
    
    // Management roles
    platform_admin: 'Platform Administrator',
    owner: 'Platform Owner',
  };
  
  return displayNames[role] || role;
};

// Role hierarchy for permission checking
export const getRoleHierarchy = (role: string): number => {
  const hierarchy: Record<string, number> = {
    // Subscriber hierarchy (higher = more permissions)
    customer_support: 1,
    customer_compliance: 2,
    customer_admin: 3,
    executive: 4,
    
    // Management hierarchy
    platform_admin: 5,
    owner: 6,
  };
  
  return hierarchy[role] || 0;
};

// Check if a role can access another role's permissions
export const canAccessRole = (userRole: string, targetRole: string): boolean => {
  const userHierarchy = getRoleHierarchy(userRole);
  const targetHierarchy = getRoleHierarchy(targetRole);
  
  return userHierarchy >= targetHierarchy;
};
