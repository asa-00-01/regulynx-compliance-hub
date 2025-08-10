
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Eye, Flag, FileText } from 'lucide-react';
import { DetectedPattern, AMLTransaction } from '@/types/aml';

export interface PatternDetailsModalProps {
  pattern: DetectedPattern;
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
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Pattern Details: {pattern.type}
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
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <p className="text-sm">{pattern.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Risk Score</label>
                  <Badge variant={pattern.riskScore >= 70 ? 'destructive' : pattern.riskScore >= 40 ? 'secondary' : 'default'}>
                    {pattern.riskScore}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Confidence</label>
                  <p className="text-sm">{pattern.confidence}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Transactions</label>
                  <p className="text-sm">{pattern.transactionIds.length}</p>
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
                {pattern.transactionIds.map((transactionId) => (
                  <div key={transactionId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Transaction {transactionId}</p>
                      <p className="text-sm text-muted-foreground">Click to view details</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewTransaction({ id: transactionId } as AMLTransaction)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onFlagTransaction({ id: transactionId } as AMLTransaction)}
                      >
                        <Flag className="h-4 w-4 mr-1" />
                        Flag
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onCreateCase({ id: transactionId } as AMLTransaction)}
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
