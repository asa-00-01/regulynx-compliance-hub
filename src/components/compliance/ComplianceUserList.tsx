
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useComplianceContext } from '@/context/compliance/ComplianceContext';

const ComplianceUserList: React.FC = () => {
  const { customers, loading, error } = useComplianceContext();

  if (loading) {
    return <div className="p-4">Loading customers...</div>;
  }

  if (error) {
    return <div className="p-4 text-destructive">Error: {error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Customers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {customers.map((customer) => (
            <div key={customer.id} className="flex items-center justify-between p-4 border rounded">
              <div>
                <h3 className="font-medium">{customer.full_name}</h3>
                <p className="text-sm text-muted-foreground">{customer.email}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant={customer.kyc_status === 'verified' ? 'default' : 'secondary'}>
                  {customer.kyc_status}
                </Badge>
                <Badge variant={customer.risk_score > 70 ? 'destructive' : 'default'}>
                  Risk: {customer.risk_score}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceUserList;
