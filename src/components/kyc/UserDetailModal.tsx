
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { KYCUser, UserFlags, KYCStatus } from '@/types/kyc';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';
import RiskBadge from '@/components/common/RiskBadge';
import { UserRiskData, calculateUserRiskData } from '@/hooks/useRiskCalculation';

// Import the tab components
import UserOverviewTab from './modal-tabs/UserOverviewTab';
import DocumentsTab from './modal-tabs/DocumentsTab';
import RiskAnalysisTab from './modal-tabs/RiskAnalysisTab';
import CaseManagementTab from './modal-tabs/CaseManagementTab';

interface UserDetailModalProps {
  user: KYCUser & { flags: UserFlags };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ 
  user, 
  open, 
  onOpenChange 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userRiskData, setUserRiskData] = useState<UserRiskData | null>(null);
  
  // Calculate risk data on component mount
  useEffect(() => {
    if (open) {
      const riskData = calculateUserRiskData(user);
      setUserRiskData(riskData);
    }
  }, [user, open]);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <User className="h-5 w-5" />
            User Profile: {user.fullName}
          </DialogTitle>
          <DialogDescription>
            KYC verification and compliance information
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
          <div>
            <Badge className={user.flags.is_verified_pep ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}>
              {user.flags.is_verified_pep ? "PEP" : "Regular Customer"}
            </Badge>
            {user.flags.is_sanction_list && (
              <Badge variant="destructive" className="ml-2">Sanctioned</Badge>
            )}
            {!user.flags.is_email_confirmed && (
              <Badge variant="outline" className="ml-2">Unverified Email</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Risk Score:</span>
            <RiskBadge score={user.flags.riskScore} showText={true} />
          </div>
        </div>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
            <TabsTrigger value="case">Case Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            {userRiskData && <UserOverviewTab user={user} userRiskData={userRiskData} />}
          </TabsContent>
          
          <TabsContent value="documents">
            <DocumentsTab userId={user.id} />
          </TabsContent>
          
          <TabsContent value="risk">
            {userRiskData && <RiskAnalysisTab userRiskData={userRiskData} user={user} />}
          </TabsContent>
          
          <TabsContent value="case">
            <CaseManagementTab 
              userId={user.id} 
              userName={user.fullName}
              isPEP={user.flags.is_verified_pep}
              initialStatus={user.flags.is_verified_pep ? 'information_requested' : 'pending'}
              onClose={() => onOpenChange(false)}
            />
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailModal;
