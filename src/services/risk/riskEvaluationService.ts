
import { AMLTransaction } from '@/types/aml';
import { UnifiedUserData } from '@/context/compliance/types';
import { evaluateCondition } from '../ruleEngine';
import { prepareTransactionData, prepareUserData } from './riskDataTransformer';
import { fetchActiveRules, storeRiskMatch } from './riskDataAccess';
import { RiskAssessmentResult, RiskMatch } from '@/types/risk';

async function evaluateEntityRisk(
  entity: AMLTransaction | UnifiedUserData,
  entityType: 'transaction' | 'user',
  prepareData: (entity: any) => any,
  ruleCategories: string[]
): Promise<RiskAssessmentResult> {
  console.log(`Evaluating ${entityType} risk for:`, entity.id);

  const rules = await fetchActiveRules(ruleCategories);

  if (!rules || rules.length === 0) {
    console.warn(`No active rules found for ${entityType} assessment`);
    return {
      total_risk_score: 0,
      matched_rules: [],
      rule_categories: [],
    };
  }

  const entityData = prepareData(entity);
  const matchedRules: RiskMatch[] = [];
  let totalRiskScore = 0;

  for (const rule of rules) {
    try {
      console.log(`Evaluating rule: ${rule.rule_name}`, rule.condition);
      if (evaluateCondition(rule.condition, entityData)) {
        console.log(`Rule matched: ${rule.rule_name} (Score: ${rule.risk_score})`);
        
        const riskMatch: RiskMatch = {
          rule_id: rule.rule_id,
          rule_name: rule.rule_name,
          risk_score: rule.risk_score,
          category: rule.category,
          description: rule.description || '',
          match_data: {
            [`${entityType}_id`]: entity.id,
            evaluated_data: entityData,
            timestamp: new Date().toISOString(),
          },
        };

        matchedRules.push(riskMatch);
        totalRiskScore += rule.risk_score;

        await storeRiskMatch(entity.id, entityType, rule.rule_id, riskMatch.match_data);
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

  console.log(`${entityType} risk assessment result:`, result);
  return result;
}

export async function evaluateTransactionRisk(transaction: AMLTransaction): Promise<RiskAssessmentResult> {
  try {
    return await evaluateEntityRisk(
      transaction,
      'transaction',
      prepareTransactionData,
      ['transaction', 'behavioral']
    );
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
    return await evaluateEntityRisk(
      user,
      'user',
      prepareUserData,
      ['kyc']
    );
  } catch (error) {
    console.error('Error evaluating user risk:', error);
    return {
      total_risk_score: 0,
      matched_rules: [],
      rule_categories: [],
    };
  }
}
