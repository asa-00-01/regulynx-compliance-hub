
# Application Development Instructions

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Overview](#architecture-overview)
4. [Development Setup](#development-setup)
5. [Project Structure](#project-structure)
6. [Authentication & Authorization](#authentication--authorization)
7. [State Management](#state-management)
8. [Routing & Navigation](#routing--navigation)
9. [UI Components & Design System](#ui-components--design-system)
10. [Data Management](#data-management)
11. [Compliance Features](#compliance-features)
12. [Platform vs Customer Areas](#platform-vs-customer-areas)
13. [Services & APIs](#services--apis)
14. [Hooks & Utilities](#hooks--utilities)
15. [Testing Strategy](#testing-strategy)
16. [Deployment](#deployment)
17. [Security Considerations](#security-considerations)
18. [Performance Optimization](#performance-optimization)
19. [Development Guidelines](#development-guidelines)
20. [Troubleshooting](#troubleshooting)

## Project Overview

This is a comprehensive Compliance Management System built for financial institutions to handle KYC (Know Your Customer), AML (Anti-Money Laundering), and regulatory compliance requirements. The application serves two distinct user bases:

- **Customer Organizations**: Banks and financial institutions managing their compliance processes
- **Platform Management**: Internal platform administrators and support staff

### Key Features
- User identity verification and KYC management
- AML transaction monitoring and risk assessment
- Case management for compliance investigations
- Document management and verification
- Suspicious Activity Report (SAR) generation
- Risk scoring and analytics
- Audit logging and compliance reporting
- Multi-tenant architecture with role-based access control

## Technology Stack

### Frontend
- **React 18** - UI library with hooks and functional components
- **TypeScript** - Type safety and enhanced developer experience
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM v6** - Client-side routing
- **TanStack Query v5** - Server state management and caching
- **React Hook Form** - Form management with validation
- **Zod** - Runtime type validation
- **Lucide React** - Icon library
- **Recharts** - Data visualization and charts

### UI Components
- **Radix UI** - Accessible primitive components
- **shadcn/ui** - Pre-built component library
- **Sonner** - Toast notifications
- **Vaul** - Drawer component

### Backend Integration
- **Supabase** - Backend-as-a-Service for authentication, database, and real-time features
- **PostgreSQL** - Primary database (via Supabase)

### Development Tools
- **Vitest** - Testing framework
- **Testing Library** - Component testing utilities
- **ESLint** - Code linting
- **TypeScript** - Static type checking

## Architecture Overview

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │    │    Supabase     │    │  External APIs  │
│                 │    │                 │    │                 │
│  React + TS     │◄──►│  Auth + DB      │◄──►│  Compliance     │
│  TailwindCSS    │    │  Real-time      │    │  Services       │
│  React Query    │    │  Storage        │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Application Layers

1. **Presentation Layer** (`src/components`, `src/pages`)
   - React components and pages
   - UI state management
   - User interactions

2. **Business Logic Layer** (`src/hooks`, `src/services`)
   - Custom hooks for business logic
   - Service classes for external integrations
   - Data transformation and validation

3. **Data Layer** (`src/context`, `src/types`)
   - Global state management
   - Type definitions
   - API integrations

4. **Infrastructure Layer** (`src/config`, `src/utils`)
   - Configuration management
   - Utility functions
   - Environment setup

## Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Git for version control

### Environment Variables
Create a `.env.local` file with the following variables:

```env
# Application Configuration
VITE_ENVIRONMENT=development
VITE_APP_NAME=Compliance Management System
VITE_APP_DOMAIN=localhost:5173
VITE_SUPPORT_EMAIL=support@example.com

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Development Settings
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
VITE_ENABLE_MOCK_DATA=true

# Features
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_REPORTING=false
VITE_ENABLE_PERFORMANCE_MONITORING=false
```

### Installation & Running
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Shared components
│   ├── compliance/      # Compliance-specific components
│   ├── platform/        # Platform management components
│   ├── layouts/         # Layout components
│   └── ui/              # shadcn/ui components
├── pages/               # Route components
├── hooks/               # Custom React hooks
├── context/             # React Context providers
├── services/            # External service integrations
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── config/              # Configuration files
├── mocks/               # Mock data for development
├── i18n/                # Internationalization
└── styles/              # Global styles
```

### Component Organization

#### Components Directory Structure
```
components/
├── common/              # Shared across the app
│   ├── Header/
│   ├── Sidebar/
│   ├── ToastProvider/
│   └── ThemeProvider/
├── compliance/          # Compliance-specific
│   ├── hooks/           # Component-specific hooks
│   ├── types/           # Component-specific types
│   └── [Component]/
├── platform/            # Platform management
├── layouts/             # Layout containers
│   ├── CustomerLayout/
│   └── ManagementLayout/
└── ui/                  # shadcn/ui primitives
```

## Authentication & Authorization

### Authentication Flow
The application uses Supabase Auth with custom user management:

1. **Login Process**
   - Email/password authentication via Supabase
   - Custom user profile creation with roles
   - Session management with automatic refresh

2. **User Roles**
   - `platform_admin` - Full platform access
   - `customer_admin` - Organization admin access
   - `customer_compliance` - Compliance officer access
   - `customer_support` - Basic user access

3. **Authorization Hooks**
   ```typescript
   // Check user permissions
   const { hasPermission } = useRoleBasedAccess();
   const canApprove = hasPermission('document:approve');

   // Check feature access
   const { canManageUsers } = useFeatureAccess();
   ```

### Protected Routes
```typescript
// Route protection with role requirements
<ProtectedRoute requiredRoles={['admin', 'complianceOfficer']}>
  <KYCVerification />
</ProtectedRoute>
```

### Context Providers
```typescript
// Authentication context structure
interface AuthContextType {
  user: ExtendedUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<ExtendedUser | null>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  canAccess: (requiredRoles: UserRole[]) => boolean;
}
```

## State Management

### Global State Architecture
The application uses a combination of React Context and TanStack Query for state management:

1. **Authentication State** (`AuthContext`)
   - User session and profile information
   - Authentication status and loading states

2. **Compliance State** (`ComplianceContext`)
   - User data and case management
   - Global filters and selections
   - Centralized compliance operations

3. **Subscription State** (`SubscriptionContext`)
   - Payment and billing information
   - Feature access based on subscription

### State Management Patterns

#### Context + Reducer Pattern
```typescript
// Example: ComplianceProvider
const [state, dispatch] = useReducer(complianceReducer, initialState);

// Actions
dispatch({ type: 'SET_USERS', payload: users });
dispatch({ type: 'SET_SELECTED_USER', payload: userId });
```

#### Server State with TanStack Query
```typescript
// Example: Data fetching with caching
const { data, isLoading, error } = useQuery({
  queryKey: ['transactions', filters],
  queryFn: () => AMLService.getAMLTransactions(filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

## Routing & Navigation

### Route Structure
The application uses React Router v6 with a dual-area architecture:

#### Customer Routes (`/`)
- Dashboard, compliance pages, user management
- Uses `CustomerLayout` with sidebar and header

#### Platform Routes (`/platform/`)
- Platform administration and management
- Uses `ManagementLayout` with `PlatformLayout`

### Route Configuration
```typescript
// AppRoutes.tsx structure
<Routes>
  {/* Customer Area */}
  <Route path="/dashboard" element={
    <ProtectedRoute>
      <CustomerLayout>
        <Dashboard />
      </CustomerLayout>
    </ProtectedRoute>
  } />
  
  {/* Platform Area */}
  <Route path="/platform/*" element={
    <ProtectedRoute>
      <ManagementLayout>
        <PlatformApp />
      </ManagementLayout>
    </ProtectedRoute>
  } />
</Routes>
```

### Navigation Components
- **Sidebar** - Customer area navigation
- **Header** - Customer area top navigation
- **PlatformLayout** - Platform area navigation (includes own header)

## UI Components & Design System

### Design Tokens
The application uses a consistent design system with CSS custom properties:

```css
/* CSS Variables in index.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96%;
  /* ... more tokens */
}
```

### Component Guidelines

#### 1. Use Semantic Tokens
```typescript
// ✅ Good - Using semantic classes
<div className="bg-background text-foreground border-border">

// ❌ Bad - Using direct colors
<div className="bg-white text-black border-gray-200">
```

#### 2. Component Composition
```typescript
// Compose components using shadcn/ui primitives
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
```

#### 3. Responsive Design
```typescript
// Use Tailwind responsive prefixes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

### Key UI Components

1. **Data Tables** - For displaying compliance data
2. **Forms** - Using React Hook Form with Zod validation
3. **Dialogs & Modals** - For user interactions
4. **Charts** - Using Recharts for analytics
5. **Toast Notifications** - For user feedback

## Data Management

### Mock Data System
The application includes a comprehensive mock data system for development:

```typescript
// Centralized mock data
export const unifiedMockData: UnifiedUserData[] = [
  // Generated user data with relationships
];

// Service-specific mock data
export const mockTransactions: AMLTransaction[] = [
  // Transaction data
];
```

### Data Fetching Patterns

#### Service Classes
```typescript
// Example: AMLService
export class AMLService extends BaseMockService {
  static async getAMLTransactions(filters?: any): Promise<AMLTransaction[]> {
    // Mock data or real API calls based on environment
  }
}
```

#### Custom Hooks for Data
```typescript
// Example: useAMLTransactions
export function useAMLTransactions(filters: AMLFilters) {
  return useQuery({
    queryKey: ['aml-transactions', filters],
    queryFn: () => AMLService.getAMLTransactions(filters),
  });
}
```

### Type Safety
All data structures are strongly typed:

```typescript
// User data type
interface UnifiedUserData {
  id: string;
  fullName: string;
  email: string;
  riskScore: number;
  kycStatus: 'verified' | 'pending' | 'rejected' | 'information_requested';
  documents: Document[];
  transactions: AMLTransaction[];
  complianceCases: ComplianceCaseDetails[];
}
```

## Compliance Features

### KYC Management
- Customer identity verification workflows
- Document upload and verification
- Status tracking and approval processes
- Integration with external verification services

### AML Monitoring
- Real-time transaction monitoring
- Risk scoring algorithms
- Alert generation and case creation
- Suspicious activity detection

### Case Management
- Compliance investigation workflows
- Case assignment and tracking
- Document attachment and evidence management
- Report generation and regulatory submission

### Risk Assessment
- Multi-factor risk scoring
- Country and transaction risk analysis
- PEP (Politically Exposed Person) screening
- Sanctions list checking

### Reporting & Analytics
- Compliance dashboard with key metrics
- Risk distribution analysis
- Audit trail and activity logging
- Regulatory report generation

## Platform vs Customer Areas

### Customer Area Features
- **Dashboard** - Compliance overview and metrics
- **User Management** - KYC and customer data
- **Compliance Cases** - Investigation workflows
- **Documents** - Document management and verification
- **Transactions** - AML monitoring and analysis
- **Risk Analysis** - Risk assessment tools
- **SAR Center** - Suspicious activity reporting
- **Analytics** - Compliance reporting and insights

### Platform Area Features
- **Platform Dashboard** - System-wide metrics
- **Customer Management** - Multi-tenant administration
- **User Administration** - Platform user management
- **System Settings** - Platform configuration
- **Billing & Subscriptions** - Customer billing management
- **Support Tools** - Customer support utilities

### Access Control
```typescript
// Platform access check
const { isPlatformAdmin, hasPlatformPermission } = usePlatformRoleAccess();

// Customer access check  
const { hasPermission } = useRoleBasedAccess();
```

## Services & APIs

### Service Architecture
Services are organized by domain and follow a consistent pattern:

```typescript
// Base service class
export abstract class BaseMockService {
  static shouldUseMockData(): boolean {
    return config.features.enableMockData;
  }
}

// Domain-specific service
export class AMLService extends BaseMockService {
  static async getTransactions(): Promise<AMLTransaction[]> {
    // Implementation
  }
}
```

### Available Services
1. **AMLService** - Anti-money laundering operations
2. **GoAMLService** - XML generation for regulatory reporting
3. **AnalyticsService** - User behavior and compliance analytics
4. **AuditLogger** - Compliance audit logging
5. **NotificationService** - User notifications and alerts

### Error Handling
```typescript
// Service error handling pattern
try {
  const data = await AMLService.getTransactions(filters);
  return data;
} catch (error) {
  console.error('Failed to fetch transactions:', error);
  throw new Error('Unable to load transaction data');
}
```

## Hooks & Utilities

### Custom Hooks Categories

#### 1. Data Hooks
- `useAMLTransactions` - Transaction data fetching
- `useComplianceUsers` - User data management
- `useAuditLogs` - Audit trail data
- `useRiskScoring` - Risk assessment calculations

#### 2. Business Logic Hooks
- `useCompliance` - Compliance context operations
- `useAuth` - Authentication and user management
- `usePermissions` - Role-based access control
- `useFeatureAccess` - Feature flag management

#### 3. UI Interaction Hooks
- `useKYCActions` - KYC workflow actions
- `useComplianceActions` - Case management actions
- `useDataExport` - Data export functionality
- `useNotificationSettings` - User preference management

#### 4. Utility Hooks
- `useAnalytics` - Event tracking and analytics
- `useAuditLogging` - Compliance audit logging
- `useToast` - Notification management

### Hook Development Patterns

#### 1. Data Fetching Hook
```typescript
export function useDataHook(params: Params) {
  return useQuery({
    queryKey: ['data', params],
    queryFn: () => Service.getData(params),
    enabled: !!params.id,
  });
}
```

#### 2. Action Hook
```typescript
export function useActionHook() {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleAction = useCallback(async (data: ActionData) => {
    try {
      await Service.performAction(data);
      toast({ title: 'Success' });
      navigate('/success-page');
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  }, [toast, navigate]);
  
  return { handleAction };
}
```

## Testing Strategy

### Testing Approach
1. **Unit Tests** - Individual component and hook testing
2. **Integration Tests** - Component interaction testing
3. **E2E Tests** - Full user workflow testing

### Testing Tools
- **Vitest** - Test runner and assertions
- **Testing Library** - Component testing utilities
- **Mock Service Worker** - API mocking for tests

### Test Organization
```
src/
├── components/
│   └── __tests__/
├── hooks/
│   └── __tests__/
├── services/
│   └── __tests__/
└── utils/
    └── __tests__/
```

### Testing Guidelines
1. Test behavior, not implementation
2. Use semantic queries from Testing Library
3. Mock external dependencies appropriately
4. Test error states and edge cases
5. Maintain test isolation and independence

## Deployment

### Build Process
```bash
# Production build
npm run build

# Preview build locally
npm run preview
```

### Environment Configuration
Different configurations for different environments:

#### Development
- Mock data enabled
- Debug mode active
- Console logging enabled
- Error overlay visible

#### Staging
- Limited mock data
- Error reporting enabled
- Performance monitoring active
- Reduced logging

#### Production
- No mock data
- All monitoring enabled
- Error reporting active
- Minimal logging
- Security headers enabled

### Deployment Platforms
1. **Lovable** - Direct deployment from editor
2. **Vercel** - Frontend hosting with edge functions
3. **Netlify** - Static site hosting with serverless functions
4. **Docker** - Containerized deployment

### Docker Configuration
```dockerfile
# Multi-stage build for optimization
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
```

## Security Considerations

### Frontend Security
1. **Input Validation** - Zod schemas for all user inputs
2. **XSS Prevention** - DOMPurify for HTML sanitization
3. **CSP Headers** - Content Security Policy implementation
4. **HTTPS Enforcement** - Secure communication only

### Authentication Security
1. **Session Management** - Secure token handling
2. **Role Validation** - Server-side permission checks
3. **Route Protection** - Client-side route guards
4. **Password Security** - Strong password requirements

### Data Security
1. **Sensitive Data Handling** - No sensitive data in localStorage
2. **API Security** - Authenticated requests only
3. **Audit Logging** - Complete activity tracking
4. **Data Encryption** - Encrypted data at rest and in transit

## Performance Optimization

### Code Splitting
```typescript
// Lazy loading of route components
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Compliance = lazy(() => import('@/pages/Compliance'));
```

### Caching Strategy
1. **TanStack Query** - Server state caching
2. **Browser Cache** - Static asset caching
3. **CDN** - Global content delivery
4. **Service Worker** - Offline functionality

### Bundle Optimization
1. **Tree Shaking** - Remove unused code
2. **Code Splitting** - Load code on demand
3. **Asset Optimization** - Compress images and fonts
4. **Chunk Optimization** - Optimize bundle sizes

### Performance Monitoring
```typescript
// Performance tracking
const { trackAction } = useAnalytics();

// Performance metrics
useEffect(() => {
  const observer = new PerformanceObserver((list) => {
    // Track Core Web Vitals
  });
}, []);
```

## Development Guidelines

### Code Style
1. **TypeScript First** - Use TypeScript for all new code
2. **Functional Components** - Use React hooks over class components
3. **Semantic HTML** - Use appropriate HTML elements
4. **Accessibility** - Follow WCAG guidelines

### Component Guidelines
1. **Single Responsibility** - One purpose per component
2. **Composition over Inheritance** - Compose smaller components
3. **Props Interface** - Define clear prop types
4. **Error Boundaries** - Handle component errors gracefully

### Hook Guidelines
1. **Custom Hooks** - Extract reusable logic into hooks
2. **Dependency Arrays** - Manage hook dependencies carefully
3. **Cleanup** - Clean up effects and subscriptions
4. **Memoization** - Use useMemo and useCallback appropriately

### File Naming Conventions
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useAuth.ts`)
- **Types**: PascalCase (e.g., `UserTypes.ts`)
- **Utils**: camelCase (e.g., `formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)

### Import/Export Patterns
```typescript
// Named exports for utilities and hooks
export const formatCurrency = (amount: number) => { };
export const useCustomHook = () => { };

// Default exports for components
export default function Component() { }

// Re-exports for cleaner imports
export { ComponentA } from './ComponentA';
export { ComponentB } from './ComponentB';
```

## Troubleshooting

### Common Issues

#### 1. Authentication Issues
- **Problem**: User not persisting after page refresh
- **Solution**: Check Supabase session management and auth context
- **Debug**: Enable auth logging in development

#### 2. Infinite Re-renders
- **Problem**: Components re-rendering constantly
- **Solution**: Check useEffect dependencies and memoization
- **Debug**: Use React DevTools Profiler

#### 3. Route Access Issues
- **Problem**: Users accessing unauthorized routes
- **Solution**: Verify ProtectedRoute configuration and role checks
- **Debug**: Check user roles and permissions in auth context

#### 4. Data Loading Issues
- **Problem**: Data not loading or stale data showing
- **Solution**: Check TanStack Query configuration and cache settings
- **Debug**: Use React Query DevTools

#### 5. Mock Data Issues
- **Problem**: Mock data not loading in development
- **Solution**: Verify VITE_ENABLE_MOCK_DATA environment variable
- **Debug**: Check service shouldUseMockData() method

### Debug Tools
1. **React DevTools** - Component inspection
2. **React Query DevTools** - Cache inspection
3. **Network Tab** - API request monitoring
4. **Console Logging** - Application logging
5. **Lighthouse** - Performance auditing

### Performance Issues
1. **Slow Page Loads** - Check bundle size and lazy loading
2. **Memory Leaks** - Review useEffect cleanup
3. **Excessive Re-renders** - Use React Profiler
4. **Large Bundles** - Analyze with bundle analyzer

### Environment-Specific Issues
1. **Development** - Check mock data configuration
2. **Staging** - Verify environment variables
3. **Production** - Check error reporting and monitoring

---

## Conclusion

This application is a comprehensive compliance management system built with modern React practices and a focus on security, performance, and maintainability. The architecture supports both customer and platform areas with appropriate separation of concerns and role-based access control.

For additional support or questions, refer to the specific component documentation or reach out to the development team.

**Last Updated**: December 2024  
**Version**: 1.0.0
