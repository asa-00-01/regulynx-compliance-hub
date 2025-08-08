
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, User, FileText, AlertTriangle } from 'lucide-react';
import { SAR } from '@/types/sar';
import { useCompliance } from '@/context/ComplianceContext';
import { mockAvailableTransactions } from './mockSARData';

interface SARDetailsModalProps {
  sar: SAR | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SARDetailsModal: React.FC<SARDetailsModalProps> = ({ sar, open, onOpenChange }) => {
  const { getUserById } = useCompliance();

  if (!sar) return null;

  const user = getUserById(sar.userId);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'default';
      case 'reviewed':
        return 'secondary';
      case 'draft':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionDetails = (transactionId: string) => {
    return mockAvailableTransactions.find(tx => tx.id === transactionId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            SAR Report: {sar.id}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex items-center justify-between">
              <Badge variant={getStatusBadgeVariant(sar.status)} className="text-sm">
                {sar.status.toUpperCase()}
              </Badge>
              <div className="text-sm text-muted-foreground">
                Submitted: {formatDate(sar.dateSubmitted)}
              </div>
            </div>

            {/* Subject User */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Subject User
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">{user.fullName}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Risk Score:</span>
                        <Badge variant={user.riskScore > 70 ? 'destructive' : user.riskScore > 40 ? 'secondary' : 'outline'}>
                          {user.riskScore}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">KYC Status:</span>
                        <Badge variant={user.kycStatus === 'verified' ? 'default' : 'secondary'}>
                          {user.kycStatus}
                        </Badge>
                      </div>
                      {user.isPEP && (
                        <Badge variant="outline">PEP</Badge>
                      )}
                      {user.isSanctioned && (
                        <Badge variant="destructive">Sanctioned</Badge>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">User details not available</p>
                )}
              </CardContent>
            </Card>

            {/* Activity Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Activity Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Date of Activity:</span>
                  <p>{formatDate(sar.dateOfActivity)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Summary:</span>
                  <p className="mt-1">{sar.summary}</p>
                </div>
              </CardContent>
            </Card>

            {/* Related Transactions */}
            {sar.transactions && sar.transactions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Related Transactions ({sar.transactions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sar.transactions.map((txId) => {
                      const transaction = getTransactionDetails(txId);
                      return (
                        <div key={txId} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{txId}</span>
                            <Badge variant="outline">Transaction</Badge>
                          </div>
                          {transaction && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {transaction.description}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {sar.notes && sar.notes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {sar.notes.map((note, index) => (
                      <div key={index} className="p-3 bg-muted rounded-lg">
                        <p className="text-sm">{note}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Documents */}
            {sar.documents && sar.documents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Supporting Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {sar.documents.map((docId, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{docId}</span>
                        <Badge variant="outline">Document</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SARDetailsModal;
