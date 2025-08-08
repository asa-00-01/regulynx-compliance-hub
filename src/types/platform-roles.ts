
export type PlatformRole = 'platform_admin' | 'platform_support';
export type CustomerRole = 'customer_admin' | 'customer_compliance' | 'customer_executive' | 'customer_support';

export interface Customer {
  id: string;
  name: string;
  domain?: string;
  subscription_tier: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ExtendedUserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  customer_id?: string;
  role: string; // Legacy role for backward compatibility
  risk_score: number;
  status: 'verified' | 'pending' | 'rejected' | 'information_requested';
  created_at: string;
  updated_at: string;
  platform_roles: PlatformRole[];
  customer_roles: CustomerRole[];
  customer?: Customer | null;
  isPlatformOwner: boolean;
  // Legacy fields for backward compatibility
  riskScore?: number;
  title?: string;
  department?: string;
  phone?: string;
  location?: string;
  preferences?: Record<string, any>;
}
