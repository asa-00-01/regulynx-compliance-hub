
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ComplianceCaseDetails } from '@/types/case';
import { format } from 'date-fns';
import { 
  User, 
  Calendar, 
  AlertTriangle, 
  FileText, 
  Target,
  Clock
} from 'lucide-react';

interface CaseDetailsModalProps {
  caseItem: ComplianceCaseDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CaseDetailsModal: React.FC<CaseDetailsModalProps> = ({
  caseItem,
  open,
  onOpenChange
}) => {
  if (!caseItem) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'escalated':
        return 'bg-red-100 text-red-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Case Details: {caseItem.id}
          </DialogTitle>
          <DialogDescription>
            Compliance case information and details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Case Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Case Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div>
                    <Badge className={getStatusColor(caseItem.status)}>
                      {caseItem.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Priority</label>
                  <div>
                    <Badge className={getPriorityColor(caseItem.priority)}>
                      {caseItem.priority}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <p className="text-sm capitalize">{caseItem.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Risk Score</label>
                  <p className="text-sm font-medium">{caseItem.riskScore}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-sm mt-1">{caseItem.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* User Information */}
          {caseItem.userId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">User Name</label>
                    <p className="text-sm">{caseItem.userName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">User ID</label>
                    <p className="text-sm font-mono">{caseItem.userId}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Case Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="text-sm">{format(new Date(caseItem.createdAt), 'PPp')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <p className="text-sm">{format(new Date(caseItem.updatedAt), 'PPp')}</p>
                </div>
                {caseItem.resolvedAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Resolved</label>
                    <p className="text-sm">{format(new Date(caseItem.resolvedAt), 'PPp')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Assignment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Assignment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Assigned To</label>
                  <p className="text-sm">{caseItem.assignedToName || 'Unassigned'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Source</label>
                  <p className="text-sm capitalize">{caseItem.source || 'Manual'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Data */}
          {(caseItem.relatedAlerts?.length || caseItem.relatedTransactions?.length || caseItem.documents?.length) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Related Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {caseItem.relatedAlerts?.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Related Alerts</label>
                    <p className="text-sm">{caseItem.relatedAlerts.length} alerts</p>
                  </div>
                )}
                {caseItem.relatedTransactions?.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Related Transactions</label>
                    <p className="text-sm">{caseItem.relatedTransactions.length} transactions</p>
                  </div>
                )}
                {caseItem.documents?.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Documents</label>
                    <p className="text-sm">{caseItem.documents.length} documents</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CaseDetailsModal;
