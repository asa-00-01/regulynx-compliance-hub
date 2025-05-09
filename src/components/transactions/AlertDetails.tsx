import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { TransactionAlert, Transaction } from '@/types/transaction';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';

interface AlertDetailsProps {
  alert: TransactionAlert | null;
  transaction?: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddNote?: (alertId: string, note: string) => void;
  onCreateCase?: (alertId: string) => void;
  onDismiss?: (alertId: string) => void;
  canManageAlerts: boolean;
}

const AlertDetails = ({
  alert,
  transaction,
  open,
  onOpenChange,
  onAddNote,
  onCreateCase,
  onDismiss,
  canManageAlerts,
}: AlertDetailsProps) => {
  const [note, setNote] = useState('');
  const navigate = useNavigate();

  if (!alert) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  const handleAddNote = () => {
    if (note.trim() && onAddNote) {
      onAddNote(alert.id, note.trim());
      setNote('');
    }
  };

  // Handle creating a compliance case
  const handleCreateComplianceCase = () => {
    if (onCreateCase) {
      onCreateCase(alert.id);
      // Navigate to the compliance cases page
      setTimeout(() => {
        navigate('/compliance-cases');
      }, 1000);
    }
  };

  // Get badge variant based on alert status
  const getStatusBadge = (status: TransactionAlert['status']) => {
    switch (status) {
      case 'open':
        return 'destructive';
      case 'investigating':
        return 'warning';
      case 'closed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Alert Details
            <Badge variant={getStatusBadge(alert.status)} className="ml-2 capitalize">
              {alert.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Alert ID: <span className="font-mono">{alert.id}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">Alert Information</h3>
              <dl className="grid grid-cols-1 gap-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Type</dt>
                  <dd className="text-sm font-medium capitalize">
                    {alert.type.replace('_', ' ')}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Description</dt>
                  <dd className="text-sm font-medium">{alert.description}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Generated</dt>
                  <dd className="text-sm font-medium">
                    {formatDate(alert.timestamp)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">User</dt>
                  <dd className="text-sm font-medium">{alert.userName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Transaction ID</dt>
                  <dd className="text-sm font-mono">{alert.transactionId}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {transaction && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2">Transaction Details</h3>
                <dl className="grid grid-cols-1 gap-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">Amount</dt>
                    <dd className="text-sm font-medium">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: transaction.currency
                      }).format(transaction.amount)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">Origin</dt>
                    <dd className="text-sm font-medium">{transaction.originCountry}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">Destination</dt>
                    <dd className="text-sm font-medium">{transaction.destinationCountry}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">Method</dt>
                    <dd className="text-sm font-medium capitalize">{transaction.method}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">Risk Score</dt>
                    <dd className="text-sm font-bold">{transaction.riskScore}/100</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">Notes</h3>
              {alert.notes && alert.notes.length > 0 ? (
                <div className="space-y-3">
                  {alert.notes.map((noteText, index) => (
                    <div
                      key={index}
                      className="p-3 bg-muted rounded-md text-sm"
                    >
                      {noteText}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No notes yet</p>
              )}
            </CardContent>
            {canManageAlerts && (
              <CardFooter className="border-t bg-muted/50 flex flex-col items-start gap-2 p-4">
                <Textarea
                  placeholder="Add a note about this alert..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="min-h-24 resize-none w-full"
                />
                <div className="flex justify-end w-full">
                  <Button onClick={handleAddNote} disabled={!note.trim()}>
                    Add Note
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>

          {canManageAlerts && alert.status === 'open' && (
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => onDismiss?.(alert.id)}
              >
                Dismiss Alert
              </Button>
              <Button
                variant="default"
                onClick={handleCreateComplianceCase}
              >
                Create Compliance Case
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AlertDetails;
