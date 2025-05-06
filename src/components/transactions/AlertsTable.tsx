
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TransactionAlert } from '@/types/transaction';

interface AlertsTableProps {
  alerts: TransactionAlert[];
  onViewAlert: (alert: TransactionAlert) => void;
  onCreateCase: (alertId: string) => void;
  onDismiss: (alertId: string) => void;
  canManageAlerts: boolean;
}

const AlertsTable = ({
  alerts,
  onViewAlert,
  onCreateCase,
  onDismiss,
  canManageAlerts,
}: AlertsTableProps) => {
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

  // Get badge label based on alert status
  const getStatusLabel = (status: TransactionAlert['status']) => {
    switch (status) {
      case 'open':
        return 'Open';
      case 'investigating':
        return 'Investigating';
      case 'closed':
        return 'Closed';
      default:
        return status;
    }
  };

  // Get badge variant based on alert type
  const getTypeBadge = (type: TransactionAlert['type']) => {
    switch (type) {
      case 'high_value':
        return 'secondary';
      case 'high_risk_country':
        return 'destructive';
      case 'structuring':
        return 'warning';
      case 'suspicious_pattern':
        return 'warning';
      case 'frequency':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Generated</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {alerts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                No alerts found
              </TableCell>
            </TableRow>
          ) : (
            alerts.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell>
                  <Badge variant={getTypeBadge(alert.type)} className="capitalize">
                    {alert.type.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-md truncate">
                  <span 
                    className="cursor-pointer hover:underline" 
                    onClick={() => onViewAlert(alert)}
                  >
                    {alert.description}
                  </span>
                </TableCell>
                <TableCell>{alert.userName}</TableCell>
                <TableCell>{formatDate(alert.timestamp)}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadge(alert.status)}>
                    {getStatusLabel(alert.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewAlert(alert)}
                    >
                      View
                    </Button>
                    
                    {canManageAlerts && alert.status === 'open' && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onCreateCase(alert.id)}
                        >
                          Create Case
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDismiss(alert.id)}
                        >
                          Dismiss
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AlertsTable;
