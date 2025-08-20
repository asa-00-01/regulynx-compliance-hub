
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CompliantUser } from '@/types/compliance';
import { Eye, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface ComplianceUserListProps {
  users: CompliantUser[];
  onUserSelect: (userId: string) => void;
  selectedUserId?: string;
}

const ComplianceUserList: React.FC<ComplianceUserListProps> = ({
  users,
  onUserSelect,
  selectedUserId
}) => {
  const getKYCStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    }
  };

  const getRiskBadgeVariant = (score: number) => {
    if (score >= 75) return "destructive";
    if (score >= 50) return "secondary";
    return "outline";
  };

  return (
    <div className="grid gap-4">
      {users.map((user) => (
        <Card 
          key={user.id}
          className={`cursor-pointer transition-colors hover:bg-muted/50 ${
            selectedUserId === user.id ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => onUserSelect(user.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {user.fullName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{user.fullName}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {getKYCStatusIcon(user.kycStatus)}
                  <Badge variant="outline" className="capitalize">
                    {user.kycStatus.replace('_', ' ')}
                  </Badge>
                </div>
                
                <Badge variant={getRiskBadgeVariant(user.riskScore)}>
                  Risk: {user.riskScore}
                </Badge>
                
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ComplianceUserList;
