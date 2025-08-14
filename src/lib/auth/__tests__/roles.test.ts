
import { describe, it, expect } from 'vitest';
import { 
  isManagementUser, 
  isSubscriberUser, 
  isManagementRole, 
  isSubscriberRole,
  type ManagementRole,
  type SubscriberRole 
} from '../roles';
import type { ExtendedUserProfile } from '@/types/platform-roles';

// Mock users for testing
const platformAdminUser: ExtendedUserProfile = {
  id: 'platform_admin_id',
  email: 'platform_admin@example.com',
  name: 'Platform Admin',
  role: 'platform_admin',
  customer_roles: [],
  platform_roles: ['platform_admin'],
  isPlatformOwner: false,
  risk_score: 0,
  status: 'verified',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const ownerUser: ExtendedUserProfile = {
  id: 'owner_id',
  email: 'owner@example.com',
  name: 'Owner User',
  role: 'owner',
  customer_roles: [],
  platform_roles: ['owner'],
  isPlatformOwner: true,
  risk_score: 0,
  status: 'verified',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const customerAdminUser: ExtendedUserProfile = {
  id: 'customer_admin_id',
  email: 'customer_admin@example.com',
  name: 'Customer Admin',
  role: 'customer_admin',
  customer_roles: ['customer_admin'],
  platform_roles: [],
  isPlatformOwner: false,
  risk_score: 0,
  status: 'verified',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const customerComplianceUser: ExtendedUserProfile = {
  id: 'customer_compliance_id',
  email: 'compliance@example.com',
  name: 'Compliance Officer',
  role: 'customer_compliance',
  customer_roles: ['customer_compliance'],
  platform_roles: [],
  isPlatformOwner: false,
  risk_score: 0,
  status: 'verified',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('Management Role Functions', () => {
  describe('isManagementRole', () => {
    it('should return true for management roles', () => {
      expect(isManagementRole('platform_admin')).toBe(true);
      expect(isManagementRole('owner')).toBe(true);
    });

    it('should return false for subscriber roles', () => {
      expect(isManagementRole('customer_admin')).toBe(false);
      expect(isManagementRole('customer_compliance')).toBe(false);
    });
  });

  describe('isManagementUser', () => {
    it('should return true for platform admin and owner users', () => {
      expect(isManagementUser(platformAdminUser)).toBe(true);
      expect(isManagementUser(ownerUser)).toBe(true);
    });

    it('should return false for customer users', () => {
      expect(isManagementUser(customerAdminUser)).toBe(false);
      expect(isManagementUser(customerComplianceUser)).toBe(false);
    });
  });
});

describe('Subscriber Role Functions', () => {
  describe('isSubscriberRole', () => {
    it('should return true for subscriber roles', () => {
      expect(isSubscriberRole('customer_admin')).toBe(true);
      expect(isSubscriberRole('customer_compliance')).toBe(true);
    });

    it('should return false for management roles', () => {
      expect(isSubscriberRole('platform_admin')).toBe(false);
      expect(isSubscriberRole('owner')).toBe(false);
    });
  });

  describe('isSubscriberUser', () => {
    it('should return true for customer admin and compliance users', () => {
      expect(isSubscriberUser(customerAdminUser)).toBe(true);
      expect(isSubscriberUser(customerComplianceUser)).toBe(true);
    });

    it('should return false for platform users', () => {
      expect(isSubscriberUser(platformAdminUser)).toBe(false);
      expect(isSubscriberUser(ownerUser)).toBe(false);
    });
  });
});
