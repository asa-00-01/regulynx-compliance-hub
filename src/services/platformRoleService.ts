
import { SupabasePlatformRoleService } from './supabasePlatformRoleService';

// Use the real Supabase service for platform role management
export class PlatformRoleService {
  static async listCustomers() {
    return SupabasePlatformRoleService.getCustomers();
  }

  static async getCustomers() {
    return SupabasePlatformRoleService.getCustomers();
  }

  static async getCustomer(customerId: string) {
    return SupabasePlatformRoleService.getCustomer(customerId);
  }

  static async getCustomerUsers(customerId: string) {
    return SupabasePlatformRoleService.getCustomerUsers(customerId);
  }

  static async createCustomer(customerData: any) {
    return SupabasePlatformRoleService.createCustomer(customerData);
  }

  static async updateCustomer(customerId: string, updates: any) {
    return SupabasePlatformRoleService.updateCustomer(customerId, updates);
  }

  static async assignPlatformRole(userId: string, role: any) {
    return SupabasePlatformRoleService.assignPlatformRole(userId, role);
  }

  static async removePlatformRole(userId: string, role: any) {
    return SupabasePlatformRoleService.removePlatformRole(userId, role);
  }

  static async getUserPlatformRoles(userId: string) {
    return SupabasePlatformRoleService.getUserPlatformRoles(userId);
  }

  static async assignCustomerRole(userId: string, customerId: string, role: any) {
    return SupabasePlatformRoleService.assignCustomerRole(userId, customerId, role);
  }

  static async removeCustomerRole(userId: string, customerId: string, role: any) {
    return SupabasePlatformRoleService.removeCustomerRole(userId, customerId, role);
  }

  static async getUserCustomerRoles(userId: string, customerId?: string) {
    return SupabasePlatformRoleService.getUserCustomerRoles(userId, customerId);
  }
}
