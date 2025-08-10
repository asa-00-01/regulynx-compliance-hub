
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, TrendingUp, MapPin, Clock } from 'lucide-react';
import { AMLTransaction } from '@/types/aml';

interface TransactionRiskAssessmentProps {
  transaction: AMLTransaction;
}

const TransactionRiskAssessment: React.FC<TransactionRiskAssessmentProps> = ({ transaction }) => {
  const getRiskColor = (score: number) => {
    if (score >= 80) return 'destructive';
    if (score >= 60) return 'secondary';
    if (score >= 40) return 'outline';
    return 'default';
  };

  const getRiskLevel = (score: number) => {
    if (score >= 80) return 'Critical';
    if (score >= 60) return 'High';
    if (score >= 40) return 'Medium';
    return 'Low';
  };

  // Convert notes string to array for rendering
  const notesArray = typeof transaction.notes === 'string' 
    ? transaction.notes.split(',').map(note => note.trim()).filter(Boolean)
    : Array.isArray(transaction.notes) 
    ? transaction.notes 
    : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overall Risk Score</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={getRiskColor(transaction.riskScore)}>
                  {getRiskLevel(transaction.riskScore)}
                </Badge>
                <span className="text-2xl font-bold">{transaction.riskScore}/100</span>
              </div>
            </div>
            <div className="w-32">
              <Progress value={transaction.riskScore} className="h-2" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Amount Risk</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {transaction.senderAmount > 10000 ? 'High value transaction' : 'Normal value'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Geographic Risk</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {transaction.senderCountryCode !== transaction.receiverCountryCode 
                  ? 'Cross-border transaction' 
                  : 'Domestic transaction'
                }
              </p>
            </div>
          </div>

          {notesArray.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Risk Factors</span>
              </div>
              <div className="space-y-1">
                {notesArray.map((note, index) => (
                  <div key={index} className="text-sm p-2 bg-muted rounded border-l-4 border-warning">
                    {note}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionRiskAssessment;
