
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { AMLTransaction } from '@/types/aml';
import RiskBadge from '../common/RiskBadge';

interface TransactionRiskAssessmentProps {
  transaction: AMLTransaction;
}

const TransactionRiskAssessment: React.FC<TransactionRiskAssessmentProps> = ({ transaction }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-2">Risk Assessment</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Risk Score</span>
          <div className="flex items-center gap-2">
            <RiskBadge score={transaction.riskScore} />
          </div>
        </div>

        <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="h-2.5 rounded-full"
            style={{
              width: `${transaction.riskScore}%`,
              backgroundColor: transaction.riskScore >= 75 ? '#f43f5e' : 
                             transaction.riskScore >= 50 ? '#eab308' :
                             transaction.riskScore >= 25 ? '#3b82f6' : '#22c55e'
            }}
          ></div>
        </div>

        {transaction.notes && transaction.notes.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-2">Notes</h4>
            <ul className="space-y-2">
              {transaction.notes.map((note, index) => (
                <li key={index} className="text-sm bg-muted p-2 rounded">
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}
          
        {transaction.riskScore >= 75 && (
          <div className="mt-4 flex items-center gap-2 text-red-600">
            <AlertTriangle size={16} />
            <span className="text-sm">High risk transaction</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionRiskAssessment;
