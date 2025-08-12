
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Download,
  Calendar,
  User,
  Shield,
  Database,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye
} from 'lucide-react';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { useTranslation } from 'react-i18next';

const AuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [dateRange, setDateRange] = useState('last_7_days');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const { t } = useTranslation();

  const {
    logs,
    loading,
    stats,
    totalCount
  } = useAuditLogs({
    search: searchTerm,
    category: categoryFilter === 'all' ? undefined : categoryFilter,
    severity: severityFilter === 'all' ? undefined : severityFilter,
    dateRange,
    page: currentPage,
    limit: itemsPerPage
  });

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'authentication': return User;
      case 'authorization': return Shield;
      case 'data_access': return Database;
      case 'security': return AlertTriangle;
      default: return Clock;
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  const handleExportLogs = () => {
    // Implementation for exporting audit logs
    console.log('Exporting audit logs...');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('navigation.auditLogs')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('auditLogs.description')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportLogs}>
            <Download className="h-4 w-4 mr-2" />
            {t('common.export')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('auditLogs.totalEvents')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-sm text-muted-foreground">
              {t('auditLogs.last24Hours')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('auditLogs.securityEvents')}</CardTitle>
            <Shield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.securityEvents}</div>
            <p className="text-sm text-muted-foreground">
              {t('auditLogs.requiresReview')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('auditLogs.dataAccess')}</CardTitle>
            <Database className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.dataAccessEvents}</div>
            <p className="text-sm text-muted-foreground">
              {t('auditLogs.accessAttempts')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('auditLogs.failedLogins')}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.failedLogins}</div>
            <p className="text-sm text-muted-foreground">
              {t('auditLogs.possibleThreats')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('auditLogs.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t('auditLogs.category')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('auditLogs.allCategories')}</SelectItem>
              <SelectItem value="authentication">{t('auditLogs.authentication')}</SelectItem>
              <SelectItem value="authorization">{t('auditLogs.authorization')}</SelectItem>
              <SelectItem value="data_access">{t('auditLogs.dataAccess')}</SelectItem>
              <SelectItem value="security">{t('auditLogs.security')}</SelectItem>
              <SelectItem value="user_action">{t('auditLogs.userAction')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t('auditLogs.severity')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('auditLogs.allSeverities')}</SelectItem>
              <SelectItem value="critical">{t('auditLogs.critical')}</SelectItem>
              <SelectItem value="high">{t('auditLogs.high')}</SelectItem>
              <SelectItem value="medium">{t('auditLogs.medium')}</SelectItem>
              <SelectItem value="low">{t('auditLogs.low')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t('auditLogs.dateRange')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_24_hours">{t('auditLogs.last24Hours')}</SelectItem>
              <SelectItem value="last_7_days">{t('auditLogs.last7Days')}</SelectItem>
              <SelectItem value="last_30_days">{t('auditLogs.last30Days')}</SelectItem>
              <SelectItem value="last_90_days">{t('auditLogs.last90Days')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          {t('common.filters')}
        </Button>
      </div>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('auditLogs.recentLogs')}</CardTitle>
          <CardDescription>
            {t('auditLogs.recentLogsDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border">
                <div className="grid grid-cols-6 p-4 bg-muted/50 text-sm font-medium">
                  <div>{t('auditLogs.timestamp')}</div>
                  <div>{t('auditLogs.category')}</div>
                  <div>{t('auditLogs.action')}</div>
                  <div>{t('auditLogs.user')}</div>
                  <div>{t('auditLogs.severity')}</div>
                  <div>{t('common.actions')}</div>
                </div>
                <div className="divide-y">
                  {logs.map((log) => {
                    const CategoryIcon = getCategoryIcon(log.category);
                    return (
                      <div key={log.id} className="grid grid-cols-6 p-4 items-center hover:bg-muted/30">
                        <div className="text-sm">
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <CategoryIcon className="h-4 w-4" />
                          <span className="capitalize">{log.category.replace('_', ' ')}</span>
                        </div>
                        <div className="font-medium">{log.action}</div>
                        <div>{log.user_email || log.user_id || 'System'}</div>
                        <div>
                          <Badge variant={getSeverityBadgeVariant(log.severity)}>
                            {log.severity}
                          </Badge>
                        </div>
                        <div>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {t('auditLogs.showing')} {(currentPage - 1) * itemsPerPage + 1} {t('common.to')} {Math.min(currentPage * itemsPerPage, totalCount)} {t('common.of')} {totalCount} {t('auditLogs.entries')}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    {t('common.previous')}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    {t('common.next')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogs;
