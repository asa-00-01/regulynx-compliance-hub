
export type Role =
  | "compliance_officer"
  | "executive" 
  | "support"
  | "org_admin"
  | "platform_admin"
  | "owner";

export const SUBSCRIBER_ROLES: Role[] = [
  "compliance_officer",
  "executive",
  "support", 
  "org_admin",
];

export const MANAGEMENT_ROLES: Role[] = [
  "platform_admin",
  "owner",
];

export const isSubscriberRole = (r?: Role) => !!r && SUBSCRIBER_ROLES.includes(r);
export const isManagementRole = (r?: Role) => !!r && MANAGEMENT_ROLES.includes(r);

// Helper to determine which area a user should be routed to
export const getUserArea = (role?: Role): 'subscriber' | 'management' | null => {
  if (!role) return null;
  if (isSubscriberRole(role)) return 'subscriber';
  if (isManagementRole(role)) return 'management';
  return null;
};
