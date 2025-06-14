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
import { UserRiskData, calculateUserRiskData } from '@/hooks/useRiskCalculation';
import { usePagination } from '@/hooks/usePagination';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
  
  // Add pagination
  const {
    currentData: paginatedUsers,
    currentPage,
    totalPages,
    totalItems,
    goToPage,
    goToNextPage,
    goToPrevPage,
    hasNextPage,
    hasPrevPage,
    startIndex,
    endIndex
  } = usePagination({ 
    data: users, 
    itemsPerPage: 10 
  });
  
  // Use effect to calculate risk data for each user
  useEffect(() => {
    const calculateRiskData = async () => {
      const newRiskDataMap = new Map<string, UserRiskData>();
      
      if (!isLoading) {
        for (const user of users) {
          const userRiskData = calculateUserRiskData(user);
          newRiskDataMap.set(user.id, userRiskData);
        }
      }
      
      setRiskDataMap(newRiskDataMap);
    };
    
    calculateRiskData();
  }, [users, isLoading]);
  
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
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="h-12 px-6 font-semibold">Full Name</TableHead>
              <TableHead className="h-12 px-6 font-semibold">Email</TableHead>
              <TableHead className="h-12 px-6 font-semibold">Identity Number</TableHead>
              <TableHead className="h-12 px-6 font-semibold">Flags</TableHead>
              <TableHead className="h-12 px-6 font-semibold">Risk Score</TableHead>
              <TableHead className="h-12 px-6 font-semibold">Transactions</TableHead>
              <TableHead className="h-12 px-6 font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(5).fill(0).map((_, index) => (
              <TableRow key={index}>
                <TableCell className="px-6 py-4"><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell className="px-6 py-4"><Skeleton className="h-5 w-40" /></TableCell>
                <TableCell className="px-6 py-4"><Skeleton className="h-5 w-28" /></TableCell>
                <TableCell className="px-6 py-4"><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell className="px-6 py-4"><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell className="px-6 py-4"><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell className="px-6 py-4"><Skeleton className="h-9 w-32" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pagination Info */}
      {users.length > 0 && (
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <div>
            Showing {startIndex} to {endIndex} of {totalItems} users
          </div>
          <div>
            Page {currentPage} of {totalPages}
          </div>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="h-12 px-6 font-semibold">
                <SortableHeader field="name">Full Name</SortableHeader>
              </TableHead>
              <TableHead className="h-12 px-6 font-semibold">Email</TableHead>
              <TableHead className="h-12 px-6 font-semibold">Identity Number</TableHead>
              <TableHead className="h-12 px-6 font-semibold">Flags</TableHead>
              <TableHead className="h-12 px-6 font-semibold">
                <SortableHeader field="risk">Risk Score</SortableHeader>
              </TableHead>
              <TableHead className="h-12 px-6 font-semibold">Transactions</TableHead>
              <TableHead className="h-12 px-6 font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => {
                const isFlagged = flaggedUsers?.includes(user.id);
                // Get risk data from the map
                const riskData = riskDataMap.get(user.id);
                
                return (
                  <TableRow key={user.id} className={`border-b hover:bg-muted/30 ${isFlagged ? "bg-yellow-50/50" : ""}`}>
                    <TableCell className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900">{user.fullName}</div>
                        <div className="flex items-center gap-2">
                          {user.flags.is_verified_pep && (
                            <TooltipHelp content="Politically Exposed Person - Enhanced due diligence required">
                              <Badge variant="warning" className="text-xs">PEP</Badge>
                            </TooltipHelp>
                          )}
                          {user.flags.is_sanction_list && (
                            <TooltipHelp content="This user appears on a sanctions list - All transactions are blocked">
                              <Badge variant="destructive" className="text-xs">Sanctioned</Badge>
                            </TooltipHelp>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-900">{user.email}</div>
                        {!user.flags.is_email_confirmed && (
                          <TooltipHelp content="Email address has not been verified">
                            <Badge variant="outline" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Unconfirmed
                            </Badge>
                          </TooltipHelp>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {user.identityNumber || <span className="text-muted-foreground italic">Missing</span>}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <UserFlagsDisplay flags={user.flags} />
                    </TableCell>
                    <TableCell className="px-6 py-4">
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
                          <div className="inline-block">
                            <RiskBadge score={user.flags.riskScore} />
                          </div>
                        </TooltipHelp>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {riskData && (
                        <div className="space-y-1">
                          <div className="font-medium text-sm text-gray-900">
                            {riskData.transactionCount} transactions
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Last: {riskData.recentTransactionAmount.toLocaleString()} SEK
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleViewDetails(user)}
                          className="h-8"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Details
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant={isFlagged ? "default" : "secondary"}
                          onClick={() => handleFlagUser(user)}
                          title={isFlagged ? "Remove flag" : "Flag for review"}
                          className="h-8"
                        >
                          <Flag className="h-3 w-3 mr-1" />
                          {isFlagged ? 'Flagged' : 'Flag'}
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="default"
                          disabled={user.flags.is_sanction_list || processingAction === user.id}
                          onClick={() => handleCreateCase(user)}
                          title={user.flags.is_sanction_list ? "Actions limited for sanctioned users" : "Create compliance case"}
                          className="h-8"
                        >
                          {processingAction === user.id ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <FileText className="h-3 w-3 mr-1" />
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="border-t p-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={goToPrevPage}
                    className={!hasPrevPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    return page === 1 || 
                           page === totalPages || 
                           Math.abs(page - currentPage) <= 1;
                  })
                  .map((page, index, array) => {
                    const showEllipsisBefore = index > 0 && page - array[index - 1] > 1;
                    
                    return (
                      <React.Fragment key={page}>
                        {showEllipsisBefore && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                        <PaginationItem>
                          <PaginationLink
                            onClick={() => goToPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      </React.Fragment>
                    );
                  })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={goToNextPage}
                    className={!hasNextPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

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
