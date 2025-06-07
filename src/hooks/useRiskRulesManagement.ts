
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Rule {
  id: string;
  rule_id: string;
  rule_name: string;
  description: string;
  condition: any;
  risk_score: number;
  category: 'transaction' | 'kyc' | 'behavioral';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface RuleFormData {
  rule_name: string;
  description: string;
  category: 'transaction' | 'kyc' | 'behavioral';
  risk_score: number;
  condition: string;
}

export function useRiskRulesManagement(selectedCategory: string) {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadRules = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Type cast the data to ensure category matches our union type
      const typedRules = (data || []).map(rule => ({
        ...rule,
        category: rule.category as 'transaction' | 'kyc' | 'behavioral'
      }));
      
      setRules(typedRules);
    } catch (error) {
      console.error('Error loading rules:', error);
      toast({
        title: 'Error',
        description: 'Failed to load rules',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveRule = async (ruleData: RuleFormData, editingRule: Rule | null) => {
    if (!ruleData.rule_name.trim()) {
      toast({
        title: 'Error',
        description: 'Rule name is required',
        variant: 'destructive'
      });
      return false;
    }

    setLoading(true);
    try {
      let condition;
      try {
        condition = typeof ruleData.condition === 'string' 
          ? JSON.parse(ruleData.condition) 
          : ruleData.condition;
      } catch {
        toast({
          title: 'Error',
          description: 'Invalid condition JSON',
          variant: 'destructive'
        });
        setLoading(false);
        return false;
      }

      if (editingRule) {
        // Update existing rule
        const { error } = await supabase
          .from('rules')
          .update({
            rule_name: ruleData.rule_name,
            description: ruleData.description,
            category: ruleData.category,
            risk_score: ruleData.risk_score,
            condition: condition,
          })
          .eq('id', editingRule.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Rule updated successfully' });
      } else {
        // Create new rule
        const ruleId = `rule_${Date.now()}`;
        const { error } = await supabase
          .from('rules')
          .insert({
            rule_id: ruleId,
            rule_name: ruleData.rule_name,
            description: ruleData.description,
            category: ruleData.category,
            risk_score: ruleData.risk_score,
            condition: condition,
            is_active: true
          });

        if (error) throw error;
        toast({ title: 'Success', description: 'Rule created successfully' });
      }

      loadRules();
      return true;
    } catch (error) {
      console.error('Error saving rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to save rule',
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const toggleRuleStatus = async (ruleId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('rules')
        .update({ is_active: !currentStatus })
        .eq('id', ruleId);

      if (error) throw error;
      toast({
        title: 'Success',
        description: `Rule ${!currentStatus ? 'activated' : 'deactivated'}`
      });
      loadRules();
    } catch (error) {
      console.error('Error updating rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to update rule',
        variant: 'destructive'
      });
    }
  };

  const deleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;

    try {
      const { error } = await supabase
        .from('rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;
      toast({ title: 'Success', description: 'Rule deleted successfully' });
      loadRules();
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete rule',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    loadRules();
  }, [selectedCategory]);

  return {
    rules,
    loading,
    saveRule,
    toggleRuleStatus,
    deleteRule,
    loadRules
  };
}

export type { Rule, RuleFormData };
