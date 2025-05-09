
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Phone, Mail, Calendar, MapPin, FileText, AlertTriangle, Shield, CircleDollarSign } from 'lucide-react';
import { useCompliance } from '@/context/ComplianceContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import RiskBadge from '@/components/common/RiskBadge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import TransactionDetailsModal from '@/components/aml/TransactionDetailsModal';
import { AMLTransaction } from '@/types/aml';
import { ComplianceCaseDetails } from '@/types/case';

const UserCaseOverview: React.FC = () => {
  const { selectedUser, state, dispatch } = useCompliance();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTransaction, setSelectedTransaction] = useState<AMLTransaction | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  
  if (!selectedUser) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Please select a user to view their case overview</p>
        </CardContent>
      </Card>
    );
  }

  const handleViewTransactionDetails = (transaction: AMLTransaction) => {
    setSelectedTransaction(transaction);
    setDetailsModalOpen(true);
  };

  const handleCreateCase = (caseType: 'kyc' | 'aml' | 'sanctions') => {
    navigate('/compliance-cases', {
      state: {
        createCase: true,
        userData: {
          userId: selectedUser.id,
          userName: selectedUser.fullName,
          description: `Compliance review for user: ${selectedUser.fullName}`,
          type: caseType,
          source: 'manual',
          riskScore: selectedUser.riskScore,
        }
      }
    });
  };
  
  const handleNavigateToCase = (caseId: string) => {
    const caseItem = selectedUser.complianceCases.find(c => c.id === caseId);
    if (caseItem) {
      dispatch({ type: 'SET_SELECTED_CASE', payload: caseItem });
      navigate('/compliance-cases');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="w-full overflow-hidden">
        <div className="relative">
          {selectedUser.riskScore > 75 && (
            <div className="absolute top-0 right-0 bg-red-500 text-white px-4 py-1">
              High Risk User
            </div>
          )}
          
          <CardHeader className="bg-gray-50 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-full">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">{selectedUser.fullName}</CardTitle>
                <p className="text-sm text-muted-foreground">ID: {selectedUser.id}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {selectedUser.isPEP && (
                <Badge variant="warning" className="h-6">PEP</Badge>
              )}
              {selectedUser.isSanctioned && (
                <Badge variant="destructive" className="h-6">Sanctioned</Badge>
              )}
              <Badge variant={selectedUser.kycStatus === 'verified' ? 'default' : 'outline'} className="h-6">
                KYC: {selectedUser.kycStatus.replace('_', ' ')}
              </Badge>
              <RiskBadge score={selectedUser.riskScore} showText />
            </div>
          </CardHeader>
        </div>
        
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="cases">Compliance Cases</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedUser.email}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedUser.phoneNumber || 'Not provided'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">DOB: {selectedUser.dateOfBirth || 'Not provided'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedUser.address || 'No address on file'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Identity Number: {selectedUser.identityNumber || 'Not provided'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Risk Summary</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Risk Score</span>
                      <RiskBadge score={selectedUser.riskScore} showText />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">KYC Status</span>
                      <Badge variant={selectedUser.kycStatus === 'verified' ? 'default' : 'outline'}>
                        {selectedUser.kycStatus.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Documents</span>
                      <Badge variant="outline">{selectedUser.documents.length} submitted</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Transactions</span>
                      <Badge variant="outline">{selectedUser.transactions.length} total</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Open Cases</span>
                      <Badge variant="outline">
                        {selectedUser.complianceCases.filter(c => c.status === 'open').length} open
                      </Badge>
                    </div>
                  </div>
                  
                  {(selectedUser.isPEP || selectedUser.isSanctioned || selectedUser.riskScore > 75) && (
                    <div className="mt-4 p-3 border border-yellow-200 bg-yellow-50 rounded-md">
                      <div className="flex gap-2 text-yellow-800">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-medium">Risk Indicators:</span>
                      </div>
                      <ul className="ml-7 mt-2 list-disc text-sm space-y-1 text-yellow-800">
                        {selectedUser.isPEP && <li>Politically Exposed Person</li>}
                        {selectedUser.isSanctioned && <li>Appears on sanctions list</li>}
                        {selectedUser.riskScore > 75 && <li>High risk score</li>}
                        {!selectedUser.kycFlags.is_email_confirmed && <li>Email not verified</li>}
                        {selectedUser.transactions.some(t => t.isSuspect) && 
                          <li>Suspicious transaction history</li>}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button variant="default" onClick={() => handleCreateCase('kyc')}>
                  <Shield className="h-4 w-4 mr-2" />
                  Create KYC Case
                </Button>
                <Button variant="outline" onClick={() => handleCreateCase('aml')}>
                  <CircleDollarSign className="h-4 w-4 mr-2" />
                  Create AML Case
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => navigate(`/documents?userId=${selectedUser.id}`)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View Documents
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="documents">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <h3 className="text-lg font-semibold">User Documents</h3>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/documents?userId=${selectedUser.id}`)}
                  >
                    View All Documents
                  </Button>
                </div>
                
                {selectedUser.documents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No documents found for this user</p>
                  </div>
                ) : (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Document Type</TableHead>
                          <TableHead>File Name</TableHead>
                          <TableHead>Upload Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedUser.documents.map((doc) => (
                          <TableRow key={doc.id}>
                            <TableCell className="font-medium capitalize">{doc.type}</TableCell>
                            <TableCell>{doc.file_name}</TableCell>
                            <TableCell>{new Date(doc.upload_date).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  doc.status === 'verified'
                                    ? 'default'
                                    : doc.status === 'rejected'
                                    ? 'destructive'
                                    : 'outline'
                                }
                              >
                                {doc.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="transactions">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <h3 className="text-lg font-semibold">Transaction History</h3>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/aml-monitoring?userId=${selectedUser.id}`)}
                  >
                    View All Transactions
                  </Button>
                </div>
                
                {selectedUser.transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CircleDollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No transactions found for this user</p>
                  </div>
                ) : (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Destination</TableHead>
                          <TableHead>Risk Score</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedUser.transactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>
                              {new Date(transaction.timestamp).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {transaction.senderAmount} {transaction.senderCurrency}
                            </TableCell>
                            <TableCell>{transaction.receiverCountryCode}</TableCell>
                            <TableCell>
                              <RiskBadge score={transaction.riskScore} />
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewTransactionDetails(transaction)}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="cases">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <h3 className="text-lg font-semibold">Compliance Cases</h3>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/compliance-cases')}
                  >
                    View All Cases
                  </Button>
                </div>
                
                {selectedUser.complianceCases.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No compliance cases found for this user</p>
                    <Button 
                      className="mt-4" 
                      variant="outline"
                      onClick={() => handleCreateCase('kyc')}
                    >
                      Create New Case
                    </Button>
                  </div>
                ) : (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Case ID</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Risk Score</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedUser.complianceCases.map((caseItem) => (
                          <TableRow key={caseItem.id}>
                            <TableCell className="font-medium">
                              {caseItem.id.substring(0, 8)}...
                            </TableCell>
                            <TableCell className="capitalize">{caseItem.type}</TableCell>
                            <TableCell>
                              {formatDistanceToNow(new Date(caseItem.createdAt), { addSuffix: true })}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  caseItem.status === 'closed'
                                    ? 'default'
                                    : caseItem.status === 'escalated'
                                    ? 'destructive'
                                    : 'outline'
                                }
                              >
                                {caseItem.status.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <RiskBadge score={caseItem.riskScore} />
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleNavigateToCase(caseItem.id)}
                              >
                                View Case
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        transaction={selectedTransaction}
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        onFlag={() => {
          toast({
            title: 'Transaction Flagged',
            description: `Transaction has been flagged for review.`,
          });
          setDetailsModalOpen(false);
        }}
        onCreateCase={(transaction) => {
          if (transaction) {
            navigate('/compliance-cases', {
              state: {
                createCase: true,
                userData: {
                  userId: transaction.senderUserId,
                  userName: transaction.senderName,
                  description: `Suspicious transaction: ${transaction.id} - Amount: ${transaction.senderAmount} ${transaction.senderCurrency}`,
                  type: 'aml',
                  source: 'transaction_alert',
                  riskScore: transaction.riskScore,
                }
              }
            });
          }
          setDetailsModalOpen(false);
        }}
      />
    </div>
  );
};

export default UserCaseOverview;
