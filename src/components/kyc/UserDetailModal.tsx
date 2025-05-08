
import React, { useState } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { 
  User, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin, 
  AlertTriangle, 
  Shield, 
  ShieldCheck, 
  ShieldOff, 
  FileText,
  Flag,
  CheckCircle,
  XCircle
} from 'lucide-react';
import RiskBadge from '@/components/common/RiskBadge';
import { useToast } from '@/components/ui/use-toast';
import { useRiskCalculation } from '@/hooks/useRiskCalculation';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [caseNotes, setCaseNotes] = useState('');
  const [kycStatus, setKycStatus] = useState<KYCStatus>(user.flags.is_verified_pep ? 'information_requested' : 'pending');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const userRiskData = useRiskCalculation(user);
  
  const handleApproveKYC = async () => {
    setIsSubmitting(true);
    
    try {
      // In a real implementation, this would update the database
      // For now, we'll just show a toast notification
      setTimeout(() => {
        toast({
          title: "KYC Approved",
          description: `${user.fullName}'s KYC verification has been approved.`,
        });
        setIsSubmitting(false);
        onOpenChange(false);
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update KYC status. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };
  
  const handleRejectKYC = async () => {
    if (!caseNotes.trim()) {
      toast({
        title: "Notes Required",
        description: "Please provide rejection reason in the notes.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real implementation, this would update the database
      // For now, we'll just show a toast notification
      setTimeout(() => {
        toast({
          title: "KYC Rejected",
          description: `${user.fullName}'s KYC verification has been rejected.`,
        });
        setIsSubmitting(false);
        onOpenChange(false);
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update KYC status. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };
  
  const handleCreateCase = async () => {
    if (!caseNotes.trim()) {
      toast({
        title: "Notes Required",
        description: "Please provide details for the compliance case.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real implementation, this would create a case in the database
      // For now, we'll just show a toast notification
      setTimeout(() => {
        toast({
          title: "Case Created",
          description: `Compliance case created for ${user.fullName}.`,
        });
        setIsSubmitting(false);
        onOpenChange(false);
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create compliance case. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

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
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Full Name:</span>
                    <span className="font-medium">{user.fullName}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Date of Birth:</span>
                    <span className="font-medium">{user.dateOfBirth}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium">{user.phoneNumber || "Not provided"}</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-muted-foreground">Address:</span>
                    <span className="font-medium">{user.address || "Not provided"}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Verification Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Account Created:</span>
                    <span className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Email Verified:</span>
                    <span className="font-medium flex items-center">
                      {user.flags.is_email_confirmed ? 
                        <><CheckCircle className="h-4 w-4 text-green-500 mr-1" /> Yes</> : 
                        <><XCircle className="h-4 w-4 text-red-500 mr-1" /> No</>}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Identity Verified:</span>
                    <span className="font-medium flex items-center">
                      {user.identityNumber ? 
                        <><CheckCircle className="h-4 w-4 text-green-500 mr-1" /> Yes</> : 
                        <><XCircle className="h-4 w-4 text-red-500 mr-1" /> No</>}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">PEP Status:</span>
                    <span className="font-medium flex items-center">
                      {user.flags.is_verified_pep ? 
                        <><AlertTriangle className="h-4 w-4 text-yellow-500 mr-1" /> PEP</> : 
                        <><CheckCircle className="h-4 w-4 text-green-500 mr-1" /> Not PEP</>}
                    </span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-muted-foreground">Sanctions List:</span>
                    <span className="font-medium flex items-center">
                      {user.flags.is_sanction_list ? 
                        <><AlertTriangle className="h-4 w-4 text-red-500 mr-1" /> Listed</> : 
                        <><CheckCircle className="h-4 w-4 text-green-500 mr-1" /> Not Listed</>}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Transaction Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Risk Impact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Transaction Count (30d)</TableCell>
                      <TableCell>{userRiskData.transactionCount}</TableCell>
                      <TableCell>
                        {userRiskData.riskFactors.highFrequency ? 
                          <Badge variant="warning">High Volume</Badge> : 
                          <Badge variant="outline">Normal</Badge>}
                      </TableCell>
                      <TableCell>{userRiskData.riskFactors.highFrequency ? "+20 points" : "0 points"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Last Transaction Amount</TableCell>
                      <TableCell>{userRiskData.recentTransactionAmount.toLocaleString()} SEK</TableCell>
                      <TableCell>
                        {userRiskData.riskFactors.highAmount ? 
                          <Badge variant="warning">High Value</Badge> : 
                          <Badge variant="outline">Normal</Badge>}
                      </TableCell>
                      <TableCell>{userRiskData.riskFactors.highAmount ? "+40 points" : "0 points"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Countries</TableCell>
                      <TableCell>{userRiskData.transactionCountries.join(", ")}</TableCell>
                      <TableCell>
                        {userRiskData.riskFactors.highRiskCountry ? 
                          <Badge variant="destructive">High Risk</Badge> : 
                          <Badge variant="outline">Standard</Badge>}
                      </TableCell>
                      <TableCell>{userRiskData.riskFactors.highRiskCountry ? "+30 points" : "0 points"}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Identity Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4">
                  {user.identityNumber ? 
                    `Identity verified with number: ${user.identityNumber}` : 
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
          </TabsContent>
          
          <TabsContent value="risk" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-medium">Overall Risk Score</h3>
                    <p className="text-muted-foreground text-sm">Based on multiple risk factors</p>
                  </div>
                  <div className="text-right">
                    <RiskBadge score={userRiskData.riskScore} size="lg" showText={true} />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Risk Breakdown</h4>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Transaction Amount</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full bg-yellow-500" style={{ width: `${userRiskData.riskFactors.highAmount ? 80 : 20}%` }}></div>
                          </div>
                          <span className="text-xs font-medium">{userRiskData.riskFactors.highAmount ? "High" : "Low"}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Transaction Frequency</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full bg-yellow-500" style={{ width: `${userRiskData.riskFactors.highFrequency ? 70 : 30}%` }}></div>
                          </div>
                          <span className="text-xs font-medium">{userRiskData.riskFactors.highFrequency ? "High" : "Low"}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Country Risk</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full bg-red-500" style={{ width: `${userRiskData.riskFactors.highRiskCountry ? 90 : 10}%` }}></div>
                          </div>
                          <span className="text-xs font-medium">{userRiskData.riskFactors.highRiskCountry ? "High" : "Low"}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">KYC Status</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: `${userRiskData.riskFactors.incompleteKYC ? 60 : 10}%` }}></div>
                          </div>
                          <span className="text-xs font-medium">{userRiskData.riskFactors.incompleteKYC ? "Incomplete" : "Complete"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {(userRiskData.riskScore > 70 || user.flags.is_verified_pep || user.flags.is_sanction_list) && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <h4 className="text-sm font-medium text-red-800 mb-1 flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4" />
                        High Risk Indicators
                      </h4>
                      <ul className="list-disc list-inside text-xs text-red-700 space-y-1">
                        {userRiskData.riskScore > 70 && <li>Overall risk score above threshold (70)</li>}
                        {user.flags.is_verified_pep && <li>Politically Exposed Person</li>}
                        {user.flags.is_sanction_list && <li>Present on sanctions list</li>}
                        {userRiskData.riskFactors.highRiskCountry && <li>Transactions with high-risk countries</li>}
                        {userRiskData.riskFactors.highAmount && <li>High value transactions</li>}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="case" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Compliance Case Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current KYC Status</label>
                  <Select value={kycStatus} onValueChange={(value) => setKycStatus(value as KYCStatus)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="information_requested">Information Requested</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Case Notes</label>
                  <Textarea
                    placeholder="Enter your notes, findings, or reasons for approval/rejection here..."
                    value={caseNotes}
                    onChange={(e) => setCaseNotes(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
                
                <div className="flex flex-wrap gap-3 justify-end pt-2">
                  <Button 
                    variant="outline" 
                    className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                    onClick={handleRejectKYC}
                    disabled={isSubmitting}
                  >
                    <XCircle className="mr-1 h-4 w-4" />
                    Reject KYC
                  </Button>
                  <Button
                    variant="outline"
                    className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                    onClick={handleApproveKYC}
                    disabled={isSubmitting}
                  >
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Approve KYC
                  </Button>
                  <Button
                    variant="default"
                    onClick={handleCreateCase}
                    disabled={isSubmitting}
                  >
                    <Flag className="mr-1 h-4 w-4" />
                    Create Compliance Case
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Case History</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No previous cases found for this user.
                </p>
                {/* In a real implementation, this would show the history of cases */}
              </CardContent>
            </Card>
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
