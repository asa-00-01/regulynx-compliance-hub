
import { PlatformRole, CustomerRole, Customer } from '@/types/platform-roles';

export class MockPlatformRoleService {
  // Mock customers for now since the table structure doesn't match
  private static mockCustomers: Customer[] = [
    {
      id: 'customer-1',
      name: 'Acme Corporation',
      domain: 'acme.com',
      settings: {},
      subscription_tier: 'enterprise',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'customer-2', 
      name: 'Beta Industries',
      domain: 'beta.com',
      settings: {},
      subscription_tier: 'professional',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];

  static async listCustomers(): Promise<Customer[]> {
    return Promise.resolve(this.mockCustomers);
  }

  static async getCustomers(): Promise<Customer[]> {
    return this.listCustomers();
  }

  static async getCustomer(customerId: string): Promise<Customer | null> {
    const customer = this.mockCustomers.find(c => c.id === customerId);
    return Promise.resolve(customer || null);
  }

  static async getCustomerUsers(customerId: string): Promise<any[]> {
    // Return mock users for the customer
    return Promise.resolve([]);
  }

  static async createCustomer(customerData: Partial<Customer>): Promise<Customer> {
    const newCustomer: Customer = {
      id: crypto.randomUUID(),
      name: customerData.name || 'New Customer',
      domain: customerData.domain || null,
      settings: customerData.settings || {},
      subscription_tier: customerData.subscription_tier || 'basic',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.mockCustomers.push(newCustomer);
    return Promise.resolve(newCustomer);
  }

  static async updateCustomer(customerId: string, updates: Partial<Customer>): Promise<Customer> {
    const customerIndex = this.mockCustomers.findIndex(c => c.id === customerId);
    if (customerIndex === -1) {
      throw new Error('Customer not found');
    }
    
    this.mockCustomers[customerIndex] = {
      ...this.mockCustomers[customerIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    return Promise.resolve(this.mockCustomers[customerIndex]);
  }

  // Mock implementations for role management
  static async assignPlatformRole(userId: string, role: PlatformRole): Promise<void> {
    console.log(`Mock: Assigned platform role ${role} to user ${userId}`);
    return Promise.resolve();
  }

  static async removePlatformRole(userId: string, role: PlatformRole): Promise<void> {
    console.log(`Mock: Removed platform role ${role} from user ${userId}`);
    return Promise.resolve();
  }

  static async getUserPlatformRoles(userId: string): Promise<PlatformRole[]> {
    // Return mock roles
    return Promise.resolve([]);
  }

  static async assignCustomerRole(userId: string, customerId: string, role: CustomerRole): Promise<void> {
    console.log(`Mock: Assigned customer role ${role} to user ${userId} for customer ${customerId}`);
    return Promise.resolve();
  }

  static async removeCustomerRole(userId: string, customerId: string, role: CustomerRole): Promise<void> {
    console.log(`Mock: Removed customer role ${role} from user ${userId} for customer ${customerId}`);
    return Promise.resolve();
  }

  static async getUserCustomerRoles(userId: string, customerId?: string): Promise<CustomerRole[]> {
    // Return mock roles
    return Promise.resolve([]);
  }
}
