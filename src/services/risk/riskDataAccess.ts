
import { supabase } from '@/integrations/supabase/client';
import { Rule } from '@/types/risk';

export async function fetchActiveRules(categories: string[]): Promise<Rule[]> {
  console.log(`Fetching active rules for categories: ${categories.join(', ')}...`);
  const { data: rules, error } = await supabase
    .from('rules')
    .select('*')
    .eq('is_active', true)
    .in('category', categories);

  if (error) {
    console.error('Error fetching rules:', error);
    throw error;
  }
  
  console.log('Found rules:', rules?.length || 0);
  return rules || [];
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
        rules!inner (
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

export async function storeRiskMatch(entityId: string, entityType: 'transaction' | 'user', ruleId: string, matchData: any) {
  const { error } = await supabase.from('risk_matches').insert({
    entity_id: entityId,
    entity_type: entityType,
    rule_id: ruleId,
    match_data: matchData,
  });

  if (error) {
    console.error('Error storing risk match:', error);
  }
}
