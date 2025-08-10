
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Eye, Flag, FileText } from 'lucide-react';
import { DetectedPattern } from '@/types/pattern';
import { AMLTransaction } from '@/types/aml';

export interface PatternDetailsModalProps {
  pattern: DetectedPattern | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onViewTransaction: (transaction: AMLTransaction) => void;
  onFlagTransaction: (transaction: AMLTransaction) => void;
  onCreateCase: (transaction: AMLTransaction) => void;
}

const PatternDetailsModal: React.FC<PatternDetailsModalProps> = ({
  pattern,
  isOpen,
  onOpenChange,
  onViewTransaction,
  onFlagTransaction,
  onCreateCase
}) => {
  if (!pattern) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Pattern Details: {pattern.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pattern Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <p className="text-sm capitalize">{pattern.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Severity</label>
                  <Badge variant={pattern.severity === 'high' ? 'destructive' : pattern.severity === 'medium' ? 'secondary' : 'default'}>
                    {pattern.severity}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Match Count</label>
                  <p className="text-sm">{pattern.matchCount}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Detected</label>
                  <p className="text-sm">{new Date(pattern.lastDetected).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-sm mt-1">{pattern.description}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Related Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pattern.transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Transaction {transaction.id.substring(0, 8)}...</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.senderAmount} {transaction.senderCurrency} → {transaction.receiverAmount} {transaction.receiverCurrency}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewTransaction(transaction)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onFlagTransaction(transaction)}
                      >
                        <Flag className="h-4 w-4 mr-1" />
                        Flag
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onCreateCase(transaction)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Case
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PatternDetailsModal;
