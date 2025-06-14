
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/types/transaction';
import { formatCurrency } from '@/lib/utils';
import { HIGH_RISK_COUNTRIES } from './mockTransactionData';
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

interface TransactionTableProps {
  transactions: Transaction[];
  onViewTransaction?: (transaction: Transaction) => void;
}

const TransactionTable = ({ transactions, onViewTransaction }: TransactionTableProps) => {
  // Add pagination
  const {
    currentData: paginatedTransactions,
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
    data: transactions, 
    itemsPerPage: 15 
  });

  // Function to get badge variant based on risk score
  const getRiskBadgeVariant = (score: number) => {
    if (score >= 75) return "destructive";
    if (score >= 50) return "warning";
    if (score >= 25) return "secondary";
    return "outline";
  };

  // Function to get country badge variant
  const getCountryBadgeVariant = (country: string) => {
    return HIGH_RISK_COUNTRIES.includes(country) ? "destructive" : "outline";
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="space-y-4">
      {/* Pagination Info */}
      {transactions.length > 0 && (
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <div>
            Showing {startIndex} to {endIndex} of {totalItems} transactions
          </div>
          <div>
            Page {currentPage} of {totalPages}
          </div>
        </div>
      )}

      <div className="border rounded-md">
        <div className="max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Countries</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Risk Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTransactions.map((transaction) => (
                  <TableRow 
                    key={transaction.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onViewTransaction?.(transaction)}
                  >
                    <TableCell className="font-mono text-xs">
                      {transaction.id}
                    </TableCell>
                    <TableCell>{transaction.userName}</TableCell>
                    <TableCell>
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(transaction.timestamp)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={getCountryBadgeVariant(transaction.originCountry)} className="w-fit">
                          {transaction.originCountry}
                        </Badge>
                        <Badge variant={getCountryBadgeVariant(transaction.destinationCountry)} className="w-fit">
                          {transaction.destinationCountry}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {transaction.method}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRiskBadgeVariant(transaction.riskScore)}>
                        {transaction.riskScore}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

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
    </div>
  );
};

export default TransactionTable;
