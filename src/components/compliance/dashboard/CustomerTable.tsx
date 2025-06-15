
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, FilePenLine, Flag, FileText } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getRiskScoreClass, getKYCStatusClass } from './dashboardUtils';
import { usePagination } from '@/hooks/usePagination';

type Customer = {
  id: string;
  name: string;
  email: string;
  kycStatus: string;
  riskScore: number;
  lastTransaction: string;
  country: string;
};

type PaginationResult = ReturnType<typeof usePagination<Customer>>;

interface CustomerTableProps {
  customers: Customer[];
  pagination: PaginationResult;
  onReview: (id: string) => void;
  onFlag: (id: string) => void;
  onCreateCase: (id: string) => void;
  onViewProfile: (id: string) => void;
}

const CustomerTable: React.FC<CustomerTableProps> = ({ 
  customers, 
  pagination, 
  onReview, 
  onFlag, 
  onCreateCase, 
  onViewProfile 
}) => {
  const {
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
  } = pagination;

  return (
    <>
      <div className="mt-4 flex justify-between items-center text-sm text-muted-foreground">
        <div>
          Showing {startIndex + 1} to {endIndex + 1} of {totalItems} customers
        </div>
        <div>
          Page {currentPage} of {totalPages}
        </div>
      </div>

      <div className="mt-6 rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>KYC Status</TableHead>
              <TableHead>Risk Score</TableHead>
              <TableHead>Last Transaction</TableHead>
              <TableHead>Country</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">
                  <div>
                    <div>{customer.name}</div>
                    <div className="text-xs text-muted-foreground">{customer.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getKYCStatusClass(
                      customer.kycStatus
                    )}`}
                  >
                    {customer.kycStatus.charAt(0).toUpperCase() + customer.kycStatus.slice(1).replace('_', ' ')}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getRiskScoreClass(
                      customer.riskScore
                    )}`}
                  >
                    {customer.riskScore}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(customer.lastTransaction).toLocaleDateString()}
                </TableCell>
                <TableCell>{customer.country}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onReview(customer.id)} title="Review">
                      <FilePenLine className="h-4 w-4" />
                      <span className="sr-only">Review</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onFlag(customer.id)} title="Flag">
                      <Flag className="h-4 w-4" />
                      <span className="sr-only">Flag</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onCreateCase(customer.id)} title="Create Case">
                      <FileText className="h-4 w-4" />
                      <span className="sr-only">Create Case</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onViewProfile(customer.id)} title="View Profile">
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View Profile</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

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
                    return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
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
    </>
  );
};

export default CustomerTable;
