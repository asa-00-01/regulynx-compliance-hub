
import { supabase } from '@/integrations/supabase/client';
import { AMLTransaction } from '@/types/aml';
import { UnifiedUserData } from '@/context/compliance/types';

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

// Simple JSON Logic implementation for rule evaluation
function evaluateCondition(condition: any, data: any): boolean {
  if (!condition || typeof condition !== 'object') return false;

  const operator = Object.keys(condition)[0];
  const operands = condition[operator];

  switch (operator) {
    case '>':
      return getValue(operands[0], data) > getValue(operands[1], data);
    case '<':
      return getValue(operands[0], data) < getValue(operands[1], data);
    case '>=':
      return getValue(operands[0], data) >= getValue(operands[1], data);
    case '<=':
      return getValue(operands[0], data) <= getValue(operands[1], data);
    case '==':
      return getValue(operands[0], data) === getValue(operands[1], data);
    case '!=':
      return getValue(operands[0], data) !== getValue(operands[1], data);
    case 'in':
      const value = getValue(operands[0], data);
      const array = getValue(operands[1], data);
      return Array.isArray(array) && array.includes(value);
    case 'and':
      return operands.every((op: any) => evaluateCondition(op, data));
    case 'or':
      return operands.some((op: any) => evaluateCondition(op, data));
    case '%':
      return (getValue(operands[0], data) % getValue(operands[1], data)) === 0;
    default:
      return false;
  }
}

function getValue(operand: any, data: any): any {
  if (operand && typeof operand === 'object' && operand.var) {
    const path = operand.var.split('.');
    let value = data;
    for (const key of path) {
      value = value?.[key];
    }
    return value;
  }
  return operand;
}

// Transform transaction data for rule evaluation
function prepareTransactionData(transaction: AMLTransaction): any {
  return {
    amount: transaction.senderAmount,
    sender_country: transaction.senderCountryCode,
    receiver_country: transaction.receiverCountryCode,
    country: transaction.senderCountryCode, // For country-based rules
    transaction_hour: new Date(transaction.timestamp).getHours(),
    involves_crypto: transaction.method === 'crypto',
    payment_method: transaction.method,
    // Mock additional data for demo purposes
    frequency_24h: Math.floor(Math.random() * 10),
    amount_7d: transaction.senderAmount * (Math.floor(Math.random() * 5) + 1),
    transactions_5min: Math.floor(Math.random() * 5),
    failed_logins_24h: Math.floor(Math.random() * 15),
    ip_country: transaction.senderCountryCode,
    profile_country: transaction.senderCountryCode,
  };
}

// Transform user data for rule evaluation
function prepareUserData(user: UnifiedUserData): any {
  return {
    is_pep: user.isPEP,
    kyc_completion: user.kycStatus === 'verified' ? 100 : 60,
    sanctions_match: user.isSanctioned,
    age: user.dateOfBirth ? new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear() : 30,
    monthly_volume: user.riskScore * 1000, // Mock calculation
    occupation: 'general', // Mock data
    cdd_score: user.riskScore,
    shell_company_risk: user.riskScore > 70,
    failed_logins_24h: Math.floor(Math.random() * 15),
  };
}

export async function evaluateTransactionRisk(transaction: AMLTransaction): Promise<RiskAssessmentResult> {
  try {
    // Fetch active rules
    const { data: rules, error } = await supabase
      .from('rules')
      .select('*')
      .eq('is_active', true)
      .in('category', ['transaction', 'behavioral']);

    if (error) throw error;

    const transactionData = prepareTransactionData(transaction);
    const matchedRules: RiskMatch[] = [];
    let totalRiskScore = 0;

    // Evaluate each rule
    for (const rule of rules || []) {
      try {
        if (evaluateCondition(rule.condition, transactionData)) {
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
          await supabase.from('risk_matches').insert({
            entity_id: transaction.id,
            entity_type: 'transaction',
            rule_id: rule.rule_id,
            match_data: riskMatch.match_data,
          });
        }
      } catch (evalError) {
        console.warn(`Error evaluating rule ${rule.rule_id}:`, evalError);
      }
    }

    return {
      total_risk_score: Math.min(totalRiskScore, 100), // Cap at 100
      matched_rules: matchedRules,
      rule_categories: [...new Set(matchedRules.map(r => r.category))],
    };
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
    // Fetch active KYC rules
    const { data: rules, error } = await supabase
      .from('rules')
      .select('*')
      .eq('is_active', true)
      .eq('category', 'kyc');

    if (error) throw error;

    const userData = prepareUserData(user);
    const matchedRules: RiskMatch[] = [];
    let totalRiskScore = 0;

    // Evaluate each rule
    for (const rule of rules || []) {
      try {
        if (evaluateCondition(rule.condition, userData)) {
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
          await supabase.from('risk_matches').insert({
            entity_id: user.id,
            entity_type: 'user',
            rule_id: rule.rule_id,
            match_data: riskMatch.match_data,
          });
        }
      } catch (evalError) {
        console.warn(`Error evaluating rule ${rule.rule_id}:`, evalError);
      }
    }

    return {
      total_risk_score: Math.min(totalRiskScore, 100), // Cap at 100
      matched_rules: matchedRules,
      rule_categories: [...new Set(matchedRules.map(r => r.category))],
    };
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
