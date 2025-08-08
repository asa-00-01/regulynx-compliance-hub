
import { MockPlatformRoleService } from './mockPlatformRoleService';
import { PlatformRole, CustomerRole, ExtendedUserProfile } from '@/types/platform-roles';

export class SimplifiedPlatformRoleService {
  // Use mock implementations for now
  static async assignPlatformRole(userId: string, role: PlatformRole): Promise<void> {
    return MockPlatformRoleService.assignPlatformRole(userId, role);
  }

  static async removePlatformRole(userId: string, role: PlatformRole): Promise<void> {
    return MockPlatformRoleService.removePlatformRole(userId, role);
  }

  static async assignCustomerRole(userId: string, customerId: string, role: CustomerRole): Promise<void> {
    return MockPlatformRoleService.assignCustomerRole(userId, customerId, role);
  }

  static async removeCustomerRole(userId: string, customerId: string, role: CustomerRole): Promise<void> {
    return MockPlatformRoleService.removeCustomerRole(userId, customerId, role);
  }

  // Mock extended user profile
  static async getExtendedUserProfile(userId: string): Promise<ExtendedUserProfile | null> {
    return Promise.resolve({
      id: userId,
      name: 'Mock User',
      email: 'mock@example.com',
      avatar_url: null,
      customer_id: undefined,
      platform_roles: [],
      customer_roles: [],
      customer: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
}
