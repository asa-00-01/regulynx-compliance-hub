
import { useState } from 'react';
import { config } from '@/config/environment';

interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
}

export function useAuth() {
  // Only provide a mock user when mock data feature is enabled
  const [user] = useState<User | null>(config.features.useMockData ? {
    id: '1',
    email: 'admin@example.com',
    role: 'customer_admin',
    name: 'Admin User'
  } : null);

  return {
    user,
    isAuthenticated: !!user,
    loading: false
  };
}
