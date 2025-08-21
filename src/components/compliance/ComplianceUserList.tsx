
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCompliance } from '@/context/ComplianceContext';

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
  const { state } = useCompliance();

  // Use prop users if provided, otherwise use context users
  const displayUsers = propUsers || state.users;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Users</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayUsers.map((user) => (
            <div 
              key={user.id} 
              className={`flex items-center justify-between p-4 border rounded cursor-pointer hover:bg-muted/50 ${
                selectedUserId === user.id ? 'bg-muted' : ''
              }`}
              onClick={() => onUserSelect?.(user.id)}
            >
              <div>
                <h3 className="font-medium">{user.fullName || user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant={user.kycStatus === 'verified' ? 'default' : 'secondary'}>
                  {user.kycStatus || user.status}
                </Badge>
                <Badge variant={user.riskScore > 70 ? 'destructive' : 'default'}>
                  Risk: {user.riskScore}
                </Badge>
              </div>
            </div>
          ))}
          {displayUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No users found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceUserList;
