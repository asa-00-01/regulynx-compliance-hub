import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRoutes from '@/components/app/AppRoutes';
import { AuthProvider } from '@/context/AuthContext';

// Mock the auth context to simulate different user types
const mockAuthContext = {
  user: null,
  loading: false,
  authLoaded: true,
  isAuthenticated: false,
  login: vi.fn(),
  logout: vi.fn(),
  signup: vi.fn(),
  canAccess: vi.fn(),
  session: null,
  updateUserProfile: vi.fn(),
  refreshUserProfile: vi.fn(),
};

// Create a test wrapper with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Mock user data for different roles
const createMockUser = (role: string, additionalProps = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  role,
  customer_roles: [],
  platform_roles: [],
  isPlatformOwner: false,
  ...additionalProps,
});

describe('Layout Separation E2E Tests', () => {
  describe('Customer (Subscriber) Users', () => {
    const subscriberRoles = ['customer_admin', 'customer_compliance', 'customer_support', 'executive'];

    subscriberRoles.forEach(role => {
      describe(`${role} user`, () => {
        it(`should see customer layout elements and NOT see platform layout elements`, () => {
          const mockUser = createMockUser(role);
          
          // Mock the auth context to return the subscriber user
          vi.mocked(mockAuthContext.user).mockReturnValue(mockUser);
          vi.mocked(mockAuthContext.isAuthenticated).mockReturnValue(true);

          render(
            <TestWrapper>
              <AppRoutes />
            </TestWrapper>
          );

          // Should see customer layout elements
          expect(screen.getByTestId('customer-layout')).toBeInTheDocument();
          expect(screen.getByTestId('customer-main')).toBeInTheDocument();
          expect(screen.getByTestId('customer-header')).toBeInTheDocument();

          // Should NOT see platform layout elements
          expect(screen.queryByTestId('platform-layout')).not.toBeInTheDocument();
          expect(screen.queryByTestId('platform-main')).not.toBeInTheDocument();
          expect(screen.queryByTestId('platform-header')).not.toBeInTheDocument();
        });

        it(`should be redirected to customer dashboard when accessing root`, () => {
          const mockUser = createMockUser(role);
          
          vi.mocked(mockAuthContext.user).mockReturnValue(mockUser);
          vi.mocked(mockAuthContext.isAuthenticated).mockReturnValue(true);

          render(
            <TestWrapper>
              <AppRoutes />
            </TestWrapper>
          );

          // Should be on customer dashboard
          expect(window.location.pathname).toBe('/dashboard');
        });

        it(`should be denied access to platform routes`, () => {
          const mockUser = createMockUser(role);
          
          vi.mocked(mockAuthContext.user).mockReturnValue(mockUser);
          vi.mocked(mockAuthContext.isAuthenticated).mockReturnValue(true);

          // Navigate to platform route
          window.history.pushState({}, '', '/platform/dashboard');

          render(
            <TestWrapper>
              <AppRoutes />
            </TestWrapper>
          );

          // Should be redirected to unauthorized page
          expect(window.location.pathname).toBe('/unauthorized');
        });
      });
    });
  });

  describe('Platform Management Users', () => {
    const managementRoles = ['platform_admin', 'owner'];

    managementRoles.forEach(role => {
      describe(`${role} user`, () => {
        it(`should see platform layout elements and NOT see customer layout elements`, () => {
          const mockUser = createMockUser(role, {
            platform_roles: [role],
            isPlatformOwner: role === 'owner',
          });
          
          vi.mocked(mockAuthContext.user).mockReturnValue(mockUser);
          vi.mocked(mockAuthContext.isAuthenticated).mockReturnValue(true);

          render(
            <TestWrapper>
              <AppRoutes />
            </TestWrapper>
          );

          // Should see platform layout elements
          expect(screen.getByTestId('platform-layout')).toBeInTheDocument();
          expect(screen.getByTestId('platform-main')).toBeInTheDocument();
          expect(screen.getByTestId('platform-header')).toBeInTheDocument();

          // Should NOT see customer layout elements
          expect(screen.queryByTestId('customer-layout')).not.toBeInTheDocument();
          expect(screen.queryByTestId('customer-main')).not.toBeInTheDocument();
          expect(screen.queryByTestId('customer-header')).not.toBeInTheDocument();
        });

        it(`should be redirected to platform dashboard when accessing root`, () => {
          const mockUser = createMockUser(role, {
            platform_roles: [role],
            isPlatformOwner: role === 'owner',
          });
          
          vi.mocked(mockAuthContext.user).mockReturnValue(mockUser);
          vi.mocked(mockAuthContext.isAuthenticated).mockReturnValue(true);

          render(
            <TestWrapper>
              <AppRoutes />
            </TestWrapper>
          );

          // Should be on platform dashboard
          expect(window.location.pathname).toBe('/platform/dashboard');
        });

        it(`should be denied access to customer routes`, () => {
          const mockUser = createMockUser(role, {
            platform_roles: [role],
            isPlatformOwner: role === 'owner',
          });
          
          vi.mocked(mockAuthContext.user).mockReturnValue(mockUser);
          vi.mocked(mockAuthContext.isAuthenticated).mockReturnValue(true);

          // Navigate to customer route
          window.history.pushState({}, '', '/dashboard');

          render(
            <TestWrapper>
              <AppRoutes />
            </TestWrapper>
          );

          // Should be redirected to unauthorized page
          expect(window.location.pathname).toBe('/unauthorized');
        });
      });
    });
  });

  describe('Platform Owner Special Case', () => {
    it('should have platform access even with isPlatformOwner flag', () => {
      const mockUser = createMockUser('customer_admin', {
        isPlatformOwner: true,
      });
      
      vi.mocked(mockAuthContext.user).mockReturnValue(mockUser);
      vi.mocked(mockAuthContext.isAuthenticated).mockReturnValue(true);

      render(
        <TestWrapper>
          <AppRoutes />
        </TestWrapper>
      );

      // Should see platform layout elements
      expect(screen.getByTestId('platform-layout')).toBeInTheDocument();
      expect(screen.getByTestId('platform-main')).toBeInTheDocument();
      expect(screen.getByTestId('platform-header')).toBeInTheDocument();

      // Should NOT see customer layout elements
      expect(screen.queryByTestId('customer-layout')).not.toBeInTheDocument();
      expect(screen.queryByTestId('customer-main')).not.toBeInTheDocument();
      expect(screen.queryByTestId('customer-header')).not.toBeInTheDocument();
    });
  });

  describe('Unauthenticated Users', () => {
    it('should be redirected to login page', () => {
      vi.mocked(mockAuthContext.user).mockReturnValue(null);
      vi.mocked(mockAuthContext.isAuthenticated).mockReturnValue(false);

      render(
        <TestWrapper>
          <AppRoutes />
        </TestWrapper>
      );

      // Should be redirected to login
      expect(window.location.pathname).toBe('/login');
    });

    it('should not see any layout elements', () => {
      vi.mocked(mockAuthContext.user).mockReturnValue(null);
      vi.mocked(mockAuthContext.isAuthenticated).mockReturnValue(false);

      render(
        <TestWrapper>
          <AppRoutes />
        </TestWrapper>
      );

      // Should not see any layout elements
      expect(screen.queryByTestId('customer-layout')).not.toBeInTheDocument();
      expect(screen.queryByTestId('platform-layout')).not.toBeInTheDocument();
    });
  });

  describe('Invalid Role Users', () => {
    it('should be denied access to both areas', () => {
      const mockUser = createMockUser('invalid_role');
      
      vi.mocked(mockAuthContext.user).mockReturnValue(mockUser);
      vi.mocked(mockAuthContext.isAuthenticated).mockReturnValue(true);

      render(
        <TestWrapper>
          <AppRoutes />
        </TestWrapper>
      );

      // Should not see any layout elements
      expect(screen.queryByTestId('customer-layout')).not.toBeInTheDocument();
      expect(screen.queryByTestId('platform-layout')).not.toBeInTheDocument();
    });
  });
});
