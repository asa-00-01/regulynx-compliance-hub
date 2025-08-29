
import React, { useReducer, useEffect } from 'react';
import { ComplianceContext } from './ComplianceContext';
import { complianceReducer } from './reducer';
import { initializeMockData } from './mockDataInitializer';
import { config } from '@/config/environment';
import { useComplianceOperations } from './useComplianceOperations';
import { ComplianceState } from './types';
import { supabase } from '@/integrations/supabase/client';
import { UnifiedUserData } from './types';

const initialState: ComplianceState = {
  users: [],
  selectedUserId: null,
  selectedCase: null,
  globalFilters: {
    searchTerm: '',
    riskLevel: 'all',
    dateRange: '30days',
    kycStatus: [],
    country: undefined,
  },
};

export const ComplianceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(complianceReducer, initialState);
  
  // Fetch data based on configuration
  useEffect(() => {
    const fetchData = async () => {
      console.log('🔄 ComplianceProvider: Starting data fetch, useMockData =', config.features.useMockData);
      
      if (config.features.useMockData) {
        console.log('ComplianceProvider: Initializing mock data...');
        const generatedUsers = initializeMockData();
        console.log('ComplianceProvider: Generated users:', generatedUsers.length);
        
        dispatch({ type: 'SET_GLOBAL_FILTERS', payload: initialState.globalFilters });
        dispatch({ 
          type: 'SET_USERS', 
          payload: generatedUsers
        });
        
        console.log('ComplianceProvider: Users dispatched to state');
      } else {
        console.log('ComplianceProvider: Fetching real data from database...');
        try {
          // Fetch organization customers from the database
          const { data: organizationCustomers, error } = await supabase
            .from('organization_customers')
            .select(`
              *,
              aml_transactions (
                id,
                amount,
                transaction_date,
                risk_score,
                status,
                external_transaction_id,
                from_account,
                to_account,
                currency,
                transaction_type,
                description,
                flags,
                created_at,
                updated_at
              ),
              documents:documents!organization_customer_id (
                id,
                type,
                status,
                created_at,
                file_name,
                file_path,
                upload_date,
                verified_by,
                verification_date,
                extracted_data,
                updated_at,
                user_id
              ),
              compliance_cases:compliance_cases!organization_customer_id (
                id,
                type,
                status,
                risk_score,
                created_at,
                priority,
                source,
                user_name,
                description,
                assigned_to,
                assigned_to_name,
                created_by,
                updated_at,
                resolved_at,
                related_alerts,
                related_transactions,
                documents
              )
            `)
            .limit(100);

          if (error) {
            console.error('❌ Error fetching organization customers:', error);
            dispatch({ type: 'SET_USERS', payload: [] });
            return;
          }

          console.log('✅ Raw organization customers:', organizationCustomers);
          console.log('📊 Number of customers fetched:', organizationCustomers?.length || 0);

          // Helper function to validate kyc status
          const getValidKycStatus = (status: string): 'verified' | 'pending' | 'rejected' | 'information_requested' => {
            if (status === 'verified' || status === 'pending' || status === 'rejected' || status === 'information_requested') {
              return status;
            }
            return 'pending';
          };

          // Transform organization customers to UnifiedUserData format
          const users: UnifiedUserData[] = (organizationCustomers || []).map(customer => ({
            id: customer.id,
            fullName: customer.full_name,
            email: customer.email || '',
            dateOfBirth: customer.date_of_birth ? customer.date_of_birth.toString() : '',
            nationality: customer.nationality || '',
            identityNumber: customer.identity_number || '',
            phoneNumber: customer.phone_number || '',
            address: customer.address || '',
            countryOfResidence: customer.country_of_residence || '',
            riskScore: customer.risk_score || 0,
            kycStatus: getValidKycStatus(customer.kyc_status),
            isPEP: customer.is_pep || false,
            isSanctioned: customer.is_sanctioned || false,
            createdAt: customer.created_at,
            kycFlags: {
              userId: customer.id,
              is_registered: true,
              is_email_confirmed: !!customer.email,
              is_verified_pep: customer.is_pep || false,
              is_sanction_list: customer.is_sanctioned || false,
              riskScore: customer.risk_score || 0
            },
            notes: [],
            // Map the actual documents from the database
            transactions: (customer.aml_transactions || []).map(tx => ({
              ...tx,
              flags: Array.isArray(tx.flags) ? tx.flags : (tx.flags ? [tx.flags] : [])
            })),
            documents: (customer.documents || []).map(doc => ({
              id: doc.id,
              userId: customer.id, // Use the organization customer ID as userId
              fileName: doc.file_name,
              filePath: doc.file_path,
              type: doc.type,
              status: doc.status as 'pending' | 'verified' | 'rejected' | 'information_requested',
              uploadDate: doc.upload_date,
              verificationDate: doc.verification_date,
              verifiedBy: doc.verified_by,
              extractedData: doc.extracted_data || {},
              createdAt: doc.created_at,
              updatedAt: doc.updated_at
            })),
            complianceCases: (customer.compliance_cases || []).map(case_ => ({
              ...case_,
              type: case_.type as 'kyc_review' | 'aml_alert' | 'sanctions_hit' | 'pep_review' | 'transaction_monitoring' | 'suspicious_activity' | 'document_review' | 'compliance_breach',
              status: case_.status as 'open' | 'in_progress' | 'resolved' | 'closed' | 'escalated',
              source: case_.source as 'system_alert' | 'manual_review' | 'external_report' | 'regulatory_request'
            }))
          } as unknown as UnifiedUserData));

          console.log('🔄 ComplianceProvider: Fetched users from database:', users.length);
          console.log('📋 Transformed users:', users);
          
          dispatch({ type: 'SET_GLOBAL_FILTERS', payload: initialState.globalFilters });
          dispatch({ 
            type: 'SET_USERS', 
            payload: users
          });
          
          console.log('✅ ComplianceProvider: Real users dispatched to state');
        } catch (error) {
          console.error('❌ Error in ComplianceProvider:', error);
          dispatch({ type: 'SET_USERS', payload: [] });
        }
      }
    };

    fetchData();
  }, [config.features.useMockData]);
  
  const operations = useComplianceOperations(state, dispatch);

  return (
    <ComplianceContext.Provider 
      value={{ 
        state, 
        dispatch, 
        ...operations
      }}
    >
      {children}
    </ComplianceContext.Provider>
  );
};
