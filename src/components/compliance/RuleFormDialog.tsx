
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { Rule, RuleFormData } from '@/hooks/useRiskRulesManagement';
import { useRuleForm } from './hooks/useRuleForm';
import RuleFormBasicTab from './RuleFormBasicTab';
import RuleConditionBuilder from './RuleConditionBuilder';
import RuleFormAdvancedTab from './RuleFormAdvancedTab';

interface RuleFormDialogProps {
  editingRule: Rule | null;
  loading: boolean;
  onSave: (ruleData: RuleFormData, editingRule: Rule | null) => Promise<boolean>;
  onClose: () => void;
}

const RuleFormDialog: React.FC<RuleFormDialogProps> = ({
  editingRule,
  loading,
  onSave,
  onClose
}) => {
  const {
    dialogOpen,
    setDialogOpen,
    activeTab,
    setActiveTab,
    formData,
    setFormData,
    conditionField,
    setConditionField,
    conditionOperator,
    setConditionOperator,
    conditionValue,
    setConditionValue,
    resetForm,
    handleSave,
    buildCondition
  } = useRuleForm(editingRule, onSave, onClose);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Rule
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingRule ? 'Edit Rule' : 'Create New Rule'}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="builder">Condition Builder</TabsTrigger>
            <TabsTrigger value="advanced">Advanced JSON</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <RuleFormBasicTab
              formData={formData}
              setFormData={setFormData}
              editingRule={editingRule}
            />
          </TabsContent>

          <TabsContent value="builder">
            <RuleConditionBuilder
              category={formData.category}
              conditionField={conditionField}
              setConditionField={setConditionField}
              conditionOperator={conditionOperator}
              setConditionOperator={setConditionOperator}
              conditionValue={conditionValue}
              setConditionValue={setConditionValue}
              onBuildCondition={buildCondition}
            />
          </TabsContent>

          <TabsContent value="advanced">
            <RuleFormAdvancedTab
              formData={formData}
              setFormData={setFormData}
            />
          </TabsContent>
        </Tabs>
        
        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} disabled={loading} className="flex-1">
            {editingRule ? 'Update Rule' : 'Create Rule'}
          </Button>
          <Button variant="outline" onClick={resetForm}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RuleFormDialog;
