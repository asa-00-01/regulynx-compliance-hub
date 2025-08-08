import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, UserIcon, FileTextIcon, AlertTriangleIcon } from 'lucide-react';
import { useCompliance } from '@/context/ComplianceContext';
import { mockAvailableTransactions } from './mockSARData';
import { SARFormData } from '@/utils/sarFormHelpers';

interface SARFormProps {
  onSubmit: (data: SARFormData) => void;
  onCancel: () => void;
  initialData?: Partial<SARFormData>;
}

const SARForm: React.FC<SARFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const { state } = useCompliance();
  const [formData, setFormData] = useState<SARFormData>({
    userId: initialData?.userId || '',
    userName: initialData?.userName || '',
    dateOfActivity: initialData?.dateOfActivity || '',
    summary: initialData?.summary || '',
    transactions: initialData?.transactions || [],
    notes: initialData?.notes || [],
    status: initialData?.status || 'draft',
  });

  const [selectedTransactions, setSelectedTransactions] = useState<string[]>(
    initialData?.transactions || []
  );
  const [noteInput, setNoteInput] = useState('');

  const handleUserChange = (userId: string) => {
    const selectedUser = state.users.find(user => user.id === userId);
    setFormData(prev => ({
      ...prev,
      userId,
      userName: selectedUser?.fullName || ''
    }));
  };

  const handleTransactionToggle = (transactionId: string) => {
    setSelectedTransactions(prev => {
      const updated = prev.includes(transactionId)
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId];
      
      setFormData(prevForm => ({
        ...prevForm,
        transactions: updated
      }));
      
      return updated;
    });
  };

  const addNote = () => {
    if (noteInput.trim()) {
      setFormData(prev => ({
        ...prev,
        notes: [...(prev.notes || []), noteInput.trim()]
      }));
      setNoteInput('');
    }
  };

  const removeNote = (index: number) => {
    setFormData(prev => ({
      ...prev,
      notes: prev.notes?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = (status: 'draft' | 'submitted') => {
    const finalData = {
      ...formData,
      status,
      transactions: selectedTransactions
    };
    onSubmit(finalData);
  };

  const selectedUser = state.users.find(user => user.id === formData.userId);

  return (
    <div className="space-y-6">
      {/* User Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Subject User
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="user-select">Select User</Label>
            <Select value={formData.userId} onValueChange={handleUserChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a user..." />
              </SelectTrigger>
              <SelectContent>
                {state.users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{user.fullName}</span>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge variant={user.riskScore > 70 ? 'destructive' : user.riskScore > 40 ? 'secondary' : 'outline'}>
                          Risk: {user.riskScore}
                        </Badge>
                        {user.isPEP && <Badge variant="outline">PEP</Badge>}
                        {user.isSanctioned && <Badge variant="destructive">Sanctioned</Badge>}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedUser && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">User Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p>{selectedUser.email}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Country:</span>
                  <p>{selectedUser.countryOfResidence}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">KYC Status:</span>
                  <Badge variant={selectedUser.kycStatus === 'verified' ? 'default' : 'secondary'}>
                    {selectedUser.kycStatus}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Risk Score:</span>
                  <Badge variant={selectedUser.riskScore > 70 ? 'destructive' : selectedUser.riskScore > 40 ? 'secondary' : 'outline'}>
                    {selectedUser.riskScore}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Activity Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="dateOfActivity">Date of Activity</Label>
            <Input
              id="dateOfActivity"
              type="date"
              value={formData.dateOfActivity}
              onChange={(e) => setFormData(prev => ({ ...prev, dateOfActivity: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              placeholder="Describe the suspicious activity..."
              value={formData.summary}
              onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
              rows={4}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Transaction Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileTextIcon className="h-5 w-5" />
            Related Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockAvailableTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center space-x-2 p-2 border rounded hover:bg-muted cursor-pointer"
                onClick={() => handleTransactionToggle(transaction.id)}
              >
                <input
                  type="checkbox"
                  checked={selectedTransactions.includes(transaction.id)}
                  onChange={() => handleTransactionToggle(transaction.id)}
                  className="rounded"
                />
                <span className="text-sm">{transaction.description}</span>
              </div>
            ))}
          </div>
          {selectedTransactions.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Selected transactions:</p>
              <div className="flex flex-wrap gap-2">
                {selectedTransactions.map((txId) => {
                  const tx = mockAvailableTransactions.find(t => t.id === txId);
                  return tx ? (
                    <Badge key={txId} variant="outline">
                      {txId}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangleIcon className="h-5 w-5" />
            Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add a note..."
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addNote()}
            />
            <Button onClick={addNote} variant="outline">
              Add
            </Button>
          </div>

          {formData.notes && formData.notes.length > 0 && (
            <div className="space-y-2">
              {formData.notes.map((note, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">{note}</span>
                  <Button
                    onClick={() => removeNote(index)}
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="outline"
          onClick={() => handleSubmit('draft')}
          disabled={!formData.userId || !formData.dateOfActivity || !formData.summary}
        >
          Save as Draft
        </Button>
        <Button
          onClick={() => handleSubmit('submitted')}
          disabled={!formData.userId || !formData.dateOfActivity || !formData.summary}
        >
          Submit SAR
        </Button>
      </div>
    </div>
  );
};

export default SARForm;
