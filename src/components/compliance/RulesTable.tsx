
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Eye, EyeOff, Settings } from 'lucide-react';
import { Rule } from '@/hooks/useRiskRulesManagement';

interface RulesTableProps {
  rules: Rule[];
  onEdit: (rule: Rule) => void;
  onToggleStatus: (ruleId: string, currentStatus: boolean) => void;
  onDelete: (ruleId: string) => void;
}

const RulesTable: React.FC<RulesTableProps> = ({
  rules,
  onEdit,
  onToggleStatus,
  onDelete
}) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'transaction': return 'bg-blue-100 text-blue-800';
      case 'kyc': return 'bg-purple-100 text-purple-800';
      case 'behavioral': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (rules.length === 0) {
    return (
      <div className="text-center py-8">
        <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Rules Found</h3>
        <p className="text-muted-foreground">
          Create your first risk assessment rule to get started.
        </p>
      </div>
    );
  }

  return (
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
                  onClick={() => onToggleStatus(rule.id, rule.is_active)}
                >
                  {rule.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(rule)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(rule.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default RulesTable;
