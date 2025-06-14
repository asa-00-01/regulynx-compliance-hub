
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuditLog } from '@/types/supabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Download, Filter, Search, RefreshCw, Calendar, User, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Helper function to get entity badge style
const getEntityBadgeStyle = (entity: string) => {
  switch (entity.toLowerCase()) {
    case 'document':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case 'user':
      return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
    case 'case':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'transaction':
      return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

const getActionBadgeStyle = (action: string) => {
  switch (action.toLowerCase()) {
    case 'create':
    case 'upload':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'update':
    case 'modify':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case 'delete':
    case 'remove':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    case 'view':
    case 'access':
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    default:
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
  }
};

interface AuditLogWithProfile extends AuditLog {
  user_name?: string;
}

const AuditLogs = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  // Function to fetch audit logs with enhanced filtering
  const fetchAuditLogs = async () => {
    let auditQuery = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Apply date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;
      
      switch (dateRange) {
        case '1h':
          startDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }
      
      auditQuery = auditQuery.gte('created_at', startDate.toISOString());
    }
    
    // Apply entity filter
    if (entityFilter !== 'all') {
      auditQuery = auditQuery.eq('entity', entityFilter);
    }
    
    // Apply action filter
    if (actionFilter !== 'all') {
      auditQuery = auditQuery.ilike('action', `%${actionFilter}%`);
    }
    
    // Apply user filter
    if (userFilter !== 'all') {
      auditQuery = auditQuery.eq('user_id', userFilter);
    }
    
    // Apply pagination
    auditQuery = auditQuery.range((page - 1) * pageSize, page * pageSize - 1);
    
    const { data: auditLogs, error: auditError, count } = await auditQuery;
    
    if (auditError) {
      console.error('Error fetching audit logs:', auditError);
      throw auditError;
    }
    
    // Get unique user IDs from audit logs
    const userIds = Array.from(new Set(
      auditLogs
        ?.filter(log => log.user_id)
        .map(log => log.user_id)
    )) as string[];
    
    // Fetch profiles for these user IDs
    let profiles: any[] = [];
    if (userIds.length > 0) {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', userIds);
      
      if (!profilesError) {
        profiles = profilesData || [];
      }
    }
    
    // Create a map for quick profile lookup
    const profileMap = new Map(profiles.map(profile => [profile.id, profile.name]));
    
    // Combine audit logs with user names
    const auditLogsWithProfiles: AuditLogWithProfile[] = auditLogs?.map(log => ({
      ...log,
      user_name: log.user_id ? profileMap.get(log.user_id) : undefined
    })) || [];
    
    return { data: auditLogsWithProfiles, count: count || 0 };
  };
  
  // Fetch users for the user filter dropdown
  const fetchUsers = async () => {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, name')
      .order('name');
    
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    
    return profiles || [];
  };
  
  // Query for fetching audit logs
  const { data: auditResult, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['auditLogs', page, pageSize, entityFilter, actionFilter, userFilter, dateRange],
    queryFn: fetchAuditLogs,
  });
  
  // Query for fetching users
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });
  
  const auditLogs = auditResult?.data || [];
  const totalCount = auditResult?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  
  // Function to filter logs based on search term
  const filteredLogs = React.useMemo(() => {
    if (!searchTerm) return auditLogs;
    
    return auditLogs.filter(log => {
      const searchString = searchTerm.toLowerCase();
      const userName = log.user_name || 'System';
      
      return (
        userName.toLowerCase().includes(searchString) ||
        log.action?.toLowerCase().includes(searchString) ||
        log.entity?.toLowerCase().includes(searchString) ||
        JSON.stringify(log.details)?.toLowerCase().includes(searchString)
      );
    });
  }, [auditLogs, searchTerm]);
  
  // Function to export all audit logs as CSV
  const exportToCSV = async () => {
    try {
      toast({
        title: "Export started",
        description: "Fetching all audit logs for export...",
      });
      
      // Fetch all logs without pagination for export
      let allLogsQuery = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Apply the same filters as the current view
      if (dateRange !== 'all') {
        const now = new Date();
        let startDate: Date;
        
        switch (dateRange) {
          case '1h':
            startDate = new Date(now.getTime() - 60 * 60 * 1000);
            break;
          case '24h':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case '7d':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30d':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        }
        
        allLogsQuery = allLogsQuery.gte('created_at', startDate.toISOString());
      }
      
      if (entityFilter !== 'all') {
        allLogsQuery = allLogsQuery.eq('entity', entityFilter);
      }
      
      if (actionFilter !== 'all') {
        allLogsQuery = allLogsQuery.ilike('action', `%${actionFilter}%`);
      }
      
      if (userFilter !== 'all') {
        allLogsQuery = allLogsQuery.eq('user_id', userFilter);
      }
      
      const { data: allLogs, error } = await allLogsQuery;
      
      if (error) {
        throw error;
      }
      
      if (!allLogs || allLogs.length === 0) {
        toast({
          title: "No data to export",
          description: "There are no audit logs matching your current filters.",
          variant: "destructive",
        });
        return;
      }
      
      // Get user names for all logs
      const userIds = Array.from(new Set(
        allLogs
          .filter(log => log.user_id)
          .map(log => log.user_id)
      )) as string[];
      
      let profileMap = new Map();
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', userIds);
        
        if (profilesData) {
          profileMap = new Map(profilesData.map(profile => [profile.id, profile.name]));
        }
      }
      
      // Transform data for CSV
      const csvData = allLogs.map(log => ({
        'Date & Time': new Date(log.created_at).toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short'
        }),
        'User': log.user_id ? (profileMap.get(log.user_id) || 'Unknown User') : 'System',
        'Action': log.action || '',
        'Entity': log.entity || '',
        'Entity ID': log.entity_id || '',
        'Details': log.details ? JSON.stringify(log.details) : '',
        'Log ID': log.id
      }));
      
      // Create CSV content
      const headers = Object.keys(csvData[0]);
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row]?.toString() || '';
            // Escape quotes and wrap in quotes if contains comma, quote, or newline
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');
      
      // Create and download the CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `audit_logs_${timestamp}_${allLogs.length}_records.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export successful",
        description: `${allLogs.length} audit logs exported to ${filename}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "There was an error exporting the audit logs. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setEntityFilter('all');
    setActionFilter('all');
    setUserFilter('all');
    setDateRange('all');
    setPage(1);
  };

  return (
    <DashboardLayout requiredRoles={['admin', 'complianceOfficer']}>
      <div className="space-y-6 p-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">System Audit Log</h1>
          <p className="text-muted-foreground">
            Monitor all system activities and user actions with detailed logging and filtering
          </p>
        </div>
        
        {/* Enhanced Filters Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
            <CardDescription>
              Filter audit logs by various criteria to find specific events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Search className="h-4 w-4" />
                  Search
                </label>
                <Input
                  type="search"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Time Range
                </label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="1h">Last Hour</SelectItem>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Entity Type</label>
                <Select value={entityFilter} onValueChange={setEntityFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Entities</SelectItem>
                    <SelectItem value="document">Documents</SelectItem>
                    <SelectItem value="user">Users</SelectItem>
                    <SelectItem value="case">Cases</SelectItem>
                    <SelectItem value="transaction">Transactions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Activity className="h-4 w-4" />
                  Action Type
                </label>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                    <SelectItem value="view">View</SelectItem>
                    <SelectItem value="upload">Upload</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <User className="h-4 w-4" />
                  User
                </label>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Page Size</label>
                <Select value={pageSize.toString()} onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPage(1);
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 per page</SelectItem>
                    <SelectItem value="20">20 per page</SelectItem>
                    <SelectItem value="50">50 per page</SelectItem>
                    <SelectItem value="100">100 per page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={clearFilters}>
                Clear All Filters
              </Button>
              <Button variant="ghost" size="icon" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Results and Export Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Showing {filteredLogs.length} of {totalCount} total audit logs
            {searchTerm && ` (filtered by "${searchTerm}")`}
          </div>
          
          <Button onClick={exportToCSV} disabled={isLoading || filteredLogs.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export to CSV
          </Button>
        </div>
        
        {/* Audit Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Audit Log Entries</CardTitle>
            <CardDescription>
              Detailed system activity and user action history
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array(pageSize).fill(null).map((_, i) => (
                  <div key={i} className="flex justify-between p-4 border rounded-md animate-pulse">
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                      <div className="h-3 bg-muted rounded w-1/6"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-20"></div>
                      <div className="h-3 bg-muted rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="p-6 border border-red-200 rounded-md bg-red-50 text-red-700">
                <p className="font-medium">Error loading audit logs</p>
                <p className="text-sm mt-1">{(error as Error).message}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => refetch()}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Date & Time</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead className="max-w-xs">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.length > 0 ? (
                      filteredLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-xs">
                            {new Date(log.created_at).toLocaleString('en-US', {
                              month: 'short',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </TableCell>
                          <TableCell className="font-medium">
                            {log.user_name || 'System'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={getActionBadgeStyle(log.action)}>
                              {log.action}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getEntityBadgeStyle(log.entity)}>
                              {log.entity}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate text-sm" title={JSON.stringify(log.details)}>
                              {log.details ? JSON.stringify(log.details) : '-'}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="text-muted-foreground">
                            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No audit logs found</p>
                            <p className="text-sm">Try adjusting your filters or search criteria</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Page {page} of {totalPages} ({totalCount} total records)
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AuditLogs;
