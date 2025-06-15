
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import CaseStatusBadge from './CaseStatusBadge';
import CaseHistoryTimeline from './CaseHistoryTimeline';
import CaseActionsForm from './CaseActionsForm';

interface CaseDetailsCardProps {
  selectedCase: any;
  complianceOfficers: Array<{ id: string; name: string }>;
  onStatusChange: (newStatus: string) => void;
  onAssignCase: (officerId: string) => void;
  onAddNote: (note: string) => void;
  onUploadEvidence: () => void;
  uploadedEvidence: string | null;
}

const CaseDetailsCard: React.FC<CaseDetailsCardProps> = ({
  selectedCase,
  complianceOfficers,
  onStatusChange,
  onAssignCase,
  onAddNote,
  onUploadEvidence,
  uploadedEvidence
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleStatusChange = (newStatus: string) => {
    onStatusChange(newStatus);
    setDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>
              Case #{selectedCase.id} - {selectedCase.userName}
            </CardTitle>
            <CardDescription>
              {new Date(selectedCase.createdAt).toLocaleString()} | Assigned to: {selectedCase.assignedTo}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <CaseStatusBadge status={selectedCase.status} />
            <span
              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                selectedCase.riskScore > 70
                  ? "bg-red-100 text-red-800"
                  : selectedCase.riskScore > 30
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              Risk: {selectedCase.riskScore}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-2">Description</h3>
          <p className="text-sm">{selectedCase.description}</p>
        </div>

        <CaseHistoryTimeline history={selectedCase.history} />

        <CaseActionsForm
          onAddNote={onAddNote}
          onUploadEvidence={onUploadEvidence}
          uploadedEvidence={uploadedEvidence}
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          <Select onValueChange={onAssignCase}>
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
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Change Status</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Case Status</DialogTitle>
                <DialogDescription>
                  Select a new status for this case
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Select onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="under-review">Under Review</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CaseDetailsCard;
