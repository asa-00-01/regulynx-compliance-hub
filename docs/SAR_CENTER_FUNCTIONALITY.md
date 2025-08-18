# SAR (Suspicious Activity Report) Center - Functionality Documentation

## Overview

The SAR Center is a comprehensive module for managing Suspicious Activity Reports (SARs) in the Regulynx Compliance Hub. It provides a complete workflow for creating, reviewing, approving, and filing SARs with regulatory authorities.

## Core Features

### 1. SAR Management
- **Create SARs**: Build new SARs from scratch or from existing compliance cases
- **Edit SARs**: Modify draft SARs with full form validation
- **View SARs**: Detailed view of SAR information with all related data
- **Delete SARs**: Remove SARs with proper confirmation and audit trails

### 2. Workflow Management
- **Status Transitions**: Complete workflow from draft → submitted → filed/rejected
- **Approval Process**: Multi-step approval workflow with notes and audit trails
- **Status Tracking**: Real-time status updates with visual indicators

### 3. Advanced Filtering & Search
- **Basic Search**: Search by user name, SAR ID, or summary
- **Advanced Filters**: 
  - Date range filtering
  - Status-based filtering
  - Transaction count filtering
  - Document/notes presence filtering
- **Sorting**: Sort by date (newest/oldest first)

### 4. Analytics & Reporting
- **Key Metrics**: Total SARs, processing times, success rates
- **Status Distribution**: Visual breakdown of SAR statuses
- **Monthly Trends**: Historical SAR submission trends
- **User Analytics**: Top users by SAR count
- **Export Capabilities**: CSV and JSON export options

### 5. Bulk Operations
- **Multi-Select**: Select multiple SARs for batch operations
- **Bulk Status Updates**: Update status of multiple SARs simultaneously
- **Bulk Export**: Export selected SARs to CSV
- **Bulk Delete**: Delete multiple SARs with confirmation

## Component Architecture

### Core Components

#### 1. SARCenter (Main Page)
- **Location**: `src/pages/SARCenter.tsx`
- **Purpose**: Main entry point and navigation hub
- **Features**:
  - Dashboard with key metrics
  - Tab-based navigation (All, Draft, Submitted, Filed)
  - Integration with all sub-components
  - Export functionality

#### 2. SARList
- **Location**: `src/components/sar/SARList.tsx`
- **Purpose**: Display list of SARs with actions
- **Features**:
  - Card-based SAR display
  - Action buttons (View, Edit, Delete)
  - Status badges
  - Loading states

#### 3. SARForm
- **Location**: `src/components/sar/SARForm.tsx`
- **Purpose**: Create and edit SARs
- **Features**:
  - User selection with risk indicators
  - Transaction selection
  - Notes management
  - Form validation
  - Draft/Submit actions

#### 4. SARDetailsModal
- **Location**: `src/components/sar/SARDetailsModal.tsx`
- **Purpose**: Detailed view of SAR information
- **Features**:
  - Complete SAR information display
  - User details with risk indicators
  - Transaction details
  - Notes and documents

#### 5. SARAdvancedFilters
- **Location**: `src/components/sar/SARAdvancedFilters.tsx`
- **Purpose**: Advanced filtering capabilities
- **Features**:
  - Date range filtering
  - Status filtering
  - Transaction count filtering
  - Document/notes filtering
  - Filter persistence

#### 6. SARWorkflowManager
- **Location**: `src/components/sar/SARWorkflowManager.tsx`
- **Purpose**: Manage SAR workflow transitions
- **Features**:
  - Status-based action availability
  - Workflow validation
  - Notes requirement for actions
  - Audit trail integration

#### 7. SARAnalytics
- **Location**: `src/components/sar/SARAnalytics.tsx`
- **Purpose**: Analytics and reporting
- **Features**:
  - Key performance metrics
  - Status distribution charts
  - Monthly trend analysis
  - User performance tracking
  - Export capabilities

#### 8. SARBulkOperations
- **Location**: `src/components/sar/SARBulkOperations.tsx`
- **Purpose**: Bulk operations on multiple SARs
- **Features**:
  - Multi-select functionality
  - Bulk status updates
  - Bulk export
  - Bulk delete with confirmation
  - Selection summary

### Supporting Components

#### 1. PatternCard
- **Location**: `src/components/sar/PatternCard.tsx`
- **Purpose**: Display pattern detection information

#### 2. MatchesList
- **Location**: `src/components/sar/MatchesList.tsx`
- **Purpose**: Show pattern matches for SARs

#### 3. GoAMLReporting
- **Location**: `src/components/sar/GoAMLReporting.tsx`
- **Purpose**: GoAML format reporting

## Data Models

### SAR Interface
```typescript
interface SAR {
  id: string;
  userId: string;
  userName: string;
  dateSubmitted: string;
  dateOfActivity: string;
  status: SARStatus;
  summary: string;
  transactions: string[];
  documents?: string[];
  notes?: string[];
}
```

### SAR Status Types
```typescript
type SARStatus = 'draft' | 'submitted' | 'filed' | 'rejected';
```

### Pattern Interfaces
```typescript
interface Pattern {
  id: string;
  name: string;
  description: string;
  matchCount: number;
  category: 'structuring' | 'high_risk_corridor' | 'time_pattern' | 'other';
  createdAt: string;
}

interface PatternMatch {
  id: string;
  patternId: string;
  userId: string;
  userName: string;
  transactionId: string;
  country: string;
  amount: number;
  currency: string;
  timestamp: string;
  createdAt: string;
}
```

## Service Layer

### SARService
- **Location**: `src/services/sar/SARService.ts`
- **Purpose**: Database operations for SARs
- **Methods**:
  - `getSARs()`: Fetch all SARs
  - `createSAR()`: Create new SAR
  - `updateSAR()`: Update existing SAR
  - `deleteSAR()`: Delete SAR
  - `getPatterns()`: Get pattern data
  - `getPatternMatches()`: Get pattern matches

### useSARData Hook
- **Location**: `src/hooks/useSARData.tsx`
- **Purpose**: React Query integration for SAR data
- **Features**:
  - Caching and invalidation
  - Mutation handling
  - Error handling
  - Toast notifications

## Database Schema

### SARs Table
```sql
CREATE TABLE public.sars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  summary TEXT NOT NULL,
  date_of_activity TIMESTAMPTZ NOT NULL,
  date_submitted TIMESTAMPTZ NOT NULL,
  status public.sar_status NOT NULL,
  transactions JSONB NOT NULL,
  documents JSONB,
  notes JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Workflow States

### 1. Draft
- **Description**: SAR is being created/edited
- **Actions Available**:
  - Edit SAR details
  - Submit for review
  - Delete SAR

### 2. Submitted
- **Description**: SAR has been submitted for review
- **Actions Available**:
  - Approve & File
  - Reject & Return
  - Return to Draft

### 3. Filed
- **Description**: SAR has been filed with authorities
- **Actions Available**:
  - Reopen for Review

### 4. Rejected
- **Description**: SAR has been rejected and requires revision
- **Actions Available**:
  - Resubmit
  - Return to Draft

## Security & Permissions

### Row Level Security (RLS)
- SARs are protected by RLS policies
- Only admin and compliance officer roles can access SARs
- Users can only see SARs they have permission to access

### Audit Trail
- All SAR actions are logged
- Status changes include notes and timestamps
- User actions are tracked for compliance

## Integration Points

### 1. Compliance Cases
- SARs can be created from existing compliance cases
- Case data is pre-populated in SAR forms
- Bidirectional linking between cases and SARs

### 2. Transaction Monitoring
- SARs can reference suspicious transactions
- Pattern detection integration
- Transaction details included in SAR reports

### 3. User Management
- User risk scoring integration
- PEP and sanctions checking
- KYC status verification

### 4. Document Management
- Document attachment capabilities
- OCR integration for document processing
- Secure document storage

## Export Capabilities

### 1. CSV Export
- Standard SAR data export
- Customizable date ranges
- Bulk export functionality

### 2. JSON Export
- Analytics data export
- Complete SAR data structure
- API-friendly format

### 3. GoAML Format
- Regulatory compliance format
- Standardized reporting structure
- Authority submission ready

## Performance Considerations

### 1. Pagination
- Large SAR lists are paginated
- Efficient database queries
- Optimized filtering

### 2. Caching
- React Query for data caching
- Optimistic updates
- Background refetching

### 3. Real-time Updates
- WebSocket integration for live updates
- Status change notifications
- Collaborative editing support

## Error Handling

### 1. Form Validation
- Client-side validation
- Server-side validation
- User-friendly error messages

### 2. Network Errors
- Retry mechanisms
- Offline support
- Error recovery

### 3. Data Integrity
- Transaction rollback
- Data consistency checks
- Backup and recovery

## Testing Strategy

### 1. Unit Tests
- Component testing
- Hook testing
- Service testing

### 2. Integration Tests
- Workflow testing
- API integration testing
- Database testing

### 3. E2E Tests
- User journey testing
- Cross-browser testing
- Performance testing

## Future Enhancements

### 1. AI Integration
- Automated SAR generation
- Risk scoring improvements
- Pattern detection enhancement

### 2. Mobile Support
- Responsive design improvements
- Mobile-specific features
- Offline capabilities

### 3. Advanced Analytics
- Predictive analytics
- Machine learning insights
- Custom reporting

### 4. Regulatory Updates
- New compliance requirements
- Format updates
- Authority integration

## Usage Examples

### Creating a SAR from a Case
```typescript
// Navigate to SAR Center with case data
navigate('/sar-center', {
  state: {
    createSAR: true,
    caseData: {
      id: 'case-123',
      description: 'Suspicious transaction pattern',
      type: 'aml',
      riskScore: 85,
      relatedTransactions: ['tx-1', 'tx-2']
    },
    userData: {
      id: 'user-456',
      fullName: 'John Doe'
    }
  }
});
```

### Bulk Status Update
```typescript
// Update multiple SARs to submitted status
await onBulkStatusUpdate(['sar-1', 'sar-2', 'sar-3'], 'submitted');
```

### Export Analytics
```typescript
// Export analytics data for last 30 days
const analyticsData = {
  timeRange: '30d',
  generatedAt: new Date().toISOString(),
  analytics: computedAnalytics
};
```

## Troubleshooting

### Common Issues

1. **SAR Not Saving**
   - Check form validation
   - Verify database permissions
   - Check network connectivity

2. **Status Not Updating**
   - Verify workflow permissions
   - Check status transition rules
   - Review audit logs

3. **Export Failing**
   - Check file permissions
   - Verify data format
   - Review browser security settings

### Debug Tools

1. **Browser DevTools**
   - Network tab for API calls
   - Console for errors
   - React DevTools for state

2. **Database Logs**
   - Query performance
   - Error logs
   - Transaction logs

3. **Application Logs**
   - User actions
   - System events
   - Error tracking

## Support & Maintenance

### Regular Maintenance
- Database optimization
- Cache cleanup
- Log rotation
- Security updates

### Monitoring
- Performance metrics
- Error rates
- User activity
- System health

### Backup Strategy
- Daily database backups
- Configuration backups
- Disaster recovery plan
- Data retention policies
