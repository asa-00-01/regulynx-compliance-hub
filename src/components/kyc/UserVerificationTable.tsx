
import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Flag, AlertTriangle, ArrowDown, ArrowUp, Loader2, FileText } from 'lucide-react';
import { KYCUser, UserFlags } from '@/types/kyc';
import UserDetailModal from './UserDetailModal';
import RiskBadge from '../common/RiskBadge';
import UserFlagsDisplay from './UserFlagsDisplay';
import { TooltipHelp } from '@/components/ui/tooltip-custom';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useRiskCalculation, UserRiskData } from '@/hooks/useRiskCalculation';

interface UserVerificationTableProps {
  users: (KYCUser & { flags: UserFlags })[];
  onSort?: (field: string) => void;
  sortField?: string;
  sortOrder?: string;
  isLoading?: boolean;
  flaggedUsers?: string[];
  onFlagUser?: (userId: string) => void;
  riskDataMap?: Map<string, UserRiskData>;
}

const UserVerificationTable = ({ 
  users, 
  onSort, 
  sortField = 'name', 
  sortOrder = 'asc',
  isLoading = false,
  flaggedUsers = [],
  onFlagUser
}: UserVerificationTableProps) => {
  const [selectedUser, setSelectedUser] = useState<(KYCUser & { flags: UserFlags }) | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Calculate risk data for all users at the component level
  const [riskDataMap, setRiskDataMap] = useState<Map<string, UserRiskData>>(new Map());
  
  // Use effect to calculate risk data for each user
  useEffect(() => {
    const calculateRiskData = async () => {
      const newRiskDataMap = new Map<string, UserRiskData>();
      
      if (!isLoading) {
        // Process each user sequentially to avoid hook rule violations
        for (const user of users) {
          const userRiskData = await calculateUserRiskData(user);
          newRiskDataMap.set(user.id, userRiskData);
        }
      }
      
      setRiskDataMap(newRiskDataMap);
    };
    
    calculateRiskData();
  }, [users, isLoading]);
  
  // Function to calculate risk data for a single user
  const calculateUserRiskData = (user: KYCUser & { flags: UserFlags }): UserRiskData => {
    // Mock transaction data
    const transactionCount = Math.floor(Math.random() * 20) + 1;
    const recentTransactionAmount = Math.floor(Math.random() * 49000) + 1000;
    const transactionCountries = (() => {
      const countries = ['Sweden', 'Norway', 'Russia', 'Germany', 'Iran', 'Somalia', 'USA'];
      const count = Math.floor(Math.random() * 3) + 1;
      const result = [];
      for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * countries.length);
        result.push(countries[randomIndex]);
      }
      return result;
    })();
    
    // Check for missing KYC fields
    const missingKYCFields = [];
    if (!user.phoneNumber) missingKYCFields.push('Phone Number');
    if (!user.address) missingKYCFields.push('Address');
    if (!user.identityNumber) missingKYCFields.push('Identity Number');
    if (!user.flags.is_email_confirmed) missingKYCFields.push('Email Confirmation');
    
    // Define high risk countries
    const HIGH_RISK_COUNTRIES = [
      { countryName: 'Iran', riskLevel: 'high' },
      { countryName: 'Somalia', riskLevel: 'high' },
      { countryName: 'Russia', riskLevel: 'high' }
    ];

    // Calculate risk factors
    const riskFactors = {
      highAmount: recentTransactionAmount > 10000,
      highRiskCountry: transactionCountries.some(country => 
        HIGH_RISK_COUNTRIES.some(riskCountry => 
          riskCountry.countryName === country && riskCountry.riskLevel === 'high'
        )
      ),
      highFrequency: transactionCount > 10,
      incompleteKYC: missingKYCFields.length > 0
    };
    
    // Calculate risk score based on risk factors
    let riskScore = 0;
    if (riskFactors.highAmount) riskScore += 40;
    if (riskFactors.highRiskCountry) riskScore += 30;
    if (riskFactors.highFrequency) riskScore += 20;
    if (riskFactors.incompleteKYC) riskScore += 10;
    
    // Add slight randomization (+/- 5 points)
    riskScore += Math.floor(Math.random() * 10) - 5;
    
    // Ensure score is within 0-100 range
    riskScore = Math.max(0, Math.min(100, riskScore));
    
    return {
      userId: user.id,
      riskScore,
      transactionCount,
      recentTransactionAmount,
      transactionCountries,
      missingKYCFields,
      riskFactors
    };
  };

  const handleViewDetails = (user: KYCUser & { flags: UserFlags }) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleCreateCase = (user: KYCUser & { flags: UserFlags }) => {
    setProcessingAction(user.id);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Case Created",
        description: `A compliance case has been created for ${user.fullName}.`
      });
      setProcessingAction(null);
    }, 1000);
  };

  const handleFlagUser = (user: KYCUser & { flags: UserFlags }) => {
    if (onFlagUser) {
      onFlagUser(user.id);
    }
  };

  const SortableHeader = ({ field, children }: { field: string, children: React.ReactNode }) => {
    const isActive = sortField === field;
    return (
      <div 
        className="flex items-center cursor-pointer" 
        onClick={() => onSort && onSort(field)}
      >
        {children}
        {isActive && (
          <span className="ml-1">
            {sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          </span>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Identity Number</TableHead>
                <TableHead>Flags</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>Transactions</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array(5).fill(0).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-9 w-32" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <SortableHeader field="name">Full Name</SortableHeader>
            </TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Identity Number</TableHead>
            <TableHead>Flags</TableHead>
            <TableHead>
              <SortableHeader field="risk">Risk Score</SortableHeader>
            </TableHead>
            <TableHead>Transactions</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => {
              const isFlagged = flaggedUsers?.includes(user.id);
              // Get risk data from the map
              const riskData = riskDataMap.get(user.id);
              
              return (
                <TableRow key={user.id} className={isFlagged ? "bg-yellow-50/30" : ""}>
                  <TableCell className="font-medium">
                    {user.fullName}
                    {user.flags.is_verified_pep && (
                      <TooltipHelp content="Politically Exposed Person - Enhanced due diligence required">
                        <Badge variant="warning" className="ml-2">PEP</Badge>
                      </TooltipHelp>
                    )}
                    {user.flags.is_sanction_list && (
                      <TooltipHelp content="This user appears on a sanctions list - All transactions are blocked">
                        <Badge variant="destructive" className="ml-2">Sanctioned</Badge>
                      </TooltipHelp>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.email}
                    {!user.flags.is_email_confirmed && (
                      <TooltipHelp content="Email address has not been verified">
                        <Badge variant="outline" className="ml-2">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Unconfirmed
                        </Badge>
                      </TooltipHelp>
                    )}
                  </TableCell>
                  <TableCell>{user.identityNumber || <span className="text-muted-foreground italic">Missing</span>}</TableCell>
                  <TableCell>
                    <UserFlagsDisplay flags={user.flags} />
                  </TableCell>
                  <TableCell>
                    {riskData && (
                      <TooltipHelp content={
                        <>
                          <div className="font-medium mb-1">Risk factors:</div>
                          <ul className="list-disc pl-4 space-y-1 text-xs">
                            {riskData.riskFactors.highAmount && <li>High transaction amount</li>}
                            {riskData.riskFactors.highRiskCountry && <li>High-risk countries</li>}
                            {riskData.riskFactors.highFrequency && <li>High transaction frequency</li>}
                            {riskData.riskFactors.incompleteKYC && <li>Incomplete KYC information</li>}
                          </ul>
                        </>
                      }>
                        <RiskBadge score={user.flags.riskScore} />
                      </TooltipHelp>
                    )}
                  </TableCell>
                  <TableCell>
                    {riskData && (
                      <div className="flex flex-col">
                        <span className="font-medium">{riskData.transactionCount} transactions</span>
                        <span className="text-xs text-muted-foreground">
                          Last: {riskData.recentTransactionAmount.toLocaleString()} SEK
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewDetails(user)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant={isFlagged ? "default" : "secondary"}
                        onClick={() => handleFlagUser(user)}
                        title={isFlagged ? "Remove flag" : "Flag for review"}
                      >
                        <Flag className="h-4 w-4 mr-1" />
                        {isFlagged ? 'Flagged' : 'Flag'}
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="default"
                        disabled={user.flags.is_sanction_list || processingAction === user.id}
                        onClick={() => handleCreateCase(user)}
                        title={user.flags.is_sanction_list ? "Actions limited for sanctioned users" : "Create compliance case"}
                      >
                        {processingAction === user.id ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <FileText className="h-4 w-4 mr-1" />
                        )}
                        Case
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          open={showDetailModal}
          onOpenChange={setShowDetailModal}
        />
      )}
    </div>
  );
};

export default UserVerificationTable;
