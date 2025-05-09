
import React, { useState, useEffect } from 'react';
import { ComplianceCaseDetails, CasePriority } from '@/types/case';
import { User } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { complianceOfficers } from '@/mocks/casesData';

interface NewCaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateCase: (caseData: Partial<ComplianceCaseDetails>) => Promise<ComplianceCaseDetails | null>;
  currentUser?: User;
  initialData?: {
    userId?: string;
    userName?: string;
    riskScore?: number;
    description?: string;
    type?: 'kyc' | 'aml' | 'sanctions';
    source?: string;
  };
}

const NewCaseDialog: React.FC<NewCaseDialogProps> = ({ 
  open, 
  onOpenChange,
  onCreateCase,
  currentUser,
  initialData
}) => {
  const [formData, setFormData] = useState<Partial<ComplianceCaseDetails>>({
    type: 'kyc',
    priority: 'medium',
    riskScore: 50,
    description: '',
    userId: '',
    userName: '',
    source: 'manual'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form data with initial data if provided
  useEffect(() => {
    if (initialData && open) {
      setFormData(prevData => ({
        ...prevData,
        userId: initialData.userId || prevData.userId,
        userName: initialData.userName || prevData.userName,
        riskScore: initialData.riskScore || prevData.riskScore,
        description: initialData.description || prevData.description,
        type: initialData.type || prevData.type,
        source: (initialData.source as CaseSource) || prevData.source
      }));
    }
  }, [initialData, open]);
  
  // Update form field
  const updateField = (field: keyof ComplianceCaseDetails, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userId || !formData.userName || !formData.description) {
      return;
    }
    
    setIsSubmitting(true);
    
    const result = await onCreateCase({
      ...formData,
      createdBy: currentUser?.id
    });
    
    setIsSubmitting(false);
    
    if (result) {
      setFormData({
        type: 'kyc',
        priority: 'medium',
        riskScore: 50,
        description: '',
        userId: '',
        userName: '',
        source: 'manual'
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Compliance Case</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new compliance case
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  value={formData.userId || ''}
                  onChange={(e) => updateField('userId', e.target.value)}
                  required
                  placeholder="Enter user ID"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="userName">User Name</Label>
                <Input
                  id="userName"
                  value={formData.userName || ''}
                  onChange={(e) => updateField('userName', e.target.value)}
                  required
                  placeholder="Enter user name"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Case Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => updateField('type', value)}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select case type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kyc">KYC</SelectItem>
                    <SelectItem value="aml">AML</SelectItem>
                    <SelectItem value="sanctions">Sanctions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority as string}
                  onValueChange={(value) => updateField('priority', value as CasePriority)}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="riskScore">Risk Score (0-100)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="riskScore"
                    type="range"
                    min={0}
                    max={100}
                    value={formData.riskScore || 50}
                    onChange={(e) => updateField('riskScore', parseInt(e.target.value, 10))}
                    className="w-full"
                  />
                  <span className="text-sm font-medium min-w-[40px] text-center">
                    {formData.riskScore}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assignTo">Assign To (Optional)</Label>
                <Select
                  value={formData.assignedTo || "unassigned"}
                  onValueChange={(value) => {
                    if (value === "unassigned") {
                      updateField('assignedTo', undefined);
                      updateField('assignedToName', undefined);
                    } else {
                      const officer = complianceOfficers.find(o => o.id === value);
                      updateField('assignedTo', value);
                      updateField('assignedToName', officer?.name || '');
                    }
                  }}
                >
                  <SelectTrigger id="assignTo">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {complianceOfficers.map((officer) => (
                      <SelectItem key={officer.id} value={officer.id}>
                        {officer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Select
                value={formData.source as string}
                onValueChange={(value) => updateField('source', value)}
              >
                <SelectTrigger id="source">
                  <SelectValue placeholder="Select case source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="transaction_alert">Transaction Alert</SelectItem>
                  <SelectItem value="kyc_flag">KYC Flag</SelectItem>
                  <SelectItem value="sanctions_hit">Sanctions Hit</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                required
                placeholder="Provide details about this case"
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Create Case
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewCaseDialog;
