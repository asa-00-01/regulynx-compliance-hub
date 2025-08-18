# Normalized Mock Data System

## Overview

The normalized mock data system provides a comprehensive, interconnected dataset where all users, transactions, cases, SARs, and documents are properly linked with consistent IDs and relationships. This ensures that when you create a case, you can trace it to specific transactions made by that user, and when you create a SAR, you can link it to both the case and the underlying transactions.

## Data Structure

### Core Entities

1. **Users** (`user-001` to `user-005` + admin users)
2. **Transactions** (`tx-001` to `tx-013`)
3. **Compliance Cases** (`case-001` to `case-004`)
4. **SARs** (`SAR-2023-001` to `SAR-2024-002`)
5. **Documents** (`doc-001` to `doc-007`)
6. **Alerts** (`alert-001` to `alert-011`)
7. **Patterns** (`PTN-001` to `PTN-003`)
8. **Pattern Matches** (`MATCH-001` to `MATCH-009`)

## User Profiles

### Customer Users

| ID | Name | Email | Risk Score | Status | Risk Profile |
|----|------|-------|------------|--------|--------------|
| `user-001` | Elin West | elin.west@gmail.com | 65 | verified | High-risk: Somalia transfers |
| `user-002` | Ahmed Hassan | ahmed.hassan@outlook.com | 78 | pending | Structuring pattern |
| `user-003` | Maria Rodriguez | maria.rodriguez@hotmail.com | 85 | information_requested | Suspicious timing |
| `user-004` | Lars Andersson | lars.andersson@gmail.com | 25 | verified | Low risk, normal pattern |
| `user-005` | Fatima Al-Zahra | fatima.alzahra@yahoo.com | 92 | rejected | Sanctioned individual |

### Admin Users

| ID | Name | Email | Role |
|----|------|-------|------|
| `admin-001` | Alex Nordström | alex.nordstrom@regulynx.com | complianceOfficer |
| `admin-002` | Johan Berg | johan.berg@regulynx.com | admin |
| `admin-003` | Lena Wikström | lena.wikstrom@regulynx.com | complianceOfficer |

## Transaction Patterns

### Elin West (user-001) - High-Risk Jurisdiction Pattern
- **Transactions**: `tx-001`, `tx-002`, `tx-003`
- **Pattern**: Multiple transfers to Somalia
- **Total Amount**: 45,500 SEK
- **Risk Indicators**: High-risk jurisdiction, large amounts
- **Case**: `case-001`
- **SAR**: `SAR-2023-001`

### Ahmed Hassan (user-002) - Structuring Pattern
- **Transactions**: `tx-004`, `tx-005`, `tx-006`, `tx-007`
- **Pattern**: Multiple transactions just below 10,000 SEK threshold
- **Total Amount**: 37,900 SEK
- **Risk Indicators**: Structuring, multiple recipients
- **Case**: `case-002`
- **SAR**: `SAR-2023-002`

### Maria Rodriguez (user-003) - Suspicious Timing Pattern
- **Transactions**: `tx-008`, `tx-009`
- **Pattern**: Late night transfers (2:12 AM, 2:34 AM)
- **Total Amount**: 47,000 SEK
- **Risk Indicators**: Unusual timing, high amounts
- **Case**: `case-003`
- **SAR**: `SAR-2024-001`

### Lars Andersson (user-004) - Normal Pattern
- **Transactions**: `tx-010`, `tx-011`
- **Pattern**: Regular monthly family transfers
- **Total Amount**: 6,300 SEK
- **Risk Indicators**: None (low risk)
- **Case**: None (no suspicious activity)

### Fatima Al-Zahra (user-005) - Sanctions Pattern
- **Transactions**: `tx-012`, `tx-013`
- **Pattern**: Large transfers to offshore accounts
- **Total Amount**: 157,000 SEK
- **Risk Indicators**: Sanctioned individual, offshore transfers
- **Case**: `case-004`
- **SAR**: `SAR-2024-002`

## Compliance Cases

### Case 001: Elin West - High-Risk Jurisdiction
- **ID**: `case-001`
- **User**: `user-001` (Elin West)
- **Type**: AML
- **Status**: Open
- **Priority**: High
- **Risk Score**: 85
- **Description**: Multiple suspicious transactions to high-risk jurisdiction (Somalia)
- **Assigned To**: `admin-001` (Alex Nordström)
- **Related Transactions**: `tx-001`, `tx-002`, `tx-003`
- **Documents**: `doc-001`, `doc-002`
- **SAR Created**: `SAR-2023-001`

### Case 002: Ahmed Hassan - Structuring
- **ID**: `case-002`
- **User**: `user-002` (Ahmed Hassan)
- **Type**: AML
- **Status**: Open
- **Priority**: Medium
- **Risk Score**: 75
- **Description**: Unusual pattern of structuring transactions below reporting threshold
- **Assigned To**: `admin-003` (Lena Wikström)
- **Related Transactions**: `tx-004`, `tx-005`, `tx-006`, `tx-007`
- **Documents**: `doc-003`, `doc-004`
- **SAR Created**: `SAR-2023-002`

### Case 003: Maria Rodriguez - Suspicious Timing
- **ID**: `case-003`
- **User**: `user-003` (Maria Rodriguez)
- **Type**: AML
- **Status**: Open
- **Priority**: Medium
- **Risk Score**: 88
- **Description**: Suspicious transaction patterns during non-business hours
- **Assigned To**: `admin-001` (Alex Nordström)
- **Related Transactions**: `tx-008`, `tx-009`
- **Documents**: `doc-005`
- **SAR Created**: `SAR-2024-001`

### Case 004: Fatima Al-Zahra - Sanctions
- **ID**: `case-004`
- **User**: `user-005` (Fatima Al-Zahra)
- **Type**: Sanctions
- **Status**: Open
- **Priority**: Critical
- **Risk Score**: 95
- **Description**: Sanctioned individual attempting large transfers to offshore accounts
- **Assigned To**: `admin-002` (Johan Berg)
- **Related Transactions**: `tx-012`, `tx-013`
- **Documents**: `doc-006`, `doc-007`
- **SAR Created**: `SAR-2024-002`

## SARs (Suspicious Activity Reports)

### SAR-2023-001: Elin West
- **User**: `user-001` (Elin West)
- **Status**: Submitted
- **Transactions**: `tx-001`, `tx-002`, `tx-003`
- **Documents**: `doc-001`, `doc-002`
- **Summary**: Multiple suspicious transactions to high-risk jurisdiction (Somalia)
- **Created From**: `case-001`

### SAR-2023-002: Ahmed Hassan
- **User**: `user-002` (Ahmed Hassan)
- **Status**: Filed
- **Transactions**: `tx-004`, `tx-005`, `tx-006`, `tx-007`
- **Documents**: `doc-003`, `doc-004`
- **Summary**: Unusual pattern of structuring transactions below reporting threshold
- **Created From**: `case-002`

### SAR-2024-001: Maria Rodriguez
- **User**: `user-003` (Maria Rodriguez)
- **Status**: Draft
- **Transactions**: `tx-008`, `tx-009`
- **Documents**: `doc-005`
- **Summary**: Suspicious transaction patterns during non-business hours
- **Created From**: `case-003`

### SAR-2024-002: Fatima Al-Zahra
- **User**: `user-005` (Fatima Al-Zahra)
- **Status**: Submitted
- **Transactions**: `tx-012`, `tx-013`
- **Documents**: `doc-006`, `doc-007`
- **Summary**: Large international transfers by sanctioned individual
- **Created From**: `case-004`

## Pattern Detection

### PTN-001: Structuring Pattern
- **Matches**: `MATCH-001` to `MATCH-004`
- **User**: `user-002` (Ahmed Hassan)
- **Transactions**: `tx-004`, `tx-005`, `tx-006`, `tx-007`
- **Description**: Multiple transactions just below reporting threshold

### PTN-002: High-Risk Corridor
- **Matches**: `MATCH-005` to `MATCH-007`
- **User**: `user-001` (Elin West)
- **Transactions**: `tx-001`, `tx-002`, `tx-003`
- **Description**: Transactions to/from high-risk jurisdictions

### PTN-003: Suspicious Timing
- **Matches**: `MATCH-008`, `MATCH-009`
- **User**: `user-003` (Maria Rodriguez)
- **Transactions**: `tx-008`, `tx-009`
- **Description**: Transactions during unusual hours

## Document Relationships

### Elin West Documents
- `doc-001`: Passport (verified)
- `doc-002`: Utility bill (verified)

### Ahmed Hassan Documents
- `doc-003`: Passport (pending)
- `doc-004`: Driver's license (verified)

### Maria Rodriguez Documents
- `doc-005`: Passport (information_requested)

### Fatima Al-Zahra Documents
- `doc-006`: Passport (rejected)
- `doc-007`: Sanctions check (verified, sanctions hit)

## Alert System

### High-Risk Jurisdiction Alerts
- `alert-001`, `alert-002`, `alert-003`: Elin West's Somalia transfers

### Structuring Alerts
- `alert-004`, `alert-005`, `alert-006`, `alert-007`: Ahmed Hassan's structuring pattern

### Suspicious Timing Alerts
- `alert-008`, `alert-009`: Maria Rodriguez's late night transfers

### Sanctions Alerts
- `alert-010`, `alert-011`: Fatima Al-Zahra's blocked transfers

## Usage Examples

### Creating a Case from Transactions
```typescript
// When suspicious transactions are detected for Elin West
const userTransactions = getTransactionsByUserId('user-001');
const suspiciousTransactions = userTransactions.filter(tx => tx.flagged);

// Create a case
const newCase: ComplianceCaseDetails = {
  id: 'case-001',
  userId: 'user-001',
  userName: 'Elin West',
  type: 'aml',
  status: 'open',
  priority: 'high',
  riskScore: 85,
  description: 'Multiple suspicious transactions to high-risk jurisdiction (Somalia)',
  assignedTo: 'admin-001',
  assignedToName: 'Alex Nordström',
  relatedTransactions: suspiciousTransactions.map(tx => tx.id),
  documents: getDocumentsByUserId('user-001').map(doc => doc.id),
  // ... other fields
};
```

### Creating a SAR from a Case
```typescript
// When a case is escalated to SAR
const case_ = getCasesByUserId('user-001')[0];
const caseTransactions = getTransactionsByCaseId(case_.id);

const newSAR: SAR = {
  id: 'SAR-2023-001',
  userId: 'user-001',
  userName: 'Elin West',
  dateSubmitted: new Date().toISOString(),
  dateOfActivity: case_.createdAt,
  status: 'submitted',
  summary: 'Multiple suspicious transactions to high-risk jurisdiction (Somalia)',
  transactions: caseTransactions.map(tx => tx.id),
  documents: case_.documents,
  notes: [
    'Created from compliance case case-001',
    `Total amount: ${caseTransactions.reduce((sum, tx) => sum + tx.amount, 0)} SEK`
  ]
};
```

### Tracing Relationships
```typescript
// Get all data for a user
const user = getUserById('user-001');
const userTransactions = getTransactionsByUserId('user-001');
const userCases = getCasesByUserId('user-001');
const userSARs = getSARsByUserId('user-001');
const userDocuments = getDocumentsByUserId('user-001');

// Get all transactions for a specific case
const caseTransactions = getTransactionsByCaseId('case-001');

// Get all transactions for a specific SAR
const sarTransactions = getTransactionsBySARId('SAR-2023-001');
```

## Helper Functions

The normalized mock data system provides several helper functions:

- `getUserById(userId)`: Get user by ID
- `getTransactionsByUserId(userId)`: Get all transactions for a user
- `getCasesByUserId(userId)`: Get all cases for a user
- `getSARsByUserId(userId)`: Get all SARs for a user
- `getDocumentsByUserId(userId)`: Get all documents for a user
- `getTransactionsByCaseId(caseId)`: Get all transactions for a case
- `getTransactionsBySARId(sarId)`: Get all transactions for a SAR

## Data Consistency

All data is interconnected with consistent IDs:
- User IDs follow pattern: `user-001`, `user-002`, etc.
- Transaction IDs follow pattern: `tx-001`, `tx-002`, etc.
- Case IDs follow pattern: `case-001`, `case-002`, etc.
- SAR IDs follow pattern: `SAR-2023-001`, `SAR-2023-002`, etc.
- Document IDs follow pattern: `doc-001`, `doc-002`, etc.
- Alert IDs follow pattern: `alert-001`, `alert-002`, etc.

This ensures that when you create relationships between entities, the references are always valid and consistent.

## Benefits

1. **Consistency**: All data uses consistent IDs and relationships
2. **Traceability**: You can trace from user → transactions → cases → SARs
3. **Realism**: Data represents realistic compliance scenarios
4. **Completeness**: All entities have proper relationships and metadata
5. **Maintainability**: Single source of truth for all mock data
6. **Testability**: Predictable data for testing workflows and features
