
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield } from 'lucide-react';
import { getCategoryIcon, getCategoryColor } from './riskRulesUtils';
import { RiskMatchDisplay } from '@/types/risk';

interface TriggeredRulesProps {
  matches: RiskMatchDisplay[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const TriggeredRules: React.FC<TriggeredRulesProps> = ({ matches, selectedCategory, onCategoryChange }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Triggered Rules</CardTitle>
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
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
      </CardHeader>
      <CardContent>
        {matches.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Rules Triggered</h3>
            <p className="text-muted-foreground">
              {selectedCategory === 'all' 
                ? 'No risk rules have been triggered for this entity.'
                : `No ${selectedCategory} rules have been triggered.`
              }
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>Triggered At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matches.map((match) => (
                <TableRow key={match.id}>
                  <TableCell className="font-medium">
                    {match.rules?.rule_name || match.rule_id}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={getCategoryColor(match.rules?.category || '')}
                    >
                      <div className="flex items-center gap-1">
                        {getCategoryIcon(match.rules?.category || '')}
                        {match.rules?.category || 'Unknown'}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <span className="text-sm text-muted-foreground">
                      {match.rules?.description || 'No description available'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={match.rules?.risk_score >= 50 ? 'destructive' : 'secondary'}
                    >
                      +{match.rules?.risk_score || 0}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(match.matched_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default TriggeredRules;
