
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Eye, Download, Clock, FilePenLine, Flag, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock user activity data
const initialActivities = [
  {
    id: '1',
    userId: '101',
    userName: 'John Doe',
    action: 'document_upload',
    details: 'Uploaded passport document',
    timestamp: '2025-05-01T10:30:00Z',
    actor: 'user',
  },
  {
    id: '2',
    userId: '101',
    userName: 'John Doe',
    action: 'kyc_review',
    details: 'KYC documents reviewed and approved',
    timestamp: '2025-05-02T14:45:00Z',
    actor: 'admin',
    adminName: 'Alex Nordström',
  },
  {
    id: '3',
    userId: '102',
    userName: 'Sofia Rodriguez',
    action: 'profile_update',
    details: 'Updated address information',
    timestamp: '2025-05-03T09:15:00Z',
    actor: 'user',
  },
  {
    id: '4',
    userId: '102',
    userName: 'Sofia Rodriguez',
    action: 'flag_added',
    details: 'Account flagged for suspicious activity',
    timestamp: '2025-05-03T11:30:00Z',
    actor: 'admin',
    adminName: 'Johan Berg',
  },
  {
    id: '5',
    userId: '103',
    userName: 'Alexander Petrov',
    action: 'document_upload',
    details: 'Uploaded ID card',
    timestamp: '2025-05-03T13:20:00Z',
    actor: 'user',
  },
  {
    id: '6',
    userId: '103',
    userName: 'Alexander Petrov',
    action: 'kyc_review',
    details: 'KYC documents rejected - poor image quality',
    timestamp: '2025-05-03T15:40:00Z',
    actor: 'admin',
    adminName: 'Alex Nordström',
  },
  {
    id: '7',
    userId: '101',
    userName: 'John Doe',
    action: 'account_login',
    details: 'Successful login from new IP address',
    timestamp: '2025-05-04T08:10:00Z',
    actor: 'user',
  },
  {
    id: '8',
    userId: '104',
    userName: 'Jane Smith',
    action: 'transaction',
    details: 'Initiated transfer of 15,000 SEK to DE12345678',
    timestamp: '2025-05-04T09:25:00Z',
    actor: 'user',
  },
  {
    id: '9',
    userId: '104',
    userName: 'Jane Smith',
    action: 'flag_added',
    details: 'Large transaction flagged for review',
    timestamp: '2025-05-04T09:30:00Z',
    actor: 'system',
  },
  {
    id: '10',
    userId: '105',
    userName: 'Ahmed Hassan',
    action: 'document_upload',
    details: 'Uploaded proof of address',
    timestamp: '2025-05-04T11:15:00Z',
    actor: 'user',
  },
];

const UserActivityLogs = () => {
  const [activities, setActivities] = useState(initialActivities);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [actionTypeFilter, setActionTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { toast } = useToast();

  // Get unique users for the filter dropdown
  const uniqueUsers = Array.from(new Set(activities.map(activity => activity.userId)))
    .map(userId => {
      const user = activities.find(activity => activity.userId === userId);
      return {
        id: userId,
        name: user?.userName || 'Unknown User'
      };
    });

  // Filter activities based on selected filters
  const filteredActivities = activities.filter(activity => {
    const matchesUser = !selectedUser || activity.userId === selectedUser;
    const matchesActionType = actionTypeFilter === 'all' || activity.action === actionTypeFilter;
    const matchesSearch = !searchQuery || 
      activity.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.userName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesUser && matchesActionType && matchesSearch;
  });

  // Export to CSV
  const exportToCSV = () => {
    // In a real app, this would generate and download a CSV file
    // For demo purposes, we'll just show a toast
    toast({
      title: "CSV Export Started",
      description: "Your activity logs are being exported to CSV format"
    });
    
    // Simulate CSV generation delay
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Activity logs have been downloaded as CSV"
      });
    }, 1500);
  };

  // Helper function to get the action icon
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'document_upload':
        return <FilePenLine className="h-4 w-4 text-blue-500" />;
      case 'kyc_review':
        return <Eye className="h-4 w-4 text-green-500" />;
      case 'profile_update':
        return <FilePenLine className="h-4 w-4 text-blue-500" />;
      case 'flag_added':
        return <Flag className="h-4 w-4 text-red-500" />;
      case 'account_login':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'transaction':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <History className="h-4 w-4 text-gray-500" />;
    }
  };

  // Helper function to get formatted action name
  const getFormattedAction = (action: string) => {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Activity Logs</CardTitle>
              <CardDescription>
                Track user actions and compliance events
              </CardDescription>
            </div>
            <Button onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export to CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0 mb-6">
            <div className="w-full md:w-1/3">
              <label className="text-sm font-medium text-muted-foreground">
                Filter by User
              </label>
              <Select
                value={selectedUser || 'all'}
                onValueChange={(value) => setSelectedUser(value === 'all' ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {uniqueUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-1/3">
              <label className="text-sm font-medium text-muted-foreground">
                Filter by Action Type
              </label>
              <Select
                value={actionTypeFilter}
                onValueChange={setActionTypeFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="document_upload">Document Upload</SelectItem>
                  <SelectItem value="kyc_review">KYC Review</SelectItem>
                  <SelectItem value="profile_update">Profile Update</SelectItem>
                  <SelectItem value="flag_added">Flag Added</SelectItem>
                  <SelectItem value="account_login">Account Login</SelectItem>
                  <SelectItem value="transaction">Transaction</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-1/3">
              <label className="text-sm font-medium text-muted-foreground">
                Search
              </label>
              <Input
                type="text"
                placeholder="Search in details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Activity Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Actor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">No activities found</TableCell>
                  </TableRow>
                ) : (
                  filteredActivities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="font-mono text-xs">
                        {new Date(activity.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>{activity.userName}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getActionIcon(activity.action)}
                          <span className="ml-2">{getFormattedAction(activity.action)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{activity.details}</TableCell>
                      <TableCell>
                        {activity.actor === 'user' ? (
                          <span className="text-blue-600">Self</span>
                        ) : activity.actor === 'admin' ? (
                          <span className="text-green-600">{activity.adminName}</span>
                        ) : (
                          <span className="text-gray-600">System</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/50 px-6 py-3">
          <div className="text-xs text-muted-foreground">
            Showing {filteredActivities.length} of {activities.length} activities
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UserActivityLogs;
