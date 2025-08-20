# AI Multi-Tenant Database Migration Guide

## Current Status

The AI Agent is now working with fallback mechanisms that don't require the database migration to be applied. However, to get the full multi-tenant functionality, you'll need to apply the database migration.

## What's Missing

The following database tables need to be created:
- `customer_ai_settings` - Customer-specific AI preferences and limits
- `ai_configurations` - Customer-specific AI configurations
- Enhanced `ai_interactions` - Multi-tenant interaction logging

## How to Apply the Migration

### Step 1: Apply the AI Multi-Tenant System Migration

**Option 1: Using Supabase CLI (Recommended)**

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Link your Supabase project**:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   Replace `YOUR_PROJECT_REF` with your actual Supabase project reference.

3. **Apply the AI system migration**:
   ```bash
   supabase db push
   ```

**Option 2: Manual SQL Execution**

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase/migrations/20250819000000_ai_multi_tenant_system.sql`
4. Execute the SQL

### Step 2: Apply the Test Data Migration (Optional)

After the AI system migration is successful, you can optionally apply test data:

**Option 1: Using Supabase CLI**
```bash
# Apply the test data migration
psql -h YOUR_SUPABASE_HOST -U postgres -d postgres -f supabase/migrations/20250819000001_test_ai_multi_tenant_setup.sql
```

**Option 2: Manual SQL Execution**
1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase/migrations/20250819000001_test_ai_multi_tenant_setup.sql`
4. Execute the SQL

## What the Test Data Migration Creates

The test data migration creates a complete testing environment with:

### 🏢 **Test Organizations**
- **Test Bank Corp** (Professional tier) - `550e8400-e29b-41d4-a716-446655440001`
- **Demo Financial Services** (Enterprise tier) - `550e8400-e29b-41d4-a716-446655440002`
- **Startup Credit Union** (Starter tier) - `550e8400-e29b-41d4-a716-446655440003`

### 👥 **Test Users**
- **Admin User** - `770e8400-e29b-41d4-a716-446655440001`
- **Compliance Officer** - `770e8400-e29b-41d4-a716-446655440002`
- **Executive User** - `770e8400-e29b-41d4-a716-446655440003`
- **Support User** - `770e8400-e29b-41d4-a716-446655440004`

### 📊 **Test Data**
- **4 AML Transactions** with different risk levels (10-85)
- **3 Compliance Cases** in different states (open, in_progress, pending)
- **3 Documents** with different verification statuses
- **3 Patterns** and pattern matches
- **2 SARs** in different states (submitted, draft)
- **Complete audit trail** with logs, metrics, and integrations

### 💳 **Subscription Plans**
- **Starter** ($29/month) - Basic AI Assistant, 5 users, 1,000 transactions
- **Professional** ($99/month) - Advanced AI Assistant, 20 users, 10,000 transactions
- **Enterprise** ($299/month) - Unlimited AI Configurations, 100 users, 100,000 transactions

## Testing the AI Multi-Tenant System

After applying both migrations, you can test:

### 1. **AI Agent Functionality**
- Navigate to the AI Agent page
- Test chat functionality with different users
- Verify customer-specific configurations
- Check usage limits and analytics

### 2. **Multi-Tenant Data Isolation**
- Switch between different test users
- Verify each user only sees their organization's data
- Test that AI configurations are customer-specific

### 3. **Subscription Features**
- Test different subscription tiers
- Verify usage limits are enforced
- Check feature access based on plan

### 4. **Integration Testing**
- Test API integrations with different clients
- Verify webhook notifications
- Check data ingestion and processing

## Test Scenarios

### Scenario 1: Professional Tier Testing
1. Login as Admin User (Test Bank Corp)
2. Access AI Agent - should have advanced features
3. Create custom AI configurations
4. Test with 20 users and 10,000 transaction limits

### Scenario 2: Enterprise Tier Testing
1. Login as Executive User (Demo Financial Services)
2. Access AI Agent - should have unlimited configurations
3. Test advanced analytics and integrations
4. Verify enterprise-level security features

### Scenario 3: Starter Tier Testing
1. Login as Support User (Startup Credit Union)
2. Access AI Agent - should have basic features
3. Test with 5 users and 1,000 transaction limits
4. Verify basic compliance features

## Troubleshooting Test Data

If you encounter issues with the test data:

1. **Check foreign key relationships** - Ensure all referenced IDs exist
2. **Verify data types** - Check that JSONB fields have valid JSON
3. **Check constraints** - Ensure unique constraints aren't violated
4. **Review error logs** - Look for specific SQL errors

## Cleanup (Optional)

If you want to remove test data later:

```sql
-- Remove test data (be careful in production!)
DELETE FROM public.case_actions WHERE case_id LIKE 'aa0e8400%';
DELETE FROM public.compliance_cases WHERE id LIKE 'aa0e8400%';
DELETE FROM public.aml_transactions WHERE id LIKE '990e8400%';
DELETE FROM public.sars WHERE id LIKE 'ee0e8400%';
DELETE FROM public.documents WHERE id LIKE 'bb0e8400%';
DELETE FROM public.organization_customers WHERE id LIKE '660e8400%';
DELETE FROM public.profiles WHERE id LIKE '770e8400%';
DELETE FROM public.customers WHERE id LIKE '550e8400%';
```

The AI Agent will continue to work with the current fallback mechanisms until you're ready to apply the migration.
