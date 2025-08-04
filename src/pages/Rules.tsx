
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Rules = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Rules Management</CardTitle>
          <CardDescription>
            Manage compliance and risk assessment rules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Rules management functionality will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Rules;
