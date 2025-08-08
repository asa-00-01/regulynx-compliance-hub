
import React from 'react';
import { SAR } from '@/types/sar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { FileText, User, Calendar, AlertTriangle } from 'lucide-react';

interface SARDetailsModalProps {
  sar: SAR | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SARDetailsModal: React.FC<SARDetailsModalProps> = ({ sar, open, onOpenChange }) => {
  if (!sar) return null;

  const getStatusBadge = (status: SAR['status']) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'submitted':
        return <Badge variant="secondary">Submitted</Badge>;
      case 'reviewed':
        return <Badge variant="default">Reviewed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            SAR Report Details - {sar.id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Basic Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {getStatusBadge(sar.status)}
              <div className="text-sm text-muted-foreground">
                Created: {format(new Date(sar.dateSubmitted), 'PPP')}
              </div>
            </div>
          </div>

          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Subject Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">User ID</p>
                  <p className="text-sm font-mono">{sar.userId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">User Name</p>
                  <p className="text-sm">{sar.userName}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Activity Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date of Activity</p>
                  <p className="text-sm">{format(new Date(sar.dateOfActivity), 'PPP')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date Submitted</p>
                  <p className="text-sm">{format(new Date(sar.dateSubmitted), 'PPP')}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Summary</p>
                <p className="text-sm bg-muted p-3 rounded-md">{sar.summary}</p>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Details */}
          {sar.transactions && sar.transactions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Related Transactions ({sar.transactions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sar.transactions.map((txId, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm font-mono">{txId}</span>
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
                  <FileText className="h-4 w-4" />
                  Supporting Documents ({sar.documents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sar.documents.map((docId, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm font-mono">{docId}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {sar.notes && sar.notes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Internal Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sar.notes.map((note, index) => (
                    <div key={index} className="p-3 bg-muted rounded-md">
                      <p className="text-sm">{note}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SARDetailsModal;
