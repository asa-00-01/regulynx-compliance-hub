
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Shield,
  FileText,
  Clock
} from 'lucide-react';
import { KYCUser, UserFlags } from '@/types/kyc';
import DocumentsTab from './modal-tabs/DocumentsTab';
import ComplianceCaseRecommendations from './ComplianceCaseRecommendations';
import { useCompliance } from '@/context/ComplianceContext';

interface KYCUserDetailsModalProps {
  user: KYCUser & { flags: UserFlags };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kycOperations: {
    updateUserKYCStatus?: (userId: string, status: string) => Promise<void>;
    requestAdditionalInfo?: (userId: string, info: string[]) => Promise<void>;
    escalateToCompliance?: (userId: string, reason: string) => Promise<void>;
    isProcessing?: (userId: string) => boolean;
  };
}

const KYCUserDetailsModal: React.FC<KYCUserDetailsModalProps> = ({
  user,
  open,
  onOpenChange,
  kycOperations
}) => {
  const { state } = useCompliance();
  
  // Get the unified user data for compliance case assessment
  const unifiedUser = user ? state.users.find(u => u.id === user.id) : null;
  
  // Early return if no user is provided
  if (!user) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>No User Selected</DialogTitle>
            <DialogDescription>
              Please select a user to view details.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const getRiskBadgeColor = (score: number) => {
    if (score >= 75) return 'destructive';
    if (score >= 50) return 'outline';
    if (score >= 25) return 'secondary';
    return 'default';
  };

  const getKYCStatus = () => {
    if (user.flags.is_email_confirmed && user.identityNumber) {
      return { status: 'Verified', icon: CheckCircle, color: 'text-green-500' };
    }
    return { status: 'Pending', icon: Clock, color: 'text-yellow-500' };
  };

  const statusInfo = getKYCStatus();
  const StatusIcon = statusInfo.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {user.fullName}
          </DialogTitle>
          <DialogDescription>
            Detailed KYC information and verification status
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Full Name:</span>
                    <span>{user.fullName}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Email:</span>
                    <span>{user.email}</span>
                  </div>
                  
                  {user.phoneNumber && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Phone:</span>
                      <span>{user.phoneNumber}</span>
                    </div>
                  )}
                  
                  {user.dateOfBirth && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Date of Birth:</span>
                      <span>{new Date(user.dateOfBirth).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  {user.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Address:</span>
                      <span className="text-sm">{user.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">KYC Status</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
                    <span className="font-medium">Status:</span>
                    <Badge variant={statusInfo.status === 'Verified' ? 'default' : 'secondary'}>
                      {statusInfo.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Risk Score:</span>
                    <Badge variant={getRiskBadgeColor(user.flags.riskScore)}>
                      {user.flags.riskScore}/100
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Email Verified:</span>
                    {user.flags.is_email_confirmed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Registration Date:</span>
                    <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {(user.flags.is_verified_pep || user.flags.is_sanction_list) && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-orange-600">⚠️ Compliance Flags</h4>
                    <div className="space-y-1">
                      {user.flags.is_verified_pep && (
                        <Badge variant="destructive" className="mr-2">
                          <Shield className="h-3 w-3 mr-1" />
                          PEP
                        </Badge>
                      )}
                      {user.flags.is_sanction_list && (
                        <Badge variant="destructive">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Sanctioned
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <DocumentsTab userId={user.id} />
          </TabsContent>

          <TabsContent value="risk" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Risk Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Risk Score Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Overall Risk:</span>
                      <Badge variant={getRiskBadgeColor(user.flags.riskScore)}>
                        {user.flags.riskScore}/100
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>PEP Status:</span>
                      <span className={user.flags.is_verified_pep ? 'text-red-500' : 'text-green-500'}>
                        {user.flags.is_verified_pep ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sanctions List:</span>
                      <span className={user.flags.is_sanction_list ? 'text-red-500' : 'text-green-500'}>
                        {user.flags.is_sanction_list ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Available Actions</h3>
              
              {/* Compliance Case Recommendations */}
              {unifiedUser && (
                <ComplianceCaseRecommendations 
                  user={unifiedUser}
                  onCaseCreated={() => {
                    // Optionally refresh data or show success message
                    console.log('Compliance case created for:', user.fullName);
                  }}
                />
              )}
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={() => kycOperations.updateUserKYCStatus?.(user.id, 'verified')}
                  disabled={kycOperations.isProcessing?.(user.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve KYC
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => kycOperations.updateUserKYCStatus?.(user.id, 'rejected')}
                  disabled={kycOperations.isProcessing?.(user.id)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject KYC
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => kycOperations.requestAdditionalInfo?.(user.id, ['ID Document'])}
                  disabled={kycOperations.isProcessing?.(user.id)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Request Info
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => kycOperations.escalateToCompliance?.(user.id, 'High risk user')}
                  disabled={kycOperations.isProcessing?.(user.id)}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Escalate
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default KYCUserDetailsModal;
