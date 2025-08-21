
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useComplianceContext } from '@/context/compliance/ComplianceContext';

interface ComplianceUserListProps {
  users?: any[];
  onUserSelect?: (userId: string) => void;
  selectedUserId?: string;
}

const ComplianceUserList: React.FC<ComplianceUserListProps> = ({ 
  users: propUsers, 
  onUserSelect, 
  selectedUserId 
}) => {
  const { customers, loading, error } = useComplianceContext();

  // Use prop users if provided, otherwise use context customers
  const displayUsers = propUsers || customers;

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
          {displayUsers.map((customer) => (
            <div 
              key={customer.id} 
              className={`flex items-center justify-between p-4 border rounded cursor-pointer hover:bg-muted/50 ${
                selectedUserId === customer.id ? 'bg-muted' : ''
              }`}
              onClick={() => onUserSelect?.(customer.id)}
            >
              <div>
                <h3 className="font-medium">{customer.full_name || customer.name}</h3>
                <p className="text-sm text-muted-foreground">{customer.email}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant={customer.kyc_status === 'verified' ? 'default' : 'secondary'}>
                  {customer.kyc_status || customer.status}
                </Badge>
                <Badge variant={customer.risk_score > 70 ? 'destructive' : 'default'}>
                  Risk: {customer.risk_score || customer.riskScore}
                </Badge>
              </div>
            </div>
          ))}
          {displayUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No customers found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceUserList;
