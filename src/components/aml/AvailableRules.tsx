
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getCategoryIcon, getCategoryColor } from './riskRulesUtils';
import { Rule } from '@/types/risk';

interface AvailableRulesProps {
  rules: Rule[];
  triggeredRuleIds: Set<string>;
  category: string;
}

const AvailableRules: React.FC<AvailableRulesProps> = ({ rules, triggeredRuleIds, category }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Rules ({category})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rule Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Risk Score</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((rule) => {
              const isTriggered = triggeredRuleIds.has(rule.rule_id);
              return (
                <TableRow key={rule.id} className={isTriggered ? 'bg-red-50' : ''}>
                  <TableCell className="font-medium">{rule.rule_name}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={getCategoryColor(rule.category)}
                    >
                      <div className="flex items-center gap-1">
                        {getCategoryIcon(rule.category)}
                        {rule.category}
                      </div>
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
                    {isTriggered ? (
                      <Badge variant="destructive">Triggered</Badge>
                    ) : (
                      <Badge variant="outline">Not Triggered</Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AvailableRules;
