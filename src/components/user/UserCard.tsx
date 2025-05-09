
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RiskBadge from '@/components/common/RiskBadge';
import { useCompliance } from '@/context/ComplianceContext';

interface UserCardProps {
  userId: string;
  showDetailsButton?: boolean;
  className?: string;
}

const UserCard: React.FC<UserCardProps> = ({ userId, showDetailsButton = true, className = '' }) => {
  const { getUserById } = useCompliance();
  const navigate = useNavigate();
  
  const user = getUserById(userId);
  
  if (!user) {
    return (
      <Card className={`p-4 ${className}`}>
        <CardContent className="p-0 text-center text-muted-foreground">
          <p>User not found</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">{user.fullName}</h4>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          
          <RiskBadge score={user.riskScore} />
        </div>
        
        <div className="mt-3 flex flex-wrap gap-1">
          {user.isPEP && (
            <Badge variant="warning" className="text-xs">PEP</Badge>
          )}
          {user.isSanctioned && (
            <Badge variant="destructive" className="text-xs">Sanctioned</Badge>
          )}
          <Badge variant="outline" className="text-xs capitalize">
            KYC: {user.kycStatus.replace('_', ' ')}
          </Badge>
        </div>
        
        <div className="mt-3 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Documents:</span>
            <span className="font-medium">{user.documents.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Transactions:</span>
            <span className="font-medium">{user.transactions.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Open Cases:</span>
            <span className="font-medium">
              {user.complianceCases.filter(c => c.status === 'open').length}
            </span>
          </div>
        </div>
        
        {showDetailsButton && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-3"
            onClick={() => navigate(`/user-case/${user.id}`)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View Full Profile
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default UserCard;
