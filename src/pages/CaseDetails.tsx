
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CaseDetails = () => {
  const { caseId } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Case Details</CardTitle>
          <CardDescription>
            Viewing case details for case ID: {caseId}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Case details functionality will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CaseDetails;
