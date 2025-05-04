
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ComplianceCase } from '@/types';
import { 
  AlertTriangle, 
  Shield, 
  Users, 
  CheckCircle2, 
  Clock,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';

// Mock compliance cases
const mockComplianceCases: ComplianceCase[] = [
  {
    id: '1',
    userId: '101',
    createdAt: '2025-05-01T08:30:00Z',
    type: 'kyc',
    status: 'open',
    riskScore: 75,
    description: 'Inconsistent identity information across documents',
    assignedTo: '1',
    actions: [
      {
        date: '2025-05-01T08:30:00Z',
        action: 'Case created',
        by: 'System',
      },
      {
        date: '2025-05-01T09:45:00Z',
        action: 'Assigned to compliance officer',
        by: 'System',
      },
    ],
  },
  {
    id: '2',
    userId: '105',
    createdAt: '2025-05-02T10:15:00Z',
    type: 'aml',
    status: 'escalated',
    riskScore: 92,
    description: 'Multiple high-value transactions from high-risk jurisdiction',
    assignedTo: '1',
    actions: [
      {
        date: '2025-05-02T10:15:00Z',
        action: 'Case created',
        by: 'System',
      },
      {
        date: '2025-05-02T11:30:00Z',
        action: 'Escalated to senior compliance',
        by: 'Johan Berg',
      },
    ],
  },
  {
    id: '3',
    userId: '107',
    createdAt: '2025-05-02T14:45:00Z',
    type: 'sanctions',
    status: 'open',
    riskScore: 85,
    description: 'Potential sanctions list match (86% confidence)',
    assignedTo: '1',
    actions: [
      {
        date: '2025-05-02T14:45:00Z',
        action: 'Case created',
        by: 'System',
      },
      {
        date: '2025-05-02T15:20:00Z',
        action: 'Additional verification requested',
        by: 'Alex Nordström',
      },
    ],
  },
  {
    id: '4',
    userId: '110',
    createdAt: '2025-05-03T09:10:00Z',
    type: 'kyc',
    status: 'resolved',
    riskScore: 45,
    description: 'Address verification failed initial check',
    assignedTo: '1',
    actions: [
      {
        date: '2025-05-03T09:10:00Z',
        action: 'Case created',
        by: 'System',
      },
      {
        date: '2025-05-03T11:30:00Z',
        action: 'Additional proof of address requested',
        by: 'Alex Nordström',
      },
      {
        date: '2025-05-03T15:45:00Z',
        action: 'Customer provided updated documents',
        by: 'Astrid Lindqvist',
      },
      {
        date: '2025-05-03T16:20:00Z',
        action: 'Case resolved - Address verified',
        by: 'Alex Nordström',
      },
    ],
  },
  {
    id: '5',
    userId: '112',
    createdAt: '2025-05-03T13:30:00Z',
    type: 'aml',
    status: 'open',
    riskScore: 68,
    description: 'Unusual transaction pattern detected',
    assignedTo: '1',
  },
];

// Chart data
const riskDistributionData = [
  { name: 'Low Risk (0-50)', value: 12, color: '#4caf50' },
  { name: 'Medium Risk (51-75)', value: 8, color: '#ff9800' },
  { name: 'High Risk (76-100)', value: 5, color: '#f44336' },
];

const caseTypeData = [
  { name: 'KYC', count: 10, color: '#1EAEDB' },
  { name: 'AML', count: 7, color: '#ff9800' },
  { name: 'Sanctions', count: 3, color: '#f44336' },
];

const Compliance = () => {
  const [activeTab, setActiveTab] = useState('open');
  const [cases] = useState<ComplianceCase[]>(mockComplianceCases);
  const [selectedCase, setSelectedCase] = useState<ComplianceCase | null>(null);

  const filteredCases = activeTab === 'all' 
    ? cases 
    : cases.filter(c => c.status === activeTab);

  const handleCaseClick = (complianceCase: ComplianceCase) => {
    setSelectedCase(complianceCase);
  };

  const getRiskClass = (score: number) => {
    if (score >= 76) return 'bg-red-100 text-red-800';
    if (score >= 51) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <DashboardLayout requiredRoles={['complianceOfficer', 'admin', 'executive']}>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Compliance</h1>
          <p className="text-muted-foreground">
            Monitor and manage compliance cases and risk assessment
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cases.length}</div>
              <div className="mt-1 flex items-center text-xs text-muted-foreground">
                <Clock className="mr-1 h-3 w-3" />
                <span>
                  {cases.filter(c => c.status === 'open').length} open cases
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">High Risk Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cases.filter(c => c.riskScore >= 76).length}</div>
              <div className="mt-1 flex items-center text-xs text-red-500">
                <AlertTriangle className="mr-1 h-3 w-3" />
                <span>Requires immediate attention</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Resolved This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <div className="mt-1 flex items-center text-xs text-green-500">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                <span>100% resolution rate</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Risk Distribution</CardTitle>
              <CardDescription>Customer risk score distribution</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Case Type Distribution</CardTitle>
              <CardDescription>Breakdown of compliance case types</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={caseTypeData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count">
                    {caseTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Compliance Cases</CardTitle>
            <CardDescription>Monitor and manage all compliance cases</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs 
              defaultValue="open" 
              value={activeTab} 
              onValueChange={setActiveTab}
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="open">Open</TabsTrigger>
                <TabsTrigger value="escalated">Escalated</TabsTrigger>
                <TabsTrigger value="resolved">Resolved</TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 p-3 bg-muted/50 text-xs font-medium">
                    <div>Case ID</div>
                    <div>Type</div>
                    <div>Description</div>
                    <div>Created</div>
                    <div className="text-right">Risk Score</div>
                  </div>
                  <div className="divide-y">
                    {filteredCases.length > 0 ? (
                      filteredCases.map((complianceCase) => (
                        <div 
                          key={complianceCase.id} 
                          className="grid grid-cols-5 p-3 items-center cursor-pointer hover:bg-muted/40"
                          onClick={() => handleCaseClick(complianceCase)}
                        >
                          <div className="font-medium">{complianceCase.id}</div>
                          <div className="capitalize flex items-center gap-1">
                            {complianceCase.type === 'kyc' && <Users className="h-4 w-4" />}
                            {complianceCase.type === 'aml' && <AlertCircle className="h-4 w-4" />}
                            {complianceCase.type === 'sanctions' && <Shield className="h-4 w-4" />}
                            {complianceCase.type.toUpperCase()}
                          </div>
                          <div className="text-sm truncate max-w-[200px]">
                            {complianceCase.description}
                          </div>
                          <div>
                            {new Date(complianceCase.createdAt).toLocaleDateString('en-SE')}
                          </div>
                          <div className="flex justify-end">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getRiskClass(complianceCase.riskScore)}`}
                            >
                              {complianceCase.riskScore}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center">
                        <p className="text-muted-foreground">No compliance cases found</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {selectedCase && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Case Details</CardTitle>
                  <CardDescription>
                    Case #{selectedCase.id} - {selectedCase.type.toUpperCase()}
                  </CardDescription>
                </div>
                <div className={`rounded-full px-3 py-1 text-sm font-medium ${getRiskClass(selectedCase.riskScore)}`}>
                  Risk Score: {selectedCase.riskScore}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Case Information</h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-1">
                      <div className="text-sm font-medium">Status:</div>
                      <div className="col-span-2 capitalize">{selectedCase.status}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <div className="text-sm font-medium">Created:</div>
                      <div className="col-span-2">
                        {new Date(selectedCase.createdAt).toLocaleString('en-SE')}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <div className="text-sm font-medium">User ID:</div>
                      <div className="col-span-2">{selectedCase.userId}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <div className="text-sm font-medium">Assigned To:</div>
                      <div className="col-span-2">
                        {selectedCase.assignedTo ? "Alex Nordström" : "Unassigned"}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Case Description</h3>
                  <p className="text-sm">{selectedCase.description}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Case History</h3>
                <div className="space-y-3">
                  {selectedCase.actions ? (
                    selectedCase.actions.map((action, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <div className="h-2 w-2 rounded-full bg-regulynx-blue mt-2"></div>
                        <div>
                          <div className="font-medium">{action.action}</div>
                          <div className="text-muted-foreground">
                            {new Date(action.date).toLocaleString('en-SE')} by {action.by}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No actions recorded</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline">Add Note</Button>
                <Button variant="outline">Escalate</Button>
                {selectedCase.status !== 'resolved' && (
                  <Button>Resolve Case</Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Compliance;
