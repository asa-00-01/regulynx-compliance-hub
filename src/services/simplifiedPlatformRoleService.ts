
import { SupabasePlatformRoleService } from './supabasePlatformRoleService';
import { PlatformRole, CustomerRole, ExtendedUserProfile } from '@/types/platform-roles';

export class SimplifiedPlatformRoleService {
  // Use real Supabase implementations
  static async assignPlatformRole(userId: string, role: PlatformRole): Promise<void> {
    return SupabasePlatformRoleService.assignPlatformRole(userId, role);
  }

  static async removePlatformRole(userId: string, role: PlatformRole): Promise<void> {
    return SupabasePlatformRoleService.removePlatformRole(userId, role);
  }

  static async assignCustomerRole(userId: string, customerId: string, role: CustomerRole): Promise<void> {
    return SupabasePlatformRoleService.assignCustomerRole(userId, customerId, role);
  }

  static async removeCustomerRole(userId: string, customerId: string, role: CustomerRole): Promise<void> {
    return SupabasePlatformRoleService.removeCustomerRole(userId, customerId, role);
  }

  static async getExtendedUserProfile(userId: string): Promise<ExtendedUserProfile | null> {
    return SupabasePlatformRoleService.getExtendedUserProfile(userId);
  }
}
