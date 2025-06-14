
import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  AlertTriangle, 
  ArrowDownUp, 
  Check, 
  Download, 
  Filter, 
  Search, 
  X,
  Eye,
  Flag,
  FileText
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import TransactionDetails from '@/components/transactions/TransactionDetails';
import { Transaction } from '@/types/transaction';

// Mock transaction data with proper Transaction type
const initialMockTransactions: Transaction[] = [
  {
    id: "tx-123456",
    userId: "user-1",
    userName: "John Smith",
    amount: 5000,
    currency: "USD",
    timestamp: "2025-06-14T10:30:00Z",
    originCountry: "US",
    destinationCountry: "CA",
    method: "card",
    description: "Monthly Deposit",
    riskScore: 20,
    flagged: false,
  },
  {
    id: "tx-123457",
    userId: "user-2",
    userName: "Sarah Johnson",
    amount: 12500,
    currency: "USD",
    timestamp: "2025-06-13T14:20:00Z",
    originCountry: "US",
    destinationCountry: "GB",
    method: "bank",
    description: "Investment Transfer",
    riskScore: 35,
    flagged: false,
  },
  {
    id: "tx-123458",
    userId: "user-3",
    userName: "Business Account",
    amount: 35000,
    currency: "USD",
    timestamp: "2025-06-12T09:15:00Z",
    originCountry: "US",
    destinationCountry: "DE",
    method: "bank",
    description: "Invoice Payment #45678",
    riskScore: 65,
    flagged: false,
  },
  {
    id: "tx-123459",
    userId: "user-4",
    userName: "Thomas Wilson",
    amount: 7800,
    currency: "USD",
    timestamp: "2025-06-11T16:45:00Z",
    originCountry: "RU",
    destinationCountry: "US",
    method: "crypto",
    description: "Service Payment",
    riskScore: 85,
    flagged: true,
  },
  {
    id: "tx-123460",
    userId: "user-5",
    userName: "Emily Brown",
    amount: 3200,
    currency: "USD",
    timestamp: "2025-06-10T11:30:00Z",
    originCountry: "CA",
    destinationCountry: "US",
    method: "mobile",
    description: "Rent Payment",
    riskScore: 15,
    flagged: false,
  },
];

type SortField = 'timestamp' | 'amount' | 'riskScore' | 'id';
type SortOrder = 'asc' | 'desc';

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialMockTransactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();

  // Filter and sort transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions.filter(transaction => {
      const matchesSearch = (
        transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'flagged' && transaction.flagged) ||
        (statusFilter === 'completed' && !transaction.flagged);
      
      const matchesType = typeFilter === 'all' || transaction.method === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });

    // Sort transactions
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'timestamp':
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'riskScore':
          comparison = a.riskScore - b.riskScore;
          break;
        case 'id':
          comparison = a.id.localeCompare(b.id);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [transactions, searchTerm, statusFilter, typeFilter, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailsOpen(true);
  };

  const handleFlagTransaction = (transaction: Transaction) => {
    // Update the transaction's flagged state
    setTransactions(prevTransactions => 
      prevTransactions.map(t => 
        t.id === transaction.id 
          ? { ...t, flagged: !t.flagged }
          : t
      )
    );

    toast({
      title: transaction.flagged ? "Transaction Unflagged" : "Transaction Flagged",
      description: `Transaction ${transaction.id.substring(0, 8)}... has been ${transaction.flagged ? 'unflagged' : 'flagged for review'}`,
      variant: transaction.flagged ? "default" : "destructive",
    });
  };

  const handleCreateCase = (transaction: Transaction) => {
    toast({
      title: "Case Created",
      description: `Investigation case created for transaction ${transaction.id.substring(0, 8)}...`,
    });
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Date', 'User', 'Amount', 'Currency', 'Origin', 'Destination', 'Method', 'Risk Score', 'Flagged'].join(','),
      ...filteredAndSortedTransactions.map(tx => [
        tx.id,
        new Date(tx.timestamp).toLocaleDateString(),
        tx.userName,
        tx.amount,
        tx.currency,
        tx.originCountry,
        tx.destinationCountry,
        tx.method,
        tx.riskScore,
        tx.flagged ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `${filteredAndSortedTransactions.length} transactions exported to CSV`,
    });
  };

  const getStatusBadgeStyle = (transaction: Transaction) => {
    if (transaction.flagged) return 'bg-red-100 text-red-800';
    return 'bg-green-100 text-green-800';
  };

  const getRiskLevelStyle = (riskScore: number) => {
    if (riskScore < 30) return 'text-green-600';
    if (riskScore < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50" 
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center">
        {children}
        <ArrowDownUp className="ml-2 h-4 w-4" />
        {sortField === field && (
          <span className="ml-1 text-xs">
            {sortOrder === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </TableHead>
  );

  return (
    <DashboardLayout requiredRoles={['complianceOfficer', 'admin', 'executive']}>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            Monitor and review financial transactions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search transactions..."
              className="pl-8 w-full sm:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
                <SelectItem value="crypto">Crypto</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="outline" className="ml-auto" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export ({filteredAndSortedTransactions.length})
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Records</CardTitle>
            <CardDescription>
              View and monitor all financial transactions ({filteredAndSortedTransactions.length} found)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHeader field="id">ID</SortableHeader>
                    <SortableHeader field="timestamp">Date</SortableHeader>
                    <SortableHeader field="amount">Amount</SortableHeader>
                    <TableHead>Method</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Countries</TableHead>
                    <TableHead>Status</TableHead>
                    <SortableHeader field="riskScore">Risk</SortableHeader>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedTransactions.length > 0 ? (
                    filteredAndSortedTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium font-mono text-sm">
                          {transaction.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {new Date(transaction.timestamp).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: transaction.currency
                          }).format(transaction.amount)}
                        </TableCell>
                        <TableCell className="capitalize">
                          <Badge variant="outline">{transaction.method}</Badge>
                        </TableCell>
                        <TableCell>{transaction.userName}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="text-xs">{transaction.originCountry} → {transaction.destinationCountry}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeStyle(transaction)}>
                            {transaction.flagged && <AlertTriangle className="mr-1 h-3 w-3" />}
                            {!transaction.flagged && <Check className="mr-1 h-3 w-3" />}
                            {transaction.flagged ? 'Flagged' : 'Completed'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${getRiskLevelStyle(transaction.riskScore)}`}>
                            {transaction.riskScore}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewDetails(transaction)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button 
                              variant={transaction.flagged ? "default" : "outline"} 
                              size="sm"
                              onClick={() => handleFlagTransaction(transaction)}
                            >
                              <Flag className="h-4 w-4 mr-1" />
                              {transaction.flagged ? 'Flagged' : 'Flag'}
                            </Button>
                            <Button 
                              variant="secondary" 
                              size="sm"
                              onClick={() => handleCreateCase(transaction)}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Case
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No transactions found with the current filters
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <TransactionDetails
          transaction={selectedTransaction}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
        />
      </div>
    </DashboardLayout>
  );
};

export default Transactions;
