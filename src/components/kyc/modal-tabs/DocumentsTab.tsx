
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

interface DocumentsTabProps {
  identityNumber: string | null;
}

const DocumentsTab: React.FC<DocumentsTabProps> = ({ identityNumber }) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Identity Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm mb-4">
            {identityNumber ? 
              `Identity verified with number: ${identityNumber}` : 
              "No identity documents have been verified yet."}
          </p>
          
          {/* This would be populated from the documents table in a real implementation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border border-dashed p-4 flex flex-col items-center justify-center text-center">
              <FileText className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Passport / ID Card</p>
              <p className="text-xs text-muted-foreground mb-2">Verification status would show here</p>
              <Button variant="outline" size="sm" disabled>View Document</Button>
            </Card>
            
            <Card className="border border-dashed p-4 flex flex-col items-center justify-center text-center">
              <FileText className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Proof of Address</p>
              <p className="text-xs text-muted-foreground mb-2">Not uploaded yet</p>
              <Button variant="outline" size="sm" disabled>View Document</Button>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentsTab;
