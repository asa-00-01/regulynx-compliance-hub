import { describe, it, expect } from 'vitest';
import { 
  isPlatformUser, 
  isCustomerUser, 
  hasCustomerRole, 
  hasPlatformRole,
  type PlatformRole,
  type CustomerRole 
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
};

const ownerUser: ExtendedUserProfile = {
  id: 'owner_id',
  email: 'owner@example.com',
  name: 'Owner User',
  role: 'owner',
  customer_roles: [],
  platform_roles: ['owner'],
  isPlatformOwner: true,
};

const customerAdminUser: ExtendedUserProfile = {
  id: 'customer_admin_id',
  email: 'customer_admin@example.com',
  name: 'Customer Admin',
  role: 'customer_admin',
  customer_roles: ['customer_admin'],
  platform_roles: [],
  isPlatformOwner: false,
};

const customerComplianceUser: ExtendedUserProfile = {
  id: 'customer_compliance_id',
  email: 'compliance@example.com',
  name: 'Compliance Officer',
  role: 'customer_compliance',
  customer_roles: ['customer_compliance'],
  platform_roles: [],
  isPlatformOwner: false,
};

describe('Platform Role Functions', () => {
  describe('hasPlatformRole', () => {
    it('should return true for users with the specified platform role', () => {
      // Fix: Use correct platform role types
      expect(hasPlatformRole(platformAdminUser, 'platform_admin' as PlatformRole)).toBe(true);
      expect(hasPlatformRole(ownerUser, 'owner' as PlatformRole)).toBe(true);
    });

    it('should return false for users without the specified platform role', () => {
      expect(hasPlatformRole(customerAdminUser, 'platform_admin' as PlatformRole)).toBe(false);
      expect(hasPlatformRole(customerComplianceUser, 'owner' as PlatformRole)).toBe(false);
    });
  });

  describe('isPlatformUser', () => {
    it('should return true for platform admin and owner users', () => {
      expect(isPlatformUser(platformAdminUser)).toBe(true);
      expect(isPlatformUser(ownerUser)).toBe(true);
    });

    it('should return false for customer users', () => {
      expect(isPlatformUser(customerAdminUser)).toBe(false);
      expect(isPlatformUser(customerComplianceUser)).toBe(false);
    });
  });
});

describe('Customer Role Functions', () => {
  describe('hasCustomerRole', () => {
    it('should return true for users with the specified customer role', () => {
      expect(hasCustomerRole(customerAdminUser, 'customer_admin' as CustomerRole)).toBe(true);
      expect(hasCustomerRole(customerComplianceUser, 'customer_compliance' as CustomerRole)).toBe(true);
    });

    it('should return false for users without the specified customer role', () => {
      expect(hasCustomerRole(platformAdminUser, 'customer_admin' as CustomerRole)).toBe(false);
      expect(hasCustomerRole(ownerUser, 'customer_compliance' as CustomerRole)).toBe(false);
    });
  });

  describe('isCustomerUser', () => {
    it('should return true for customer admin and compliance users', () => {
      expect(isCustomerUser(customerAdminUser)).toBe(true);
      expect(isCustomerUser(customerComplianceUser)).toBe(true);
    });

    it('should return false for platform users', () => {
      expect(isCustomerUser(platformAdminUser)).toBe(false);
      expect(isCustomerUser(ownerUser)).toBe(false);
    });
  });
});
