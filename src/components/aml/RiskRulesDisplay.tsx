
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Shield, User, Activity, DollarSign } from 'lucide-react';
import { getRulesByCategory, getRiskMatchesForEntity, evaluateTransactionRisk, evaluateUserRisk } from '@/services/risk';
import { AMLTransaction } from '@/types/aml';
import { UnifiedUserData } from '@/context/compliance/types';
import RiskBadge from '@/components/common/RiskBadge';

interface RiskRulesDisplayProps {
  transaction?: AMLTransaction;
  user?: UnifiedUserData;
}

interface RiskMatch {
  id: string;
  rule_id: string;
  matched_at: string;
  match_data: any;
  rules: {
    rule_name: string;
    description: string;
    risk_score: number;
    category: string;
  };
}

const RiskRulesDisplay: React.FC<RiskRulesDisplayProps> = ({ transaction, user }) => {
  const [riskMatches, setRiskMatches] = useState<RiskMatch[]>([]);
  const [allRules, setAllRules] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [totalRiskScore, setTotalRiskScore] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const entityId = transaction?.id || user?.id || '';
  const entityType = transaction ? 'transaction' : 'user';

  useEffect(() => {
    if (entityId) {
      loadRiskData();
    }
  }, [entityId, entityType]);

  useEffect(() => {
    loadRulesByCategory();
  }, [selectedCategory]);

  const loadRiskData = async () => {
    setLoading(true);
    try {
      // Load existing risk matches
      const matches = await getRiskMatchesForEntity(entityId, entityType);
      setRiskMatches(matches);

      // Calculate total risk score from matches
      const total = matches.reduce((sum, match) => sum + (match.rules?.risk_score || 0), 0);
      setTotalRiskScore(Math.min(total, 100));
    } catch (error) {
      console.error('Error loading risk data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRulesByCategory = async () => {
    try {
      const rules = await getRulesByCategory(selectedCategory);
      setAllRules(rules);
    } catch (error) {
      console.error('Error loading rules:', error);
    }
  };

  const runRiskAssessment = async () => {
    setLoading(true);
    try {
      let result;
      if (transaction) {
        result = await evaluateTransactionRisk(transaction);
      } else if (user) {
        result = await evaluateUserRisk(user);
      } else {
        return;
      }

      setTotalRiskScore(result.total_risk_score);
      
      // Reload matches to show the new results
      await loadRiskData();
    } catch (error) {
      console.error('Error running risk assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'transaction':
        return <DollarSign className="h-4 w-4" />;
      case 'kyc':
        return <User className="h-4 w-4" />;
      case 'behavioral':
        return <Activity className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
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

  const filteredMatches = selectedCategory === 'all' 
    ? riskMatches 
    : riskMatches.filter(match => match.rules?.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Risk Score Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">Risk Assessment Score</CardTitle>
          <Button 
            onClick={runRiskAssessment} 
            disabled={loading}
            size="sm"
            className="ml-auto"
          >
            {loading ? 'Evaluating...' : 'Run Assessment'}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span className="text-2xl font-bold">{totalRiskScore}</span>
              <span className="text-muted-foreground">/ 100</span>
            </div>
            <RiskBadge score={totalRiskScore} />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {riskMatches.length} rule{riskMatches.length !== 1 ? 's' : ''} triggered
          </p>
        </CardContent>
      </Card>

      {/* Rule Category Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Triggered Rules</CardTitle>
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
        </CardHeader>
        <CardContent>
          {filteredMatches.length === 0 ? (
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
                {filteredMatches.map((match) => (
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

      {/* All Available Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Available Rules ({selectedCategory})</CardTitle>
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
              {allRules.map((rule) => {
                const isTriggered = riskMatches.some(match => match.rule_id === rule.rule_id);
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
    </div>
  );
};

export default RiskRulesDisplay;
