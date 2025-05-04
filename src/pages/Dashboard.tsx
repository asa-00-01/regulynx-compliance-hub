
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserRole, DashboardMetrics, Document, ComplianceCase } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, Clock, FileText, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for dashboard metrics
const getMockDashboardData = (): DashboardMetrics => ({
  pendingDocuments: 18,
  pendingKycReviews: 12,
  activeAlerts: 7,
  riskScoreTrend: [65, 59, 80, 81, 56, 55, 72, 68],
  complianceCasesByType: {
    kyc: 8,
    aml: 5,
    sanctions: 2,
  },
});

// Mock data for recent documents
const getMockRecentDocuments = (): Document[] => [
  {
    id: '1',
    userId: '101',
    type: 'passport',
    fileName: 'passport_john_doe.pdf',
    uploadDate: '2025-05-01T10:30:00Z',
    status: 'pending',
  },
  {
    id: '2',
    userId: '102',
    type: 'id',
    fileName: 'national_id_anna.jpg',
    uploadDate: '2025-05-02T09:15:00Z',
    status: 'verified',
    verifiedBy: '1',
    verificationDate: '2025-05-02T14:20:00Z',
  },
  {
    id: '3',
    userId: '103',
    type: 'license',
    fileName: 'drivers_license_mikhail.png',
    uploadDate: '2025-05-03T11:45:00Z',
    status: 'rejected',
    verifiedBy: '1',
    verificationDate: '2025-05-03T16:30:00Z',
  },
  {
    id: '4',
    userId: '104',
    type: 'passport',
    fileName: 'passport_sarah.pdf',
    uploadDate: '2025-05-03T13:10:00Z',
    status: 'pending',
  },
];

// Mock data for compliance cases
const getMockComplianceCases = (): ComplianceCase[] => [
  {
    id: '1',
    userId: '101',
    createdAt: '2025-05-01T08:30:00Z',
    type: 'kyc',
    status: 'open',
    riskScore: 75,
    description: 'Inconsistent identity information',
    assignedTo: '1',
  },
  {
    id: '2',
    userId: '105',
    createdAt: '2025-05-02T10:15:00Z',
    type: 'aml',
    status: 'escalated',
    riskScore: 92,
    description: 'Multiple high-value transactions from high-risk country',
    assignedTo: '1',
  },
  {
    id: '3',
    userId: '107',
    createdAt: '2025-05-02T14:45:00Z',
    type: 'sanctions',
    status: 'open',
    riskScore: 85,
    description: 'Potential sanctions list match',
    assignedTo: '1',
  },
];

// Mock data for risk score chart
const getRiskScoreData = () => {
  const data = [];
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      score: Math.floor(Math.random() * 20) + 60,
    });
  }
  return data;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [complianceCases, setComplianceCases] = useState<ComplianceCase[]>([]);
  const [riskScoreData, setRiskScoreData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API calls to fetch dashboard data
    setTimeout(() => {
      setMetrics(getMockDashboardData());
      setRecentDocuments(getMockRecentDocuments());
      setComplianceCases(getMockComplianceCases());
      setRiskScoreData(getRiskScoreData());
      setLoading(false);
    }, 800);
  }, []);

  // Get role-specific stats to highlight
  const getHighlightedStats = () => {
    if (!metrics) return [];

    switch (user?.role) {
      case 'complianceOfficer':
        return [
          {
            title: 'Pending Reviews',
            value: metrics.pendingKycReviews,
            change: '+2',
            changeType: 'increase',
            icon: Clock,
          },
          {
            title: 'High Risk Cases',
            value: 5,
            change: '-1',
            changeType: 'decrease',
            icon: AlertCircle,
          },
          {
            title: 'Pending Documents',
            value: metrics.pendingDocuments,
            change: '+3',
            changeType: 'increase',
            icon: FileText,
          },
          {
            title: 'Active Alerts',
            value: metrics.activeAlerts,
            change: '+1',
            changeType: 'increase',
            icon: AlertCircle,
          },
        ];
      case 'admin':
        return [
          {
            title: 'Active Users',
            value: 42,
            change: '+3',
            changeType: 'increase',
            icon: AlertCircle,
          },
          {
            title: 'System Alerts',
            value: 2,
            change: '-1',
            changeType: 'decrease',
            icon: AlertCircle,
          },
          {
            title: 'Pending Documents',
            value: metrics.pendingDocuments,
            change: '+3',
            changeType: 'increase',
            icon: FileText,
          },
          {
            title: 'Active Roles',
            value: 4,
            change: '0',
            changeType: 'neutral',
            icon: AlertCircle,
          },
        ];
      case 'executive':
        return [
          {
            title: 'Average Risk Score',
            value: 68,
            change: '-3',
            changeType: 'decrease',
            icon: AlertCircle,
          },
          {
            title: 'Open Cases',
            value: 15,
            change: '+2',
            changeType: 'increase',
            icon: Clock,
          },
          {
            title: 'Escalated Issues',
            value: 3,
            change: '+1',
            changeType: 'increase',
            icon: AlertCircle,
          },
          {
            title: 'Compliance Rate',
            value: '94%',
            change: '+2%',
            changeType: 'increase',
            icon: AlertCircle,
          },
        ];
      case 'support':
        return [
          {
            title: 'Customer Tickets',
            value: 8,
            change: '+1',
            changeType: 'increase',
            icon: AlertCircle,
          },
          {
            title: 'Pending Documents',
            value: metrics.pendingDocuments,
            change: '+3',
            changeType: 'increase',
            icon: FileText,
          },
          {
            title: 'Average Response Time',
            value: '1.2h',
            change: '-0.3h',
            changeType: 'decrease',
            icon: Clock,
          },
          {
            title: 'Active Alerts',
            value: metrics.activeAlerts,
            change: '+1',
            changeType: 'increase',
            icon: AlertCircle,
          },
        ];
      default:
        return [];
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}. Here's your compliance overview for today.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array(4).fill(null).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 w-1/2 bg-muted rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-1/3 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {getHighlightedStats().map((stat, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.changeType === 'increase' ? (
                      <span className="flex items-center text-regulynx-red-alert">
                        <ArrowUpRight className="mr-1 h-3 w-3" />
                        {stat.change} since yesterday
                      </span>
                    ) : stat.changeType === 'decrease' ? (
                      <span className="flex items-center text-regulynx-green-accent">
                        <ArrowDownRight className="mr-1 h-3 w-3" />
                        {stat.change} since yesterday
                      </span>
                    ) : (
                      <span className="flex items-center text-muted-foreground">
                        No change since yesterday
                      </span>
                    )}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Risk Score Trend</CardTitle>
              <CardDescription>30-day historical view of average risk scores</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {loading ? (
                <div className="h-full w-full bg-muted/20 animate-pulse rounded-md"></div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={riskScoreData}>
                    <defs>
                      <linearGradient id="riskScoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1EAEDB" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#1EAEDB" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(tick) => {
                        const date = new Date(tick);
                        return `${date.getDate()}/${date.getMonth() + 1}`;
                      }}
                      tick={{fontSize: 12}}
                    />
                    <YAxis domain={[40, 100]} tick={{fontSize: 12}} />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#1EAEDB" 
                      fillOpacity={1} 
                      fill="url(#riskScoreGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compliance Cases</CardTitle>
              <CardDescription>Open cases by risk level</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="high">High Risk</TabsTrigger>
                  <TabsTrigger value="assigned">My Cases</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="space-y-4 mt-4">
                  {loading ? (
                    <div className="space-y-3">
                      {Array(3).fill(null).map((_, i) => (
                        <div key={i} className="flex justify-between p-3 border rounded-md">
                          <div className="w-2/3 h-4 bg-muted rounded animate-pulse"></div>
                          <div className="w-1/4 h-4 bg-muted rounded animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {complianceCases.map((caseItem) => (
                        <div 
                          key={caseItem.id} 
                          className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/30 cursor-pointer"
                        >
                          <div>
                            <div className="font-medium">{caseItem.type.toUpperCase()}</div>
                            <div className="text-xs text-muted-foreground">
                              {caseItem.description}
                            </div>
                          </div>
                          <div className={`rounded-full px-2 py-1 text-xs font-medium ${
                            caseItem.riskScore >= 80 
                              ? 'bg-red-100 text-red-800' 
                              : caseItem.riskScore >= 60 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            Score: {caseItem.riskScore}
                          </div>
                        </div>
                      ))}
                      <Button size="sm" variant="outline" className="w-full">
                        View All Cases
                      </Button>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="high" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    {complianceCases
                      .filter(c => c.riskScore >= 80)
                      .map((caseItem) => (
                        <div 
                          key={caseItem.id} 
                          className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/30 cursor-pointer"
                        >
                          <div>
                            <div className="font-medium">{caseItem.type.toUpperCase()}</div>
                            <div className="text-xs text-muted-foreground">
                              {caseItem.description}
                            </div>
                          </div>
                          <div className="bg-red-100 text-red-800 rounded-full px-2 py-1 text-xs font-medium">
                            Score: {caseItem.riskScore}
                          </div>
                        </div>
                    ))}
                    <Button size="sm" variant="outline" className="w-full">
                      View All High Risk Cases
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="assigned" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    {complianceCases
                      .filter(c => c.assignedTo === user?.id)
                      .map((caseItem) => (
                        <div 
                          key={caseItem.id} 
                          className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/30 cursor-pointer"
                        >
                          <div>
                            <div className="font-medium">{caseItem.type.toUpperCase()}</div>
                            <div className="text-xs text-muted-foreground">
                              {caseItem.description}
                            </div>
                          </div>
                          <div className={`rounded-full px-2 py-1 text-xs font-medium ${
                            caseItem.riskScore >= 80 
                              ? 'bg-red-100 text-red-800' 
                              : caseItem.riskScore >= 60 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            Score: {caseItem.riskScore}
                          </div>
                        </div>
                    ))}
                    <Button size="sm" variant="outline" className="w-full">
                      View All My Cases
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
            <CardDescription>Latest uploaded documents awaiting review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="grid grid-cols-5 p-3 bg-muted/50 text-xs font-medium">
                <div>Document</div>
                <div>Type</div>
                <div>Upload Date</div>
                <div>Status</div>
                <div className="text-right">Action</div>
              </div>
              <div className="divide-y">
                {loading ? (
                  Array(4).fill(null).map((_, i) => (
                    <div key={i} className="grid grid-cols-5 p-3 items-center animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                      <div className="h-4 bg-muted rounded w-1/2 ml-auto"></div>
                    </div>
                  ))
                ) : (
                  recentDocuments.map((doc) => (
                    <div key={doc.id} className="grid grid-cols-5 p-3 items-center">
                      <div className="font-medium">{doc.fileName}</div>
                      <div>
                        <span className="capitalize">{doc.type}</span>
                      </div>
                      <div>
                        {new Date(doc.uploadDate).toLocaleDateString('en-SE', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                      <div>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          doc.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : doc.status === 'verified' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {doc.status}
                        </span>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                        {doc.status === 'pending' && (
                          <Button size="sm">
                            Review
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline">View All Documents</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
