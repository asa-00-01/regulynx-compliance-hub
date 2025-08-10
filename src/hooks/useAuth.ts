
import { useState } from 'react';

interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
}

export function useAuth() {
  // Mock user for now
  const [user] = useState<User | null>({
    id: '1',
    email: 'admin@example.com',
    role: 'customer_admin',
    name: 'Admin User'
  });

  return {
    user,
    isAuthenticated: !!user,
    loading: false
  };
}
