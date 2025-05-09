
import React, { useState } from 'react';
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
  X 
} from 'lucide-react';

// Mock transaction data
const mockTransactions = [
  {
    id: "t123456",
    date: "2025-05-01",
    amount: 5000,
    type: "deposit",
    status: "completed",
    sender: "John Smith",
    receiver: "Sarah Johnson",
    reference: "Monthly Deposit",
    riskScore: 20,
  },
  {
    id: "t123457",
    date: "2025-05-02",
    amount: 12500,
    type: "withdrawal",
    status: "pending",
    sender: "Sarah Johnson",
    receiver: "Investment Account",
    reference: "Investment Transfer",
    riskScore: 35,
  },
  {
    id: "t123458",
    date: "2025-05-03",
    amount: 35000,
    type: "wire",
    status: "completed",
    sender: "Business Account",
    receiver: "Supplier Inc.",
    reference: "Invoice #45678",
    riskScore: 65,
  },
  {
    id: "t123459",
    date: "2025-05-04",
    amount: 7800,
    type: "deposit",
    status: "flagged",
    sender: "Unknown Source",
    receiver: "Thomas Wilson",
    reference: "Service Payment",
    riskScore: 85,
  },
  {
    id: "t123460",
    date: "2025-05-05",
    amount: 3200,
    type: "transfer",
    status: "completed",
    sender: "Emily Brown",
    receiver: "David Miller",
    reference: "Rent Payment",
    riskScore: 15,
  },
];

// Helper function to get status badge style
const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'flagged':
      return 'bg-red-100 text-red-800';
    case 'rejected':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
};

// Helper function to get risk level style
const getRiskLevelStyle = (riskScore: number) => {
  if (riskScore < 30) {
    return 'text-green-600';
  } else if (riskScore < 70) {
    return 'text-yellow-600';
  } else {
    return 'text-red-600';
  }
};

const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Filter transactions based on search term and filters
  const filteredTransactions = mockTransactions.filter(transaction => {
    const matchesSearch = (
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.receiver.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="deposit">Deposit</SelectItem>
                <SelectItem value="withdrawal">Withdrawal</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
                <SelectItem value="wire">Wire</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="outline" className="ml-auto">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Records</CardTitle>
            <CardDescription>
              View and monitor all financial transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">
                      <div className="flex items-center">
                        ID <ArrowDownUp className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center">
                        Date <ArrowDownUp className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center">
                        Amount <ArrowDownUp className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Sender</TableHead>
                    <TableHead>Receiver</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{transaction.id}</TableCell>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>
                          ${transaction.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="capitalize">{transaction.type}</TableCell>
                        <TableCell>{transaction.sender}</TableCell>
                        <TableCell>{transaction.receiver}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeStyle(transaction.status)}`}
                          >
                            {transaction.status === 'flagged' && <AlertTriangle className="mr-1 h-3 w-3" />}
                            {transaction.status === 'completed' && <Check className="mr-1 h-3 w-3" />}
                            {transaction.status === 'rejected' && <X className="mr-1 h-3 w-3" />}
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${getRiskLevelStyle(transaction.riskScore)}`}>
                            {transaction.riskScore}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-4 text-muted-foreground">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Transactions;
