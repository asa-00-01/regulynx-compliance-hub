import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, Plus, Edit, Trash2, Settings } from 'lucide-react';
import { useEscalation } from '@/hooks/useEscalation';
import { EscalationRule, CreateEscalationRuleRequest, UpdateEscalationRuleRequest } from '@/types/escalation';

const EscalationRulesManager: React.FC = () => {
  const {
    escalationRules,
    loading,
    createEscalationRule,
    updateEscalationRule,
    deleteEscalationRule
  } = useEscalation();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<EscalationRule | null>(null);
  const [formData, setFormData] = useState<CreateEscalationRuleRequest>({
    name: '',
    description: '',
    escalationLevel: 1,
    autoAssign: true,
    sendNotifications: true,
    priorityBoost: false
  });

  const handleCreateRule = async () => {
    try {
      await createEscalationRule(formData);
      setIsCreateDialogOpen(false);
      setFormData({
        name: '',
        description: '',
        escalationLevel: 1,
        autoAssign: true,
        sendNotifications: true,
        priorityBoost: false
      });
    } catch (error) {
      console.error('Error creating escalation rule:', error);
    }
  };

  const handleEditRule = async () => {
    if (!editingRule) return;
    
    try {
      const updates: UpdateEscalationRuleRequest = {
        name: formData.name,
        description: formData.description,
        caseType: formData.caseType,
        priorityThreshold: formData.priorityThreshold,
        riskScoreThreshold: formData.riskScoreThreshold,
        timeThresholdHours: formData.timeThresholdHours,
        escalationLevel: formData.escalationLevel,
        targetRole: formData.targetRole,
        targetUserId: formData.targetUserId,
        autoAssign: formData.autoAssign,
        sendNotifications: formData.sendNotifications,
        priorityBoost: formData.priorityBoost
      };
      
      await updateEscalationRule(editingRule.id, updates);
      setIsEditDialogOpen(false);
      setEditingRule(null);
    } catch (error) {
      console.error('Error updating escalation rule:', error);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (confirm('Are you sure you want to delete this escalation rule?')) {
      try {
        await deleteEscalationRule(ruleId);
      } catch (error) {
        console.error('Error deleting escalation rule:', error);
      }
    }
  };

  const openEditDialog = (rule: EscalationRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description || '',
      caseType: rule.caseType,
      priorityThreshold: rule.priorityThreshold,
      riskScoreThreshold: rule.riskScoreThreshold,
      timeThresholdHours: rule.timeThresholdHours,
      escalationLevel: rule.escalationLevel,
      targetRole: rule.targetRole,
      targetUserId: rule.targetUserId,
      autoAssign: rule.autoAssign,
      sendNotifications: rule.sendNotifications,
      priorityBoost: rule.priorityBoost
    });
    setIsEditDialogOpen(true);
  };

  const getEscalationLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-blue-100 text-blue-800';
      case 2: return 'bg-yellow-100 text-yellow-800';
      case 3: return 'bg-orange-100 text-orange-800';
      case 4: return 'bg-red-100 text-red-800';
      case 5: return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCaseTypeLabel = (type?: string) => {
    if (!type || type === 'all') return 'All Types';
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getPriorityThresholdLabel = (threshold?: string) => {
    if (!threshold || threshold === 'any') return 'Any Priority';
    return threshold.charAt(0).toUpperCase() + threshold.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Escalation Rules</h2>
          <p className="text-muted-foreground">
            Configure automatic escalation rules for compliance cases
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Escalation Rule</DialogTitle>
              <DialogDescription>
                Define a new escalation rule to automatically assign or notify users when compliance cases meet specific criteria.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Rule Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter rule name"
                  />
                </div>
                <div>
                  <Label htmlFor="escalationLevel">Escalation Level</Label>
                  <Select
                    value={formData.escalationLevel.toString()}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, escalationLevel: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Level 1</SelectItem>
                      <SelectItem value="2">Level 2</SelectItem>
                      <SelectItem value="3">Level 3</SelectItem>
                      <SelectItem value="4">Level 4</SelectItem>
                      <SelectItem value="5">Level 5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe when this rule should trigger"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="caseType">Case Type</Label>
                  <Select
                    value={formData.caseType || 'all'}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      caseType: value === 'all' ? undefined : value as EscalationRule['caseType']
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="kyc_review">KYC Review</SelectItem>
                      <SelectItem value="aml_alert">AML Alert</SelectItem>
                      <SelectItem value="sanctions_hit">Sanctions Hit</SelectItem>
                      <SelectItem value="pep_review">PEP Review</SelectItem>
                      <SelectItem value="transaction_monitoring">Transaction Monitoring</SelectItem>
                      <SelectItem value="suspicious_activity">Suspicious Activity</SelectItem>
                      <SelectItem value="document_review">Document Review</SelectItem>
                      <SelectItem value="compliance_breach">Compliance Breach</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="priorityThreshold">Priority Threshold</Label>
                  <Select
                    value={formData.priorityThreshold || 'any'}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      priorityThreshold: value === 'any' ? undefined : value as EscalationRule['priorityThreshold']
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Priority</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="riskScoreThreshold">Risk Score Threshold</Label>
                  <Input
                    id="riskScoreThreshold"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.riskScoreThreshold || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, riskScoreThreshold: e.target.value ? parseInt(e.target.value) : undefined }))}
                    placeholder="0-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timeThresholdHours">Time Threshold (hours)</Label>
                  <Input
                    id="timeThresholdHours"
                    type="number"
                    min="0"
                    value={formData.timeThresholdHours || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeThresholdHours: e.target.value ? parseInt(e.target.value) : undefined }))}
                    placeholder="Hours"
                  />
                </div>
                
                <div>
                  <Label htmlFor="targetRole">Target Role</Label>
                  <Select
                    value={formData.targetRole || 'none'}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      targetRole: value === 'none' ? undefined : value as EscalationRule['targetRole']
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No specific role</SelectItem>
                      <SelectItem value="customer_admin">Customer Admin</SelectItem>
                      <SelectItem value="customer_compliance">Customer Compliance</SelectItem>
                      <SelectItem value="customer_executive">Customer Executive</SelectItem>
                      <SelectItem value="customer_support">Customer Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoAssign"
                    checked={formData.autoAssign}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoAssign: checked }))}
                  />
                  <Label htmlFor="autoAssign">Auto-assign to target role</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="sendNotifications"
                    checked={formData.sendNotifications}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sendNotifications: checked }))}
                  />
                  <Label htmlFor="sendNotifications">Send notifications</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="priorityBoost"
                    checked={formData.priorityBoost}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, priorityBoost: checked }))}
                  />
                  <Label htmlFor="priorityBoost">Boost priority on escalation</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRule}>
                  Create Rule
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rules Table */}
      <Card>
        <CardContent className="p-0">
          {loading.rules ? (
            <div className="p-6 text-center">Loading escalation rules...</div>
          ) : escalationRules.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Case Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Time Threshold</TableHead>
                  <TableHead>Target Role</TableHead>
                  <TableHead>Settings</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {escalationRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{rule.name}</div>
                        {rule.description && (
                          <div className="text-sm text-muted-foreground">{rule.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getEscalationLevelColor(rule.escalationLevel)}>
                        Level {rule.escalationLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>{getCaseTypeLabel(rule.caseType)}</TableCell>
                    <TableCell>{getPriorityThresholdLabel(rule.priorityThreshold)}</TableCell>
                    <TableCell>
                      {rule.riskScoreThreshold ? `≥${rule.riskScoreThreshold}` : 'Any'}
                    </TableCell>
                    <TableCell>
                      {rule.timeThresholdHours ? `${rule.timeThresholdHours}h` : 'Immediate'}
                    </TableCell>
                    <TableCell>{rule.targetRole?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'None'}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {rule.autoAssign && <Badge variant="outline" className="text-xs">Auto-assign</Badge>}
                        {rule.sendNotifications && <Badge variant="outline" className="text-xs">Notify</Badge>}
                        {rule.priorityBoost && <Badge variant="outline" className="text-xs">Boost</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(rule)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRule(rule.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No escalation rules configured</p>
              <p className="text-sm text-muted-foreground">Create your first escalation rule to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Escalation Rule</DialogTitle>
            <DialogDescription>
              Modify an existing escalation rule to change its criteria or settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Same form fields as create dialog */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Rule Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter rule name"
                />
              </div>
              <div>
                <Label htmlFor="edit-escalationLevel">Escalation Level</Label>
                <Select
                  value={formData.escalationLevel.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, escalationLevel: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Level 1</SelectItem>
                    <SelectItem value="2">Level 2</SelectItem>
                    <SelectItem value="3">Level 3</SelectItem>
                    <SelectItem value="4">Level 4</SelectItem>
                    <SelectItem value="5">Level 5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe when this rule should trigger"
              />
            </div>

            {/* Add the same form fields as in create dialog */}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditRule}>
                Update Rule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EscalationRulesManager;
