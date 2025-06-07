
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Plus, Edit, Trash2, Shield, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import RiskDistributionChart from './RiskDistributionChart';
import RiskScoreTable from './RiskScoreTable';
import { useRiskScoring } from './hooks/useRiskScoring';

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

const RiskRulesEngine: React.FC = () => {
  const { usersWithRiskScores, riskDistribution, getRiskScoreClass } = useRiskScoring();
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newRule, setNewRule] = useState({
    rule_name: '',
    description: '',
    category: 'transaction' as 'transaction' | 'kyc' | 'behavioral',
    risk_score: 10,
    condition: {}
  });
  const [showNewRuleForm, setShowNewRuleForm] = useState(false);
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
      setRules(data || []);
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

  const createSimpleCondition = (category: string, riskScore: number) => {
    // Create simple example conditions based on category
    switch (category) {
      case 'transaction':
        return {
          '>': [
            { var: 'amount' },
            riskScore * 100 // Scale risk score for amount threshold
          ]
        };
      case 'kyc':
        return {
          '==': [
            { var: 'kyc_completion' },
            0
          ]
        };
      case 'behavioral':
        return {
          '>': [
            { var: 'frequency_24h' },
            Math.floor(riskScore / 10)
          ]
        };
      default:
        return {
          '>': [
            { var: 'risk_indicator' },
            riskScore
          ]
        };
    }
  };

  const handleCreateRule = async () => {
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
      const ruleId = `rule_${Date.now()}`;
      const condition = createSimpleCondition(newRule.category, newRule.risk_score);

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

      toast({
        title: 'Success',
        description: 'Rule created successfully'
      });

      setNewRule({
        rule_name: '',
        description: '',
        category: 'transaction',
        risk_score: 10,
        condition: {}
      });
      setShowNewRuleForm(false);
      loadRules();
    } catch (error) {
      console.error('Error creating rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to create rule',
        variant: 'destructive'
      });
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

      toast({
        title: 'Success',
        description: 'Rule deleted successfully'
      });

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
      case 'transaction':
        return 'bg-blue-100 text-blue-800';
      case 'kyc':
        return 'bg-purple-100 text-purple-800';
      case 'behavioral':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRules = selectedCategory === 'all' 
    ? rules 
    : rules.filter(rule => rule.category === selectedCategory);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Risk Scoring Engine
          </CardTitle>
          <CardDescription>
            Manage risk assessment rules and monitor user risk distribution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="rules">Risk Rules</TabsTrigger>
              <TabsTrigger value="distribution">Risk Distribution</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Risk Distribution Chart */}
                <RiskDistributionChart riskDistribution={riskDistribution} />
                
                {/* Quick Stats */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Quick Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{rules.filter(r => r.is_active).length}</div>
                          <div className="text-sm text-muted-foreground">Active Rules</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{usersWithRiskScores.filter(u => u.riskScore > 70).length}</div>
                          <div className="text-sm text-muted-foreground">High Risk Users</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="rules">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
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
                  </div>
                  <Button onClick={() => setShowNewRuleForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Rule
                  </Button>
                </div>

                {showNewRuleForm && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Create New Rule</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                        <Input
                          id="description"
                          value={newRule.description}
                          onChange={(e) => setNewRule({...newRule, description: e.target.value})}
                          placeholder="Enter rule description"
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
                      <div className="flex gap-2">
                        <Button onClick={handleCreateRule} disabled={loading}>
                          Create Rule
                        </Button>
                        <Button variant="outline" onClick={() => setShowNewRuleForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardContent className="pt-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rule Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Risk Score</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRules.map((rule) => (
                          <TableRow key={rule.id}>
                            <TableCell className="font-medium">{rule.rule_name}</TableCell>
                            <TableCell>
                              <Badge className={getCategoryColor(rule.category)}>
                                {rule.category}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-md text-sm text-muted-foreground">
                              {rule.description}
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
                            <TableCell>
                              <div className="flex gap-2">
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
                    {filteredRules.length === 0 && (
                      <div className="text-center py-8">
                        <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Rules Found</h3>
                        <p className="text-muted-foreground">
                          {selectedCategory === 'all' 
                            ? 'No risk rules have been created yet.'
                            : `No ${selectedCategory} rules found.`
                          }
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="distribution">
              <div className="space-y-6">
                {/* Risk Distribution Chart */}
                <RiskDistributionChart riskDistribution={riskDistribution} />
                
                {/* Risk Score Breakdown Table */}
                <RiskScoreTable 
                  usersWithRiskScores={usersWithRiskScores} 
                  getRiskScoreClass={getRiskScoreClass} 
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskRulesEngine;
