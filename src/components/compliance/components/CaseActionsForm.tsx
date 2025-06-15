
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload } from 'lucide-react';

interface CaseActionsFormProps {
  onAddNote: (note: string) => void;
  onUploadEvidence: () => void;
  uploadedEvidence: string | null;
}

const CaseActionsForm: React.FC<CaseActionsFormProps> = ({
  onAddNote,
  onUploadEvidence,
  uploadedEvidence
}) => {
  const [newNote, setNewNote] = useState('');

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote(newNote);
      setNewNote('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Note Form */}
      <div>
        <h3 className="text-sm font-medium mb-2">Add Note</h3>
        <div className="flex space-x-2">
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Enter case note..."
            className="flex-1"
          />
          <Button onClick={handleAddNote}>Add Note</Button>
        </div>
      </div>

      {/* Upload Evidence */}
      <div>
        <h3 className="text-sm font-medium mb-2">Upload Supporting Evidence</h3>
        <div className="flex items-center space-x-2">
          <Input type="file" className="flex-1" />
          <Button onClick={onUploadEvidence}>
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
        {uploadedEvidence && (
          <div className="mt-2 text-sm text-muted-foreground">
            Uploaded: {uploadedEvidence}
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseActionsForm;
