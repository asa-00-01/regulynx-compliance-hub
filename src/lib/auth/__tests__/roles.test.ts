import { describe, it, expect } from 'vitest';
import {
  SUBSCRIBER_ROLES,
  MANAGEMENT_ROLES,
  isSubscriberRole,
  isManagementRole,
  isSubscriberUser,
  isManagementUser,
  canAccessSubscriberRoutes,
  canAccessManagementRoutes,
  getRoleDisplayName,
  getRoleHierarchy,
  canAccessRole,
} from '../roles';

describe('Role Management System', () => {
  describe('Role Constants', () => {
    it('should define subscriber roles correctly', () => {
      expect(SUBSCRIBER_ROLES).toEqual([
        'customer_admin',
        'customer_compliance',
        'customer_support',
        'executive'
      ]);
    });

    it('should define management roles correctly', () => {
      expect(MANAGEMENT_ROLES).toEqual([
        'platform_admin',
        'owner'
      ]);
    });

    it('should not have overlapping roles', () => {
      const subscriberSet = new Set(SUBSCRIBER_ROLES);
      const managementSet = new Set(MANAGEMENT_ROLES);
      
      const intersection = [...subscriberSet].filter(x => managementSet.has(x));
      expect(intersection).toHaveLength(0);
    });
  });

  describe('Role Validation', () => {
    describe('isSubscriberRole', () => {
      it('should return true for valid subscriber roles', () => {
        expect(isSubscriberRole('customer_admin')).toBe(true);
        expect(isSubscriberRole('customer_compliance')).toBe(true);
        expect(isSubscriberRole('customer_support')).toBe(true);
        expect(isSubscriberRole('executive')).toBe(true);
      });

      it('should return false for management roles', () => {
        expect(isSubscriberRole('platform_admin')).toBe(false);
        expect(isSubscriberRole('owner')).toBe(false);
      });

      it('should return false for invalid roles', () => {
        expect(isSubscriberRole('invalid_role')).toBe(false);
        expect(isSubscriberRole('')).toBe(false);
        expect(isSubscriberRole(undefined)).toBe(false);
      });
    });

    describe('isManagementRole', () => {
      it('should return true for valid management roles', () => {
        expect(isManagementRole('platform_admin')).toBe(true);
        expect(isManagementRole('owner')).toBe(true);
      });

      it('should return false for subscriber roles', () => {
        expect(isManagementRole('customer_admin')).toBe(false);
        expect(isManagementRole('customer_compliance')).toBe(false);
        expect(isManagementRole('customer_support')).toBe(false);
        expect(isManagementRole('executive')).toBe(false);
      });

      it('should return false for invalid roles', () => {
        expect(isManagementRole('invalid_role')).toBe(false);
        expect(isManagementRole('')).toBe(false);
        expect(isManagementRole(undefined)).toBe(false);
      });
    });
  });

  describe('User Type Validation', () => {
    describe('isSubscriberUser', () => {
      it('should identify subscriber users by primary role', () => {
        expect(isSubscriberUser({ role: 'customer_admin' })).toBe(true);
        expect(isSubscriberUser({ role: 'customer_compliance' })).toBe(true);
        expect(isSubscriberUser({ role: 'customer_support' })).toBe(true);
        expect(isSubscriberUser({ role: 'executive' })).toBe(true);
      });

      it('should identify subscriber users by customer_roles array', () => {
        expect(isSubscriberUser({ customer_roles: ['customer_admin'] })).toBe(true);
        expect(isSubscriberUser({ customer_roles: ['customer_compliance'] })).toBe(true);
        expect(isSubscriberUser({ customer_roles: ['customer_support'] })).toBe(true);
        expect(isSubscriberUser({ customer_roles: ['executive'] })).toBe(true);
      });

      it('should return false for management users', () => {
        expect(isSubscriberUser({ role: 'platform_admin' })).toBe(false);
        expect(isSubscriberUser({ role: 'owner' })).toBe(false);
      });

      it('should return false for null/undefined users', () => {
        expect(isSubscriberUser(null)).toBe(false);
        expect(isSubscriberUser(undefined)).toBe(false);
      });
    });

    describe('isManagementUser', () => {
      it('should identify management users by primary role', () => {
        expect(isManagementUser({ role: 'platform_admin' })).toBe(true);
        expect(isManagementUser({ role: 'owner' })).toBe(true);
      });

      it('should identify management users by platform_roles array', () => {
        expect(isManagementUser({ platform_roles: ['platform_admin'] })).toBe(true);
        expect(isManagementUser({ platform_roles: ['owner'] })).toBe(true);
      });

      it('should identify platform owners', () => {
        expect(isManagementUser({ isPlatformOwner: true })).toBe(true);
        expect(isManagementUser({ isPlatformOwner: false })).toBe(false);
      });

      it('should return false for subscriber users', () => {
        expect(isManagementUser({ role: 'customer_admin' })).toBe(false);
        expect(isManagementUser({ role: 'customer_compliance' })).toBe(false);
        expect(isManagementUser({ role: 'customer_support' })).toBe(false);
        expect(isManagementUser({ role: 'executive' })).toBe(false);
      });

      it('should return false for null/undefined users', () => {
        expect(isManagementUser(null)).toBe(false);
        expect(isManagementUser(undefined)).toBe(false);
      });
    });
  });

  describe('Route Access Validation', () => {
    describe('canAccessSubscriberRoutes', () => {
      it('should allow subscriber users', () => {
        expect(canAccessSubscriberRoutes({ role: 'customer_admin' })).toBe(true);
        expect(canAccessSubscriberRoutes({ role: 'customer_compliance' })).toBe(true);
        expect(canAccessSubscriberRoutes({ role: 'customer_support' })).toBe(true);
        expect(canAccessSubscriberRoutes({ role: 'executive' })).toBe(true);
      });

      it('should deny management users', () => {
        expect(canAccessSubscriberRoutes({ role: 'platform_admin' })).toBe(false);
        expect(canAccessSubscriberRoutes({ role: 'owner' })).toBe(false);
        expect(canAccessSubscriberRoutes({ isPlatformOwner: true })).toBe(false);
      });
    });

    describe('canAccessManagementRoutes', () => {
      it('should allow management users', () => {
        expect(canAccessManagementRoutes({ role: 'platform_admin' })).toBe(true);
        expect(canAccessManagementRoutes({ role: 'owner' })).toBe(true);
        expect(canAccessManagementRoutes({ isPlatformOwner: true })).toBe(true);
      });

      it('should deny subscriber users', () => {
        expect(canAccessManagementRoutes({ role: 'customer_admin' })).toBe(false);
        expect(canAccessManagementRoutes({ role: 'customer_compliance' })).toBe(false);
        expect(canAccessManagementRoutes({ role: 'customer_support' })).toBe(false);
        expect(canAccessManagementRoutes({ role: 'executive' })).toBe(false);
      });
    });
  });

  describe('Role Display Names', () => {
    it('should return proper display names for all roles', () => {
      expect(getRoleDisplayName('customer_admin')).toBe('Customer Administrator');
      expect(getRoleDisplayName('customer_compliance')).toBe('Compliance Officer');
      expect(getRoleDisplayName('customer_support')).toBe('Support Staff');
      expect(getRoleDisplayName('executive')).toBe('Executive');
      expect(getRoleDisplayName('platform_admin')).toBe('Platform Administrator');
      expect(getRoleDisplayName('owner')).toBe('Platform Owner');
    });

    it('should return the role name for unknown roles', () => {
      expect(getRoleDisplayName('unknown_role')).toBe('unknown_role');
    });
  });

  describe('Role Hierarchy', () => {
    it('should assign correct hierarchy levels', () => {
      expect(getRoleHierarchy('customer_support')).toBe(1);
      expect(getRoleHierarchy('customer_compliance')).toBe(2);
      expect(getRoleHierarchy('customer_admin')).toBe(3);
      expect(getRoleHierarchy('executive')).toBe(4);
      expect(getRoleHierarchy('platform_admin')).toBe(5);
      expect(getRoleHierarchy('owner')).toBe(6);
    });

    it('should return 0 for unknown roles', () => {
      expect(getRoleHierarchy('unknown_role')).toBe(0);
    });
  });

  describe('Role Access Control', () => {
    it('should allow higher roles to access lower roles', () => {
      expect(canAccessRole('owner', 'platform_admin')).toBe(true);
      expect(canAccessRole('platform_admin', 'customer_admin')).toBe(true);
      expect(canAccessRole('customer_admin', 'customer_support')).toBe(true);
    });

    it('should allow same role to access itself', () => {
      expect(canAccessRole('customer_admin', 'customer_admin')).toBe(true);
      expect(canAccessRole('platform_admin', 'platform_admin')).toBe(true);
    });

    it('should deny lower roles from accessing higher roles', () => {
      expect(canAccessRole('customer_support', 'customer_admin')).toBe(false);
      expect(canAccessRole('customer_admin', 'platform_admin')).toBe(false);
      expect(canAccessRole('platform_admin', 'owner')).toBe(false);
    });
  });
});
