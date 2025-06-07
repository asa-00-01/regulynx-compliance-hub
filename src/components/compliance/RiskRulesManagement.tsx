import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Settings, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

interface RuleTemplate {
  name: string;
  category: 'transaction' | 'kyc' | 'behavioral';
  description: string;
  risk_score: number;
  condition: any;
}

const ruleTemplates: RuleTemplate[] = [
  {
    name: 'High Amount Transaction',
    category: 'transaction',
    description: 'Flags transactions above a certain amount threshold',
    risk_score: 30,
    condition: { '>': [{ var: 'amount' }, 10000] }
  },
  {
    name: 'Frequent Transactions',
    category: 'behavioral',
    description: 'Flags users with high transaction frequency in 24 hours',
    risk_score: 25,
    condition: { '>': [{ var: 'frequency_24h' }, 5] }
  },
  {
    name: 'Incomplete KYC',
    category: 'kyc',
    description: 'Flags users with incomplete KYC verification',
    risk_score: 40,
    condition: { '<': [{ var: 'kyc_completion' }, 100] }
  },
  {
    name: 'High Risk Country',
    category: 'transaction',
    description: 'Flags transactions from high-risk countries',
    risk_score: 35,
    condition: { 'in': [{ var: 'country' }, ['AF', 'IR', 'KP', 'SY']] }
  },
  {
    name: 'Night Time Transactions',
    category: 'behavioral',
    description: 'Flags transactions during unusual hours (2-6 AM)',
    risk_score: 15,
    condition: { 'and': [{ '>=': [{ var: 'transaction_hour' }, 2] }, { '<=': [{ var: 'transaction_hour' }, 6] }] }
  }
];

const RiskRulesManagement: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [newRule, setNewRule] = useState({
    rule_name: '',
    description: '',
    category: 'transaction' as 'transaction' | 'kyc' | 'behavioral',
    risk_score: 10,
    condition: '{}'
  });
  const { toast } = useToast();

  useEffect(() => {
    loadRules();
  }, [selectedCategory]);

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

  const handleSaveRule = async () => {
    if (!newRule.rule_name.trim()) {
      toast({
        title: 'Error',
        description: 'Rule name is required',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      let condition;
      try {
        condition = typeof newRule.condition === 'string' 
          ? JSON.parse(newRule.condition) 
          : newRule.condition;
      } catch {
        toast({
          title: 'Error',
          description: 'Invalid condition JSON',
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }

      if (editingRule) {
        // Update existing rule
        const { error } = await supabase
          .from('rules')
          .update({
            rule_name: newRule.rule_name,
            description: newRule.description,
            category: newRule.category,
            risk_score: newRule.risk_score,
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
            rule_name: newRule.rule_name,
            description: newRule.description,
            category: newRule.category,
            risk_score: newRule.risk_score,
            condition: condition,
            is_active: true
          });

        if (error) throw error;
        toast({ title: 'Success', description: 'Rule created successfully' });
      }

      resetForm();
      loadRules();
    } catch (error) {
      console.error('Error saving rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to save rule',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewRule({
      rule_name: '',
      description: '',
      category: 'transaction',
      risk_score: 10,
      condition: '{}'
    });
    setEditingRule(null);
    setDialogOpen(false);
  };

  const handleEditRule = (rule: Rule) => {
    setEditingRule(rule);
    setNewRule({
      rule_name: rule.rule_name,
      description: rule.description,
      category: rule.category,
      risk_score: rule.risk_score,
      condition: JSON.stringify(rule.condition, null, 2)
    });
    setDialogOpen(true);
  };

  const useTemplate = (template: RuleTemplate) => {
    setNewRule({
      rule_name: template.name,
      description: template.description,
      category: template.category,
      risk_score: template.risk_score,
      condition: JSON.stringify(template.condition, null, 2)
    });
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'transaction': return 'bg-blue-100 text-blue-800';
      case 'kyc': return 'bg-purple-100 text-purple-800';
      case 'behavioral': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Risk Rules Management
          </CardTitle>
        </div>
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="transaction">Transaction</SelectItem>
              <SelectItem value="kyc">KYC</SelectItem>
              <SelectItem value="behavioral">Behavioral</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingRule ? 'Edit Rule' : 'Create New Rule'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {!editingRule && (
                  <div>
                    <Label>Quick Templates</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {ruleTemplates.map((template, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => useTemplate(template)}
                          className="justify-start text-left h-auto p-3"
                        >
                          <div>
                            <div className="font-medium">{template.name}</div>
                            <div className="text-xs text-muted-foreground">{template.description}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rule_name">Rule Name</Label>
                    <Input
                      id="rule_name"
                      value={newRule.rule_name}
                      onChange={(e) => setNewRule({...newRule, rule_name: e.target.value})}
                      placeholder="Enter rule name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={newRule.category} 
                      onValueChange={(value: 'transaction' | 'kyc' | 'behavioral') => 
                        setNewRule({...newRule, category: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transaction">Transaction</SelectItem>
                        <SelectItem value="kyc">KYC</SelectItem>
                        <SelectItem value="behavioral">Behavioral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newRule.description}
                    onChange={(e) => setNewRule({...newRule, description: e.target.value})}
                    placeholder="Enter rule description"
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label htmlFor="risk_score">Risk Score (1-100)</Label>
                  <Input
                    id="risk_score"
                    type="number"
                    min="1"
                    max="100"
                    value={newRule.risk_score}
                    onChange={(e) => setNewRule({...newRule, risk_score: parseInt(e.target.value) || 10})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="condition">Condition (JSON Logic)</Label>
                  <Textarea
                    id="condition"
                    value={newRule.condition}
                    onChange={(e) => setNewRule({...newRule, condition: e.target.value})}
                    placeholder='{"operator": [{"var": "field"}, value]}'
                    rows={4}
                    className="font-mono text-sm"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleSaveRule} disabled={loading}>
                    {editingRule ? 'Update Rule' : 'Create Rule'}
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rule Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Risk Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{rule.rule_name}</div>
                    <div className="text-sm text-muted-foreground">{rule.description}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getCategoryColor(rule.category)}>
                    {rule.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={rule.risk_score >= 50 ? 'destructive' : 'secondary'}>
                    {rule.risk_score}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                    {rule.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(rule.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleRuleStatus(rule.id, rule.is_active)}
                    >
                      {rule.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditRule(rule)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteRule(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {rules.length === 0 && (
          <div className="text-center py-8">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Rules Found</h3>
            <p className="text-muted-foreground">
              Create your first risk assessment rule to get started.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RiskRulesManagement;
