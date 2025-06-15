import { supabase } from '@/integrations/supabase/client';
import { AMLTransaction } from '@/types/aml';
import { UnifiedUserData } from '@/context/compliance/types';
import { evaluateCondition } from './ruleEngine';

interface Rule {
  id: string;
  rule_id: string;
  rule_name: string;
  description: string;
  condition: any;
  risk_score: number;
  category: string;
  is_active: boolean;
}

interface RiskMatch {
  rule_id: string;
  rule_name: string;
  risk_score: number;
  category: string;
  description: string;
  match_data?: any;
}

interface RiskAssessmentResult {
  total_risk_score: number;
  matched_rules: RiskMatch[];
  rule_categories: string[];
}

// The evaluateCondition and getValue functions have been moved to src/services/ruleEngine.ts

// Transform transaction data for rule evaluation
function prepareTransactionData(transaction: AMLTransaction): any {
  const data = {
    amount: transaction.senderAmount,
    sender_country: transaction.senderCountryCode,
    receiver_country: transaction.receiverCountryCode,
    country: transaction.senderCountryCode,
    transaction_hour: new Date(transaction.timestamp).getHours(),
    involves_crypto: transaction.method === 'crypto',
    payment_method: transaction.method,
    // Enhanced data based on the rules we created
    frequency_24h: Math.floor(Math.random() * 10) + 1,
    unique_recipients_7d: Math.floor(Math.random() * 15) + 1,
    unique_countries_30d: Math.floor(Math.random() * 8) + 1,
    non_eu_countries_30d: Math.floor(Math.random() * 5),
  };
  
  console.log('Prepared transaction data:', data);
  return data;
}

// Transform user data for rule evaluation
function prepareUserData(user: UnifiedUserData): any {
  // Mock income sources based on user data
  const incomeSourceOptions = ['employment', 'social_support', 'self_employment', 'gift_inheritance', 'property_sale', 'business_other'];
  const mockIncomeSource = incomeSourceOptions[Math.floor(Math.random() * incomeSourceOptions.length)];
  
  const data = {
    is_pep: user.isPEP,
    kyc_completion: user.kycStatus === 'verified' ? 100 : 60,
    sanctions_match: user.isSanctioned,
    age: user.dateOfBirth ? new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear() : 30,
    monthly_volume: user.riskScore * 1000,
    income_source: mockIncomeSource,
    cdd_score: user.riskScore,
    shell_company_risk: user.riskScore > 70,
    non_eu_countries_kyc: Math.floor(Math.random() * 5),
  };
  
  console.log('Prepared user data:', data);
  return data;
}

export async function evaluateTransactionRisk(transaction: AMLTransaction): Promise<RiskAssessmentResult> {
  try {
    console.log('Evaluating transaction risk for:', transaction.id);
    
    // Fetch active transaction and behavioral rules
    console.log('Fetching transaction rules from database...');
    const { data: rules, error } = await supabase
      .from('rules')
      .select('*')
      .eq('is_active', true)
      .in('category', ['transaction', 'behavioral']);

    if (error) {
      console.error('Error fetching rules:', error);
      throw error;
    }

    console.log('Found rules:', rules?.length || 0);
    if (!rules || rules.length === 0) {
      console.warn('No active rules found for transaction assessment');
      return {
        total_risk_score: 0,
        matched_rules: [],
        rule_categories: [],
      };
    }

    const transactionData = prepareTransactionData(transaction);
    
    const matchedRules: RiskMatch[] = [];
    let totalRiskScore = 0;

    // Evaluate each rule
    for (const rule of rules) {
      try {
        console.log(`Evaluating rule: ${rule.rule_name}`, rule.condition);
        if (evaluateCondition(rule.condition, transactionData)) {
          console.log(`Rule matched: ${rule.rule_name} (Score: ${rule.risk_score})`);
          
          const riskMatch: RiskMatch = {
            rule_id: rule.rule_id,
            rule_name: rule.rule_name,
            risk_score: rule.risk_score,
            category: rule.category,
            description: rule.description || '',
            match_data: {
              transaction_id: transaction.id,
              evaluated_data: transactionData,
              timestamp: new Date().toISOString(),
            },
          };

          matchedRules.push(riskMatch);
          totalRiskScore += rule.risk_score;

          // Store the match in the database
          const { error: insertError } = await supabase.from('risk_matches').insert({
            entity_id: transaction.id,
            entity_type: 'transaction',
            rule_id: rule.rule_id,
            match_data: riskMatch.match_data,
          });

          if (insertError) {
            console.error('Error storing risk match:', insertError);
          }
        } else {
          console.log(`Rule not matched: ${rule.rule_name}`);
        }
      } catch (evalError) {
        console.warn(`Error evaluating rule ${rule.rule_id}:`, evalError);
      }
    }

    const result = {
      total_risk_score: Math.min(totalRiskScore, 100), // Cap at 100
      matched_rules: matchedRules,
      rule_categories: [...new Set(matchedRules.map(r => r.category))],
    };

    console.log('Transaction risk assessment result:', result);
    return result;
  } catch (error) {
    console.error('Error evaluating transaction risk:', error);
    return {
      total_risk_score: 0,
      matched_rules: [],
      rule_categories: [],
    };
  }
}

export async function evaluateUserRisk(user: UnifiedUserData): Promise<RiskAssessmentResult> {
  try {
    console.log('Evaluating user risk for:', user.id);
    
    // Fetch active KYC rules
    console.log('Fetching KYC rules from database...');
    const { data: rules, error } = await supabase
      .from('rules')
      .select('*')
      .eq('is_active', true)
      .eq('category', 'kyc');

    if (error) {
      console.error('Error fetching KYC rules:', error);
      throw error;
    }

    console.log('Found KYC rules:', rules?.length || 0);
    if (!rules || rules.length === 0) {
      console.warn('No active KYC rules found for user assessment');
      return {
        total_risk_score: 0,
        matched_rules: [],
        rule_categories: [],
      };
    }

    const userData = prepareUserData(user);
    
    const matchedRules: RiskMatch[] = [];
    let totalRiskScore = 0;

    // Evaluate each rule
    for (const rule of rules) {
      try {
        console.log(`Evaluating rule: ${rule.rule_name}`, rule.condition);
        if (evaluateCondition(rule.condition, userData)) {
          console.log(`Rule matched: ${rule.rule_name} (Score: ${rule.risk_score})`);
          
          const riskMatch: RiskMatch = {
            rule_id: rule.rule_id,
            rule_name: rule.rule_name,
            risk_score: rule.risk_score,
            category: rule.category,
            description: rule.description || '',
            match_data: {
              user_id: user.id,
              evaluated_data: userData,
              timestamp: new Date().toISOString(),
            },
          };

          matchedRules.push(riskMatch);
          totalRiskScore += rule.risk_score;

          // Store the match in the database
          const { error: insertError } = await supabase.from('risk_matches').insert({
            entity_id: user.id,
            entity_type: 'user',
            rule_id: rule.rule_id,
            match_data: riskMatch.match_data,
          });

          if (insertError) {
            console.error('Error storing risk match:', insertError);
          }
        } else {
          console.log(`Rule not matched: ${rule.rule_name}`);
        }
      } catch (evalError) {
        console.warn(`Error evaluating rule ${rule.rule_id}:`, evalError);
      }
    }

    const result = {
      total_risk_score: Math.min(totalRiskScore, 100), // Cap at 100
      matched_rules: matchedRules,
      rule_categories: [...new Set(matchedRules.map(r => r.category))],
    };

    console.log('User risk assessment result:', result);
    return result;
  } catch (error) {
    console.error('Error evaluating user risk:', error);
    return {
      total_risk_score: 0,
      matched_rules: [],
      rule_categories: [],
    };
  }
}

export async function getRulesByCategory(category?: string): Promise<Rule[]> {
  try {
    let query = supabase.from('rules').select('*').eq('is_active', true);
    
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query.order('rule_name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching rules:', error);
    return [];
  }
}

export async function getRiskMatchesForEntity(entityId: string, entityType: 'transaction' | 'user'): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('risk_matches')
      .select(`
        *,
        rules (
          rule_name,
          description,
          risk_score,
          category
        )
      `)
      .eq('entity_id', entityId)
      .eq('entity_type', entityType)
      .order('matched_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching risk matches:', error);
    return [];
  }
}
