
import { MockPlatformRoleService } from './mockPlatformRoleService';

// Re-export the mock service methods for now
export class PlatformRoleService {
  static async listCustomers() {
    return MockPlatformRoleService.listCustomers();
  }

  static async getCustomers() {
    return MockPlatformRoleService.getCustomers();
  }

  static async getCustomer(customerId: string) {
    return MockPlatformRoleService.getCustomer(customerId);
  }

  static async getCustomerUsers(customerId: string) {
    return MockPlatformRoleService.getCustomerUsers(customerId);
  }

  static async createCustomer(customerData: any) {
    return MockPlatformRoleService.createCustomer(customerData);
  }

  static async updateCustomer(customerId: string, updates: any) {
    return MockPlatformRoleService.updateCustomer(customerId, updates);
  }

  static async assignPlatformRole(userId: string, role: any) {
    return MockPlatformRoleService.assignPlatformRole(userId, role);
  }

  static async removePlatformRole(userId: string, role: any) {
    return MockPlatformRoleService.removePlatformRole(userId, role);
  }

  static async getUserPlatformRoles(userId: string) {
    return MockPlatformRoleService.getUserPlatformRoles(userId);
  }

  static async assignCustomerRole(userId: string, customerId: string, role: any) {
    return MockPlatformRoleService.assignCustomerRole(userId, customerId, role);
  }

  static async removeCustomerRole(userId: string, customerId: string, role: any) {
    return MockPlatformRoleService.removeCustomerRole(userId, customerId, role);
  }

  static async getUserCustomerRoles(userId: string, customerId?: string) {
    return MockPlatformRoleService.getUserCustomerRoles(userId, customerId);
  }
}
