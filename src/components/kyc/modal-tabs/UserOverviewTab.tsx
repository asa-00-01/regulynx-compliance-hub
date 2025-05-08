
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { KYCUser, UserFlags } from '@/types/kyc';
import { User, Calendar, Mail, Phone, MapPin, Shield, FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import RiskBadge from '@/components/common/RiskBadge';
import { UserRiskData } from '@/hooks/useRiskCalculation';

interface UserOverviewTabProps {
  user: KYCUser & { flags: UserFlags };
  userRiskData: UserRiskData;
}

const UserOverviewTab: React.FC<UserOverviewTabProps> = ({ user, userRiskData }) => {
  return (
    <div className="space-y-4">
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
    </div>
  );
};

export default UserOverviewTab;
