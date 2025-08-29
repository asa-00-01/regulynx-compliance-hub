
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { 
  Shield, 
  AlertTriangle, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  RefreshCw,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Eye,
  Copy,
  Download,
  Upload
} from 'lucide-react';

interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  category: 'kyc' | 'aml' | 'risk' | 'transaction' | 'sanctions';
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  conditions: RuleCondition[];
  actions: RuleAction[];
  priority: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastTriggered?: string;
  triggerCount: number;
}

interface RuleCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'in' | 'not_in';
  value: string | number | boolean | string[];
  logicalOperator?: 'AND' | 'OR';
}

interface RuleAction {
  type: 'flag' | 'escalate' | 'block' | 'notify' | 'generate_case' | 'generate_sar';
  parameters: Record<string, string | number | boolean | string[]>;
}

const Rules = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rules, setRules] = useState<ComplianceRule[]>([]);
  const [selectedRule, setSelectedRule] = useState<ComplianceRule | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Sample rules for demonstration
  const sampleRules: ComplianceRule[] = [
    {
      id: '1',
      name: 'High Value Transaction Alert',
      description: 'Flag transactions above $10,000 for manual review',
      category: 'transaction',
      severity: 'high',
      enabled: true,
      conditions: [
        { field: 'amount', operator: 'greater_than', value: 10000 }
      ],
      actions: [
        { type: 'flag', parameters: { reason: 'High value transaction' } },
        { type: 'notify', parameters: { channel: 'email', recipients: ['compliance@company.com'] } }
      ],
      priority: 1,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      createdBy: 'admin@regulynx.com',
      lastTriggered: '2024-01-20T14:30:00Z',
      triggerCount: 45
    },
    {
      id: '2',
      name: 'PEP Screening Rule',
      description: 'Automatically flag politically exposed persons',
      category: 'kyc',
      severity: 'critical',
      enabled: true,
      conditions: [
        { field: 'pep_status', operator: 'equals', value: true }
      ],
      actions: [
        { type: 'escalate', parameters: { level: 'senior_compliance_officer' } },
        { type: 'generate_case', parameters: { case_type: 'pep_review' } }
      ],
      priority: 1,
      createdAt: '2024-01-10T09:00:00Z',
      updatedAt: '2024-01-10T09:00:00Z',
      createdBy: 'admin@regulynx.com',
      lastTriggered: '2024-01-19T16:45:00Z',
      triggerCount: 12
    },
    {
      id: '3',
      name: 'Structuring Detection',
      description: 'Detect potential structuring patterns in transactions',
      category: 'aml',
      severity: 'high',
      enabled: true,
      conditions: [
        { field: 'transaction_count_24h', operator: 'greater_than', value: 5 },
        { field: 'total_amount_24h', operator: 'greater_than', value: 10000, logicalOperator: 'AND' }
      ],
      actions: [
        { type: 'flag', parameters: { reason: 'Potential structuring detected' } },
        { type: 'generate_case', parameters: { case_type: 'structuring_investigation' } }
      ],
      priority: 2,
      createdAt: '2024-01-12T11:30:00Z',
      updatedAt: '2024-01-12T11:30:00Z',
      createdBy: 'admin@regulynx.com',
      lastTriggered: '2024-01-18T13:20:00Z',
      triggerCount: 8
    },
    {
      id: '4',
      name: 'Sanctions List Check',
      description: 'Check customers against global sanctions lists',
      category: 'sanctions',
      severity: 'critical',
      enabled: true,
      conditions: [
        { field: 'sanctions_match', operator: 'equals', value: true }
      ],
      actions: [
        { type: 'block', parameters: { reason: 'Sanctions list match' } },
        { type: 'generate_sar', parameters: { sar_type: 'sanctions_violation' } }
      ],
      priority: 1,
      createdAt: '2024-01-08T08:00:00Z',
      updatedAt: '2024-01-08T08:00:00Z',
      createdBy: 'admin@regulynx.com',
      lastTriggered: '2024-01-17T10:15:00Z',
      triggerCount: 3
    }
  ];

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    setLoading(true);
    try {
      // TODO: Load rules from API/database
      console.log('Loading compliance rules...');
      setRules(sampleRules);
    } catch (error) {
      console.error('Error loading rules:', error);
      toast({
        title: 'Error',
        description: 'Failed to load compliance rules',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveRule = async (rule: ComplianceRule) => {
    setSaving(true);
    try {
      // TODO: Save rule to API/database
      console.log('Saving rule:', rule);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (rule.id) {
        // Update existing rule
        setRules(prev => prev.map(r => r.id === rule.id ? rule : r));
      } else {
        // Create new rule
        const newRule = { ...rule, id: Date.now().toString() };
        setRules(prev => [...prev, newRule]);
      }
      
      toast({
        title: 'Success',
        description: 'Rule saved successfully',
      });
      
      setIsEditing(false);
      setShowCreateForm(false);
      setSelectedRule(null);
    } catch (error) {
      console.error('Error saving rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to save rule',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteRule = async (ruleId: string) => {
    if (confirm('Are you sure you want to delete this rule? This action cannot be undone.')) {
      try {
        // TODO: Delete rule from API/database
        console.log('Deleting rule:', ruleId);
        
        setRules(prev => prev.filter(r => r.id !== ruleId));
        
        toast({
          title: 'Success',
          description: 'Rule deleted successfully',
        });
      } catch (error) {
        console.error('Error deleting rule:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete rule',
          variant: 'destructive',
        });
      }
    }
  };

  const toggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      const updatedRules = rules.map(rule => 
        rule.id === ruleId ? { ...rule, enabled } : rule
      );
      setRules(updatedRules);
      
      toast({
        title: 'Success',
        description: `Rule ${enabled ? 'enabled' : 'disabled'} successfully`,
      });
    } catch (error) {
      console.error('Error toggling rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to update rule status',
        variant: 'destructive',
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'kyc': return '👤';
      case 'aml': return '💰';
      case 'risk': return '⚠️';
      case 'transaction': return '💳';
      case 'sanctions': return '🚫';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading rules...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rules Management</h1>
          <p className="text-muted-foreground">
            Manage compliance and risk assessment rules
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Rule
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Rules
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All Rules</TabsTrigger>
          <TabsTrigger value="kyc">KYC</TabsTrigger>
          <TabsTrigger value="aml">AML</TabsTrigger>
          <TabsTrigger value="risk">Risk</TabsTrigger>
          <TabsTrigger value="transaction">Transactions</TabsTrigger>
          <TabsTrigger value="sanctions">Sanctions</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {rules.map((rule) => (
              <Card key={rule.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getCategoryIcon(rule.category)}</span>
                      <div>
                        <CardTitle className="text-lg">{rule.name}</CardTitle>
                        <CardDescription>{rule.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(rule.severity)}>
                        {rule.severity.toUpperCase()}
                      </Badge>
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={(enabled) => toggleRule(rule.id, enabled)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Priority:</span> {rule.priority}
                    </div>
                    <div>
                      <span className="font-medium">Triggers:</span> {rule.triggerCount}
                    </div>
                    <div>
                      <span className="font-medium">Last Triggered:</span>
                      <br />
                      {rule.lastTriggered ? new Date(rule.lastTriggered).toLocaleDateString() : 'Never'}
                    </div>
                    <div>
                      <span className="font-medium">Created:</span>
                      <br />
                      {new Date(rule.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedRule(rule);
                        setIsEditing(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedRule(rule)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Test
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteRule(rule.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {['kyc', 'aml', 'risk', 'transaction', 'sanctions'].map((category) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid gap-4">
              {rules
                .filter(rule => rule.category === category)
                .map((rule) => (
                  <Card key={rule.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getCategoryIcon(rule.category)}</span>
                          <div>
                            <CardTitle className="text-lg">{rule.name}</CardTitle>
                            <CardDescription>{rule.description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityColor(rule.severity)}>
                            {rule.severity.toUpperCase()}
                          </Badge>
                          <Switch
                            checked={rule.enabled}
                            onCheckedChange={(enabled) => toggleRule(rule.id, enabled)}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Priority:</span> {rule.priority}
                        </div>
                        <div>
                          <span className="font-medium">Triggers:</span> {rule.triggerCount}
                        </div>
                        <div>
                          <span className="font-medium">Last Triggered:</span>
                          <br />
                          {rule.lastTriggered ? new Date(rule.lastTriggered).toLocaleDateString() : 'Never'}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span>
                          <br />
                          {new Date(rule.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedRule(rule);
                            setIsEditing(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedRule(rule)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Test
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteRule(rule.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Rule Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Rule Statistics</CardTitle>
          <CardDescription>
            Overview of rule performance and usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{rules.length}</div>
              <div className="text-sm text-muted-foreground">Total Rules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {rules.filter(r => r.enabled).length}
              </div>
              <div className="text-sm text-muted-foreground">Active Rules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {rules.reduce((sum, r) => sum + r.triggerCount, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Triggers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {rules.filter(r => r.severity === 'critical').length}
              </div>
              <div className="text-sm text-muted-foreground">Critical Rules</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Rules;
