
import React from 'react';
import { User } from '@/types/user';
import { UnifiedUserData } from '@/context/compliance/types';
import { useCompliance } from '@/context/ComplianceContext';
import { FileText, User as UserIcon, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const UserCaseOverview: React.FC = () => {
  const { selectedUser } = useCompliance();

  if (!selectedUser) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <UserIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">No user selected</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Select a user to view their case overview.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRiskBadgeVariant = (score: number) => {
    if (score >= 70) return 'destructive';
    if (score >= 40) return 'secondary';
    return 'default';
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'verified': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      case 'information_requested': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* User Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            User Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <p className="text-sm font-medium">{selectedUser.fullName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-sm font-medium">{selectedUser.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                <p className="text-sm font-medium">{selectedUser.phoneNumber || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Country</label>
                <p className="text-sm font-medium">{selectedUser.countryOfResidence}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">KYC Status</label>
                <div className="mt-1">
                  <Badge variant={getStatusBadgeVariant(selectedUser.kycStatus)}>
                    {selectedUser.kycStatus}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Risk Score</label>
                <div className="mt-1">
                  <Badge variant={getRiskBadgeVariant(selectedUser.riskScore)}>
                    {selectedUser.riskScore}/100
                  </Badge>
                </div>
              </div>
              {selectedUser.isPEP && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-yellow-700">PEP (Politically Exposed Person)</span>
                </div>
              )}
              {selectedUser.isSanctioned && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-700">On Sanctions List</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documents ({selectedUser.documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedUser.documents && selectedUser.documents.length > 0 ? (
            <div className="space-y-3">
              {selectedUser.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">{doc.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded: {new Date(doc.upload_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getStatusBadgeVariant(doc.status)}>
                    {doc.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No documents found for this user.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transactions Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions ({selectedUser.transactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedUser.transactions && selectedUser.transactions.length > 0 ? (
            <div className="space-y-3">
              {selectedUser.transactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">
                      {tx.senderCurrency} {tx.senderAmount.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.timestamp).toLocaleDateString()} • {tx.status}
                    </p>
                  </div>
                  <Badge variant={tx.isSuspect ? 'destructive' : 'default'}>
                    Risk: {tx.riskScore}/100
                  </Badge>
                </div>
              ))}
              {selectedUser.transactions.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  +{selectedUser.transactions.length - 5} more transactions
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No transactions found for this user.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserCaseOverview;
