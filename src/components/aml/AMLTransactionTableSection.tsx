
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TransactionsOverviewTable from './TransactionsOverviewTable';
import { AMLTransaction } from '@/types/aml';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface AMLTransactionTableSectionProps {
  filteredTransactions: AMLTransaction[];
  onViewDetails: (transaction: AMLTransaction) => void;
  onFlagTransaction: (transaction: AMLTransaction) => void;
  onCreateCase: (transaction: AMLTransaction) => void;
  showUserColumn: boolean;
  // Pagination props
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  startIndex: number;
  endIndex: number;
  totalItems: number;
}

const AMLTransactionTableSection: React.FC<AMLTransactionTableSectionProps> = ({
  filteredTransactions,
  onViewDetails,
  onFlagTransaction,
  onCreateCase,
  showUserColumn,
  currentPage,
  totalPages,
  goToPage,
  goToNextPage,
  goToPrevPage,
  hasNextPage,
  hasPrevPage,
  startIndex,
  endIndex,
  totalItems,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AML Transaction Monitoring</CardTitle>
        <CardDescription>
          Review transactions for suspicious activity and compliance violations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TransactionsOverviewTable
          transactions={filteredTransactions}
          onViewDetails={onViewDetails}
          onFlagTransaction={onFlagTransaction}
          onCreateCase={onCreateCase}
          showUserColumn={showUserColumn}
        />
      </CardContent>
      {totalPages > 1 && (
        <div className="border-t p-4 flex items-center justify-between flex-wrap gap-2">
            <div className="text-sm text-muted-foreground">
                Showing {startIndex} to {endIndex} of {totalItems} transactions.
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={(e) => { e.preventDefault(); goToPrevPage(); }}
                    href="#"
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
                            onClick={(e) => { e.preventDefault(); goToPage(page); }}
                            href="#"
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
                    onClick={(e) => { e.preventDefault(); goToNextPage(); }}
                    href="#"
                    className={!hasNextPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
        </div>
      )}
    </Card>
  );
};

export default AMLTransactionTableSection;
