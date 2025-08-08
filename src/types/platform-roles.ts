
export type PlatformRole = 'platform_admin' | 'platform_support';

export type CustomerRole = 'customer_admin' | 'customer_compliance' | 'customer_executive' | 'customer_support';

export interface Customer {
  id: string;
  name: string;
  domain: string | null;
  settings: Record<string, any>;
  subscription_tier: string;
  created_at: string;
  updated_at: string;
}

export interface PlatformRoleAssignment {
  id: string;
  user_id: string;
  role: PlatformRole;
  created_at: string;
}

export interface CustomerRoleAssignment {
  id: string;
  user_id: string;
  customer_id: string;
  role: CustomerRole;
  created_at: string;
}

export interface ExtendedUserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  customer_id?: string;
  platform_roles: PlatformRole[];
  customer_roles: CustomerRole[];
  customer?: Customer;
  created_at: string;
  updated_at: string;
}
