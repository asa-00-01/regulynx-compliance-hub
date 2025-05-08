
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { KYCUser, UserFlags, KYCStatus } from '@/types/kyc';
import { useToast } from '@/hooks/use-toast';
import { UserCheck, UserX, FileQuestion, Upload, ShieldCheck } from 'lucide-react';
import UserFlagsDisplay from './UserFlagsDisplay';
import SanctionIndicator from './SanctionIndicator';
import { useRiskCalculation } from '@/hooks/useRiskCalculation';
import RiskBadge from '../common/RiskBadge';

interface UserDetailModalProps {
  user: KYCUser & { flags: UserFlags };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserDetailModal = ({ user, open, onOpenChange }: UserDetailModalProps) => {
  const [activeTab, setActiveTab] = useState('details');
  const [notes, setNotes] = useState('');
  const [kycStatus, setKycStatus] = useState<KYCStatus>('pending');
  const { toast } = useToast();
  const riskData = useRiskCalculation(user);

  const handleVerify = () => {
    setKycStatus('verified');
    toast({
      title: 'User Verified',
      description: `${user.fullName} has been marked as verified.`,
      variant: 'default',
    });
    onOpenChange(false);
  };

  const handleReject = () => {
    setKycStatus('rejected');
    toast({
      title: 'User Rejected',
      description: `${user.fullName} has been rejected for verification.`,
      variant: 'destructive',
    });
    onOpenChange(false);
  };

  const handleRequestInfo = () => {
    setKycStatus('information_requested');
    toast({
      title: 'More Information Requested',
      description: `A request for more information has been sent to ${user.fullName}.`,
      variant: 'default',
    });
    onOpenChange(false);
  };

  const getKycBadge = () => {
    switch (kycStatus) {
      case 'verified':
        return <Badge variant="default">Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'information_requested':
        return <Badge variant="secondary">Information Requested</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  // Mock transaction data for the user
  const mockTransactions = [
    {
      id: 'tx1',
      date: '2023-04-15',
      amount: 5000,
      currency: 'SEK',
      type: 'Deposit'
    },
    {
      id: 'tx2',
      date: '2023-04-10',
      amount: 12500,
      currency: 'SEK',
      type: 'Transfer'
    },
    {
      id: 'tx3',
      date: '2023-04-05',
      amount: 3200,
      currency: 'SEK',
      type: 'Withdrawal'
    }
  ];

  // Mock document upload status
  const mockDocuments = {
    identityDocument: {
      status: 'verified',
      uploadDate: '2023-03-20'
    },
    addressProof: {
      status: 'pending',
      uploadDate: '2023-04-01'
    },
    additionalDocuments: {
      status: 'none',
      uploadDate: null
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>User Details: {user.fullName}</DialogTitle>
            <div className="flex items-center space-x-2">
              {getKycBadge()}
              <RiskBadge score={user.flags.riskScore} />
            </div>
          </div>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Personal Details</TabsTrigger>
            <TabsTrigger value="flags">Risk & Flags</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-semibold">Full Name</div>
                    <div>{user.fullName || <span className="text-muted-foreground italic">Missing</span>}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Email</div>
                    <div>{user.email || <span className="text-muted-foreground italic">Missing</span>}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Date of Birth</div>
                    <div>{user.dateOfBirth || <span className="text-muted-foreground italic">Missing</span>}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Identity Number</div>
                    <div>{user.identityNumber || <span className="text-muted-foreground italic">Missing</span>}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Phone Number</div>
                    <div>{user.phoneNumber || <span className="text-muted-foreground italic">Missing</span>}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Created At</div>
                    <div>{new Date(user.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div>{user.address || <span className="text-muted-foreground italic">No address provided</span>}</div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="flags" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Risk Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-base font-medium">Overall Risk Score</div>
                  <RiskBadge score={user.flags.riskScore} showText={true} />
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm font-medium">Risk Factors</div>
                  <div className="bg-muted p-3 rounded-md space-y-2">
                    <div className="flex items-center justify-between">
                      <div>High transaction amount</div>
                      <Badge variant={riskData.riskFactors.highAmount ? "destructive" : "outline"}>
                        {riskData.riskFactors.highAmount ? '+40 points' : '0 points'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>High-risk country</div>
                      <Badge variant={riskData.riskFactors.highRiskCountry ? "destructive" : "outline"}>
                        {riskData.riskFactors.highRiskCountry ? '+30 points' : '0 points'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>High transaction frequency</div>
                      <Badge variant={riskData.riskFactors.highFrequency ? "secondary" : "outline"}>
                        {riskData.riskFactors.highFrequency ? '+20 points' : '0 points'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>Incomplete KYC information</div>
                      <Badge variant={riskData.riskFactors.incompleteKYC ? "secondary" : "outline"}>
                        {riskData.riskFactors.incompleteKYC ? '+10 points' : '0 points'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="text-sm font-medium mb-2">Missing KYC Fields</div>
                  {riskData.missingKYCFields.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {riskData.missingKYCFields.map((field, index) => (
                        <Badge key={index} variant="outline">{field}</Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-green-600">No missing fields</div>
                  )}
                </div>

                <div className="pt-2">
                  <div className="text-sm font-medium mb-2">Transaction Countries</div>
                  <div className="flex flex-wrap gap-2">
                    {riskData.transactionCountries.map((country, index) => (
                      <Badge 
                        key={index} 
                        variant={country === 'Iran' || country === 'Somalia' ? "destructive" : "outline"}
                      >
                        {country}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">User Flags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <UserFlagsDisplay flags={user.flags} detailed />
                
                <div className="mt-4">
                  <SanctionIndicator isPep={user.flags.is_verified_pep} isSanctioned={user.flags.is_sanction_list} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockTransactions.map(tx => (
                        <TableRow key={tx.id}>
                          <TableCell className="font-medium">{tx.id}</TableCell>
                          <TableCell>{tx.date}</TableCell>
                          <TableCell>{tx.type}</TableCell>
                          <TableCell>{tx.amount.toLocaleString()} {tx.currency}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="mt-4 text-sm text-muted-foreground">
                  Showing last 3 of {riskData.transactionCount} transactions
                </div>

                <div className="flex justify-center mt-4">
                  <Button variant="outline" size="sm" disabled>
                    View All Transactions
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Transaction Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-muted rounded-md">
                    <div className="text-sm text-muted-foreground">Total Transactions</div>
                    <div className="text-2xl font-bold">{riskData.transactionCount}</div>
                  </div>
                  <div className="p-3 bg-muted rounded-md">
                    <div className="text-sm text-muted-foreground">Recent Amount</div>
                    <div className="text-2xl font-bold">{riskData.recentTransactionAmount.toLocaleString()} SEK</div>
                  </div>
                  <div className="p-3 bg-muted rounded-md">
                    <div className="text-sm text-muted-foreground">Countries</div>
                    <div className="text-2xl font-bold">{riskData.transactionCountries.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="verification" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Document Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <div>
                      <div className="font-medium">Identity Document</div>
                      <div className="text-xs text-muted-foreground">Uploaded: {mockDocuments.identityDocument.uploadDate}</div>
                    </div>
                    <Badge variant={mockDocuments.identityDocument.status === 'verified' ? "default" : "outline"}>
                      {mockDocuments.identityDocument.status === 'verified' ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <div>
                      <div className="font-medium">Address Proof</div>
                      <div className="text-xs text-muted-foreground">Uploaded: {mockDocuments.addressProof.uploadDate}</div>
                    </div>
                    <Badge variant="outline">Pending</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <div>
                      <div className="font-medium">Additional Documents</div>
                      <div className="text-xs text-muted-foreground">Not uploaded</div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Upload className="h-3 w-3 mr-1" />
                      Request
                    </Button>
                  </div>
                </div>

                <div className="flex justify-center mt-2">
                  <Button variant="outline" size="sm" disabled={user.flags.is_sanction_list}>
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    View Document Details
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">Add Verification Note</div>
              <Textarea
                placeholder="Enter verification notes here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={handleVerify}
                className="flex-1"
                variant="default"
                disabled={user.flags.is_sanction_list}
                title={user.flags.is_sanction_list ? "Cannot verify sanctioned users" : ""}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Mark as Verified
              </Button>
              <Button 
                onClick={handleReject}
                className="flex-1"
                variant="destructive"
              >
                <UserX className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button 
                onClick={handleRequestInfo}
                className="flex-1"
                variant="secondary"
              >
                <FileQuestion className="h-4 w-4 mr-2" />
                Request More Info
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailModal;
