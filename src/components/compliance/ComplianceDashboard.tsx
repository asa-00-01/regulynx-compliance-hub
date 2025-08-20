
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/AuthContext';
import { useComplianceContext } from '@/context/compliance/ComplianceContext';
import { AlertTriangle, Shield, Clock, CheckCircle, Users, Activity, TrendingUp, Search, Filter } from 'lucide-react';
import ComplianceUserList from './ComplianceUserList';
import IntegratedComplianceDashboard from './IntegratedComplianceDashboard';
import ComplianceFilters from './ComplianceFilters';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import NotificationBell from '@/components/layout/NotificationBell';
import UserNav from '@/components/layout/UserNav';

const ComplianceDashboard: React.FC = () => {
  const { user } = useAuth();
  const {
    state: { 
      users, 
      selectedUser, 
      filters, 
      loading, 
      error,
      metrics 
    },
    actions: { 
      loadUsers, 
      selectUser, 
      updateFilters,
      refreshMetrics 
    }
  } = useComplianceContext();

  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadUsers();
    refreshMetrics();
  }, [loadUsers, refreshMetrics]);

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserSelect = (userId: string) => {
    const selected = users.find(u => u.id === userId);
    if (selected) {
      selectUser(selected);
      setActiveTab('user-details');
    }
  };

  const handleRefresh = async () => {
    try {
      await Promise.all([loadUsers(), refreshMetrics()]);
      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading compliance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compliance Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage compliance activities across your organization
          </p>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <UserNav />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{metrics.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Risk</p>
                <p className="text-2xl font-bold">{metrics.highRiskUsers}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending KYC</p>
                <p className="text-2xl font-bold">{metrics.pendingKYC}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Verified</p>
                <p className="text-2xl font-bold">{metrics.verifiedUsers}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            {selectedUser && (
              <TabsTrigger value="user-details">User Details</TabsTrigger>
            )}
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              Refresh
            </Button>
          </div>
        </div>

        {showFilters && (
          <Card>
            <CardContent className="pt-6">
              <ComplianceFilters
                filters={filters}
                onFiltersChange={updateFilters}
              />
            </CardContent>
          </Card>
        )}

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Low Risk (0-25)</span>
                    <span className="text-sm text-muted-foreground">
                      {users.filter(u => u.riskScore <= 25).length}
                    </span>
                  </div>
                  <Progress value={25} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Medium Risk (26-50)</span>
                    <span className="text-sm text-muted-foreground">
                      {users.filter(u => u.riskScore > 25 && u.riskScore <= 50).length}
                    </span>
                  </div>
                  <Progress value={50} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">High Risk (51-75)</span>
                    <span className="text-sm text-muted-foreground">
                      {users.filter(u => u.riskScore > 50 && u.riskScore <= 75).length}
                    </span>
                  </div>
                  <Progress value={75} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Critical Risk (76-100)</span>
                    <span className="text-sm text-muted-foreground">
                      {users.filter(u => u.riskScore > 75).length}
                    </span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* KYC Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle>KYC Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['verified', 'pending', 'rejected', 'information_requested'].map((status) => {
                    const count = users.filter(u => u.kycStatus === status).length;
                    const percentage = users.length > 0 ? (count / users.length) * 100 : 0;
                    
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={status === 'verified' ? 'default' : 'secondary'}>
                            {status.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {count} users
                          </span>
                        </div>
                        <span className="text-sm font-medium">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent High-Risk Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                {users
                  .filter(u => u.riskScore > 75)
                  .slice(0, 10)
                  .map(user => (
                    <div key={user.id} className="mb-4 last:mb-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <div>
                            <p className="text-sm font-medium">{user.fullName}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">Risk: {user.riskScore}</Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUserSelect(user.id)}
                          >
                            Review
                          </Button>
                        </div>
                      </div>
                      <Separator className="mt-2" />
                    </div>
                  ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <ComplianceUserList
            users={filteredUsers}
            onUserSelect={handleUserSelect}
            selectedUserId={selectedUser?.id}
          />
        </TabsContent>

        {selectedUser && (
          <TabsContent value="user-details" className="space-y-4">
            <IntegratedComplianceDashboard user={selectedUser} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default ComplianceDashboard;
