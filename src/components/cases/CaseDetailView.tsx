import React, { useState } from 'react';
import { ComplianceCaseDetails, CaseAction } from '@/types/case';
import { User } from '@/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeftIcon,
  FileTextIcon,
  AlertTriangleIcon,
  ShieldIcon,
  ClockIcon,
  FileInput,
  Send,
  MailIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { complianceOfficers } from '@/mocks/casesData';

interface CaseDetailViewProps {
  caseItem: ComplianceCaseDetails;
  caseActions: CaseAction[];
  onAddNote: (caseId: string, note: string) => Promise<CaseAction | null>;
  onUpdateStatus: (caseId: string, newStatus: ComplianceCaseDetails['status'], note?: string) => Promise<boolean>;
  onAssign: (caseId: string, assignToId: string, assignToName: string) => Promise<boolean>;
  onBackToList: () => void;
  currentUser?: User;
}

const CaseDetailView: React.FC<CaseDetailViewProps> = ({
  caseItem,
  caseActions,
  onAddNote,
  onUpdateStatus,
  onAssign,
  onBackToList,
  currentUser
}) => {
  const [note, setNote] = useState('');
  const [newStatus, setNewStatus] = useState<ComplianceCaseDetails['status']>(caseItem.status);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentRequestDialogOpen, setDocumentRequestDialogOpen] = useState(false);
  const [documentRequest, setDocumentRequest] = useState('');
  const [communicationDialogOpen, setCommunicationDialogOpen] = useState(false);
  const [communicationMessage, setCommunicationMessage] = useState('');

  // Helper functions
  const getCaseTypeIcon = (type: string) => {
    switch (type) {
      case 'kyc':
        return <FileTextIcon className="h-5 w-5 text-blue-500" />;
      case 'aml':
        return <AlertTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'sanctions':
        return <ShieldIcon className="h-5 w-5 text-orange-500" />;
      default:
        return <FileTextIcon className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Open</Badge>;
      case 'under_review':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Under Review</Badge>;
      case 'escalated':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Escalated</Badge>;
      case 'pending_info':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">Pending Info</Badge>;
      case 'closed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge className="bg-red-500">{priority}</Badge>;
      case 'high':
        return <Badge className="bg-orange-500">{priority}</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500">{priority}</Badge>;
      case 'low':
        return <Badge className="bg-green-500">{priority}</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  const getRiskScoreBadge = (score: number) => {
    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
          score > 70
            ? "bg-red-100 text-red-800"
            : score > 40
            ? "bg-yellow-100 text-yellow-800"
            : "bg-green-100 text-green-800"
        }`}
      >
        {score}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
  };

  // Event handlers
  const handleAddNote = async () => {
    if (!note.trim()) return;
    
    setIsSubmitting(true);
    const result = await onAddNote(caseItem.id, note);
    setIsSubmitting(false);
    
    if (result) {
      setNote('');
    }
  };

  const handleUpdateStatus = async () => {
    if (newStatus === caseItem.status) {
      setStatusDialogOpen(false);
      return;
    }
    
    setIsSubmitting(true);
    const result = await onUpdateStatus(caseItem.id, newStatus, statusNote);
    setIsSubmitting(false);
    
    if (result) {
      setStatusNote('');
      setStatusDialogOpen(false);
    }
  };

  const handleAssign = async (officerId: string) => {
    const officer = complianceOfficers.find(o => o.id === officerId);
    if (!officer) return;
    
    setIsSubmitting(true);
    await onAssign(caseItem.id, officer.id, officer.name);
    setIsSubmitting(false);
  };

  const handleRequestDocuments = async () => {
    if (!documentRequest.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // For demo purposes, we'll just add this as a case action
      const result = await onAddNote(caseItem.id, `Document request: ${documentRequest}`);
      
      if (result) {
        setDocumentRequest('');
        setDocumentRequestDialogOpen(false);
        
        // In a real implementation, this would also send a notification to the user
        // For now just show a toast message via the note action
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendCommunication = async () => {
    if (!communicationMessage.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // For demo purposes, we'll just add this as a case action
      const result = await onAddNote(caseItem.id, `Communication sent: ${communicationMessage}`);
      
      if (result) {
        setCommunicationMessage('');
        setCommunicationDialogOpen(false);
        
        // In a real implementation, this would also send a notification to the user
        // For now just show a toast message via the note action
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button 
        variant="ghost" 
        className="mb-2 pl-0 flex items-center" 
        onClick={onBackToList}
      >
        <ChevronLeftIcon className="mr-1 h-4 w-4" /> Back to Cases
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
              <div className="flex items-center gap-2">
                {getCaseTypeIcon(caseItem.type)}
                <CardTitle>Case #{caseItem.id}</CardTitle>
              </div>
              <CardDescription>
                {formatDate(caseItem.createdAt)} by {caseItem.createdBy || 'System'}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {getStatusBadge(caseItem.status)}
              {getPriorityBadge(caseItem.priority)}
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  caseItem.riskScore > 70
                    ? "bg-red-100 text-red-800"
                    : caseItem.riskScore > 40
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                Risk: {caseItem.riskScore}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Case Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Case Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-1">
                  <div className="text-sm font-medium">User</div>
                  <div className="text-sm col-span-2">{caseItem.userName}</div>
                  
                  <div className="text-sm font-medium">User ID</div>
                  <div className="text-sm col-span-2 font-mono text-xs">{caseItem.userId}</div>

                  <div className="text-sm font-medium">Created</div>
                  <div className="text-sm col-span-2">{formatDate(caseItem.createdAt)}</div>
                  
                  <div className="text-sm font-medium">Last Updated</div>
                  <div className="text-sm col-span-2">{formatDate(caseItem.updatedAt)}</div>
                  
                  <div className="text-sm font-medium">Type</div>
                  <div className="text-sm col-span-2 capitalize">{caseItem.type}</div>

                  <div className="text-sm font-medium">Source</div>
                  <div className="text-sm col-span-2 capitalize">{caseItem.source?.replace(/_/g, ' ')}</div>

                  <div className="text-sm font-medium">Assigned To</div>
                  <div className="text-sm col-span-2">
                    {caseItem.assignedToName || 'Unassigned'}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">Description</h4>
                  <p className="text-sm">{caseItem.description}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Related Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Related Transactions */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Related Transactions</h4>
                  {caseItem.relatedTransactions && caseItem.relatedTransactions.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {caseItem.relatedTransactions.map(txId => (
                        <li key={txId} className="text-sm">
                          <span className="font-mono">{txId}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No related transactions</p>
                  )}
                </div>

                {/* Related Alerts */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Related Alerts</h4>
                  {caseItem.relatedAlerts && caseItem.relatedAlerts.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {caseItem.relatedAlerts.map(alertId => (
                        <li key={alertId} className="text-sm">
                          <span className="font-mono">{alertId}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No related alerts</p>
                  )}
                </div>

                {/* Documents */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Case Documents</h4>
                  {caseItem.documents && caseItem.documents.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {caseItem.documents.map(docId => (
                        <li key={docId} className="text-sm">
                          <span className="font-mono">{docId}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No documents attached</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Case History Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Case History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {caseActions.map((action, index) => (
                  <div key={action.id} className="flex">
                    <div className="mr-4 flex items-center">
                      <div className="mt-1.5">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        {index < caseActions.length - 1 && (
                          <div className="h-full w-0.5 bg-gray-200 ml-1"></div>
                        )}
                      </div>
                    </div>
                    <div className="pb-4">
                      <div className="text-sm">{action.description}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" /> 
                        {formatDate(action.actionDate)} by {action.actionByName}
                      </div>
                      {action.details?.note && (
                        <div className="mt-1 text-sm bg-muted p-2 rounded-md">
                          {action.details.note}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {caseActions.length === 0 && (
                  <p className="text-muted-foreground">No history available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Add Note */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add Note</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Type your case notes here..."
                className="min-h-[100px]"
              />
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button 
                variant="outline"
                onClick={() => setDocumentRequestDialogOpen(true)}
              >
                <FileInput className="h-4 w-4 mr-2" />
                Request Documents
              </Button>
              <Button 
                variant="outline"
                onClick={() => setCommunicationDialogOpen(true)}
              >
                <MailIcon className="h-4 w-4 mr-2" />
                Send Communication
              </Button>
              <Button 
                onClick={handleAddNote} 
                disabled={!note.trim() || isSubmitting}
              >
                Add Note
              </Button>
            </CardFooter>
          </Card>
        </CardContent>
        <CardFooter className="flex flex-wrap justify-between gap-2">
          <div>
            <Select onValueChange={handleAssign}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Assign to..." />
              </SelectTrigger>
              <SelectContent>
                {complianceOfficers.map((officer) => (
                  <SelectItem key={officer.id} value={officer.id}>
                    {officer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex space-x-2">
            <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default">Change Status</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Case Status</DialogTitle>
                  <DialogDescription>
                    Select a new status for this case
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Select 
                    value={newStatus} 
                    onValueChange={(value) => setNewStatus(value as ComplianceCaseDetails['status'])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="escalated">Escalated</SelectItem>
                      <SelectItem value="pending_info">Pending Information</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="space-y-2">
                    <label className="text-sm">Add notes about this status change (optional)</label>
                    <Textarea
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      placeholder="Explain reason for status change..."
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setStatusDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleUpdateStatus}
                    disabled={isSubmitting || newStatus === caseItem.status}
                  >
                    Update Status
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardFooter>
      </Card>

      {/* Document Request Dialog */}
      <Dialog open={documentRequestDialogOpen} onOpenChange={setDocumentRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Additional Documents</DialogTitle>
            <DialogDescription>
              Request documentation from the customer for further verification
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Document Details</label>
              <Textarea
                placeholder="Specify which documents you need from the customer..."
                value={documentRequest}
                onChange={(e) => setDocumentRequest(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDocumentRequestDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRequestDocuments}
              disabled={isSubmitting || !documentRequest.trim()}
            >
              <Send className="mr-1 h-4 w-4" />
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Communication Dialog */}
      <Dialog open={communicationDialogOpen} onOpenChange={setCommunicationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Communication</DialogTitle>
            <DialogDescription>
              Send a message to the customer regarding this case
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea
                placeholder="Type your message to the customer..."
                value={communicationMessage}
                onChange={(e) => setCommunicationMessage(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setCommunicationDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendCommunication}
              disabled={isSubmitting || !communicationMessage.trim()}
            >
              <Send className="mr-1 h-4 w-4" />
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CaseDetailView;
