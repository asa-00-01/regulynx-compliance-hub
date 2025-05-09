
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuditLog } from '@/types/supabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Download, Filter, Search, RefreshCw } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Helper function to get entity badge style
const getEntityBadgeStyle = (entity: string) => {
  switch (entity.toLowerCase()) {
    case 'document':
      return 'bg-blue-100 text-blue-800';
    case 'user':
      return 'bg-purple-100 text-purple-800';
    case 'case':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

interface AuditLogWithProfile extends AuditLog {
  user_name?: string;
  profiles?: {
    name?: string;
    [key: string]: any;
  } | null;
}

const AuditLogs = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  
  // Function to fetch audit logs with profiles joined
  const fetchAuditLogs = async () => {
    let query = supabase
      .from('audit_logs')
      .select(`
        *,
        profiles(name)
      `)
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);
    
    // Apply entity filter if selected
    if (entityFilter !== 'all') {
      query = query.eq('entity', entityFilter);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
    
    return data as AuditLogWithProfile[];
  };
  
  // Query for fetching audit logs
  const { data: auditLogs, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['auditLogs', page, entityFilter],
    queryFn: fetchAuditLogs,
  });
  
  // Function to filter logs based on search term
  const filteredLogs = React.useMemo(() => {
    if (!auditLogs) return [];
    
    if (!searchTerm) return auditLogs;
    
    return auditLogs.filter(log => {
      const searchString = searchTerm.toLowerCase();
      
      // Transform the data to include user_name
      let userName = 'System';
      
      // Check if profiles exists and has a name property
      if (log.profiles) {
        if (typeof log.profiles === 'object' && 'name' in log.profiles && log.profiles.name) {
          userName = log.profiles.name;
        }
      }
      
      // Search in various fields
      return (
        userName.toLowerCase().includes(searchString) ||
        log.action?.toLowerCase().includes(searchString) ||
        log.entity?.toLowerCase().includes(searchString) ||
        log.details?.toString().toLowerCase().includes(searchString)
      );
    });
  }, [auditLogs, searchTerm]);
  
  // Function to export audit logs as CSV
  const exportToCSV = () => {
    if (!auditLogs || auditLogs.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no audit logs to export.",
        variant: "destructive",
      });
      return;
    }
    
    // Transform data for CSV
    const csvData = auditLogs.map(log => {
      let userName = 'System';
      if (log.profiles && typeof log.profiles === 'object' && 'name' in log.profiles && log.profiles.name) {
        userName = log.profiles.name;
      }
      
      return {
        Date: new Date(log.created_at).toLocaleString(),
        User: userName,
        Action: log.action,
        Entity: log.entity,
        Details: JSON.stringify(log.details),
      };
    });
    
    // Create CSV content
    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => 
          `"${row[header as keyof typeof row]?.toString().replace(/"/g, '""') || ''}"`
        ).join(',')
      )
    ].join('\n');
    
    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `regulynx_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export successful",
      description: "Audit logs have been exported to CSV.",
    });
  };
  
  // Calculate total pages for pagination
  const totalPages = Math.ceil((auditLogs?.length || 0) / pageSize);

  return (
    <DashboardLayout requiredRoles={['admin', 'complianceOfficer']}>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">
            View and monitor system events and user actions
          </p>
        </div>
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search logs..."
                className="pl-8 w-full sm:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={entityFilter}
                onValueChange={setEntityFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by entity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="case">Cases</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="ghost" size="icon" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>
          
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export to CSV
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>System Audit Log</CardTitle>
            <CardDescription>
              Complete record of system events and user actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array(5).fill(null).map((_, i) => (
                  <div key={i} className="flex justify-between p-3 border rounded-md animate-pulse">
                    <div className="w-1/6 h-5 bg-muted rounded"></div>
                    <div className="w-1/6 h-5 bg-muted rounded"></div>
                    <div className="w-1/6 h-5 bg-muted rounded"></div>
                    <div className="w-1/4 h-5 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="p-4 border border-red-200 rounded-md bg-red-50 text-red-700">
                <p>Error loading audit logs: {(error as Error).message}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => refetch()}
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <div className="grid grid-cols-5 p-3 bg-muted/50 text-xs font-medium">
                  <div>Date & Time</div>
                  <div>User</div>
                  <div>Action</div>
                  <div>Entity</div>
                  <div>Details</div>
                </div>
                <div className="divide-y">
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => {
                      let userName = 'System';
                      if (log.profiles && typeof log.profiles === 'object' && 'name' in log.profiles && log.profiles.name) {
                        userName = log.profiles.name;
                      }
                      
                      return (
                        <div key={log.id} className="grid grid-cols-5 p-3 items-center">
                          <div className="text-sm">
                            {new Date(log.created_at).toLocaleString()}
                          </div>
                          <div className="font-medium">
                            {userName}
                          </div>
                          <div>
                            <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800">
                              {log.action}
                            </span>
                          </div>
                          <div>
                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getEntityBadgeStyle(log.entity)}`}>
                              {log.entity}
                            </span>
                          </div>
                          <div className="text-sm truncate max-w-xs" title={JSON.stringify(log.details)}>
                            {log.details ? JSON.stringify(log.details) : '-'}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-muted-foreground">No audit logs found</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {!isLoading && filteredLogs.length > 0 && (
              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                      let pageNum = i + 1;
                      
                      // If current page is > 3, adjust the pagination display
                      if (page > 3 && totalPages > 5) {
                        if (i === 0) {
                          pageNum = 1;
                        } else if (i === 1) {
                          return (
                            <PaginationItem key={i}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        } else {
                          pageNum = page + i - 3;
                          if (pageNum > totalPages) return null;
                        }
                      }
                      
                      return (
                        <PaginationItem key={i}>
                          <PaginationLink 
                            onClick={() => setPage(pageNum)}
                            isActive={pageNum === page}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AuditLogs;
