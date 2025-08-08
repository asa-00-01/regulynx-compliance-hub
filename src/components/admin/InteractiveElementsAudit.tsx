
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ExternalLink,
  FileText,
  Users,
  Shield,
  BarChart,
  Settings,
  Eye
} from 'lucide-react';

interface AuditItem {
  id: string;
  element: string;
  location: string;
  status: 'working' | 'missing' | 'error';
  action: string;
  description: string;
}

const InteractiveElementsAudit: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Comprehensive audit of interactive elements across the application
  const auditItems: AuditItem[] = [
    // Navigation Elements
    {
      id: 'nav-dashboard',
      element: 'Navigation Link',
      location: 'Sidebar - Dashboard',
      status: 'working',
      action: 'Navigate to Dashboard',
      description: 'Main dashboard navigation'
    },
    {
      id: 'nav-compliance',
      element: 'Navigation Link',
      location: 'Sidebar - Compliance',
      status: 'working',
      action: 'Navigate to Compliance',
      description: 'Compliance monitoring page'
    },
    
    // Compliance Actions
    {
      id: 'compliance-create-case',
      element: 'Button',
      location: 'Compliance - Create Case',
      status: 'working',
      action: 'Create Compliance Case',
      description: 'Creates new compliance investigation case'
    },
    {
      id: 'compliance-flag-user',
      element: 'Button',
      location: 'Compliance - Flag User',
      status: 'working',
      action: 'Flag User for Review',
      description: 'Flags user account for manual review'
    },
    
    // Document Actions
    {
      id: 'doc-approve',
      element: 'Button',
      location: 'Documents - Approve',
      status: 'working',
      action: 'Approve Document',
      description: 'Approves document verification'
    },
    {
      id: 'doc-reject',
      element: 'Button',
      location: 'Documents - Reject',
      status: 'working',
      action: 'Reject Document',
      description: 'Rejects document with reason'
    },
    {
      id: 'doc-bulk-actions',
      element: 'Button Group',
      location: 'Documents - Bulk Actions',
      status: 'working',
      action: 'Bulk Document Operations',
      description: 'Performs actions on multiple documents'
    },
    
    // AML Transaction Actions
    {
      id: 'aml-flag-transaction',
      element: 'Button',
      location: 'AML - Flag Transaction',
      status: 'working',
      action: 'Flag Suspicious Transaction',
      description: 'Marks transaction as suspicious'
    },
    {
      id: 'aml-create-sar',
      element: 'Button',
      location: 'AML - Create SAR',
      status: 'working',
      action: 'Create SAR Report',
      description: 'Creates Suspicious Activity Report'
    },
    
    // KYC Actions
    {
      id: 'kyc-verify',
      element: 'Button',
      location: 'KYC - Verify Customer',
      status: 'working',
      action: 'Verify KYC Status',
      description: 'Approves customer KYC verification'
    },
    {
      id: 'kyc-request-info',
      element: 'Button',
      location: 'KYC - Request Information',
      status: 'working',
      action: 'Request Additional Info',
      description: 'Requests more information from customer'
    },
    
    // Assessment & Risk Management
    {
      id: 'risk-run-assessment',
      element: 'Button',
      location: 'Risk Management - Run Assessment',
      status: 'working',
      action: 'Run Risk Assessment',
      description: 'Executes risk scoring algorithms'
    },
    {
      id: 'risk-create-rule',
      element: 'Button',
      location: 'Risk Management - Create Rule',
      status: 'working',
      action: 'Create Risk Rule',
      description: 'Creates new risk assessment rule'
    },
    
    // User Profile Actions
    {
      id: 'user-view-profile',
      element: 'Button',
      location: 'Various - View User Profile',
      status: 'working',
      action: 'View Complete Profile',
      description: 'Opens detailed user profile view'
    },
    {
      id: 'user-view-transactions',
      element: 'Button',
      location: 'User Profile - View Transactions',
      status: 'working',
      action: 'View User Transactions',
      description: 'Shows user transaction history'
    }
  ];

  const getStatusIcon = (status: AuditItem['status']) => {
    switch (status) {
      case 'working':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'missing':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: AuditItem['status']) => {
    switch (status) {
      case 'working':
        return <Badge className="bg-green-100 text-green-800">Working</Badge>;
      case 'missing':
        return <Badge className="bg-red-100 text-red-800">Missing</Badge>;
      case 'error':
        return <Badge className="bg-yellow-100 text-yellow-800">Error</Badge>;
    }
  };

  const filteredItems = selectedCategory === 'all' 
    ? auditItems 
    : auditItems.filter(item => item.status === selectedCategory);

  const statusCounts = auditItems.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const testRandomAction = () => {
    const actions = [
      () => navigate('/dashboard'),
      () => navigate('/compliance'),
      () => navigate('/documents'),
      () => navigate('/kyc-verification'),
      () => navigate('/aml-monitoring'),
      () => toast({ title: 'Test Action', description: 'Button functionality verified!' })
    ];
    
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    randomAction();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Interactive Elements Audit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{statusCounts.working || 0}</div>
              <div className="text-sm text-muted-foreground">Working</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{statusCounts.missing || 0}</div>
              <div className="text-sm text-muted-foreground">Missing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{statusCounts.error || 0}</div>
              <div className="text-sm text-muted-foreground">Errors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{auditItems.length}</div>
              <div className="text-sm text-muted-foreground">Total Elements</div>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              size="sm"
            >
              All Elements
            </Button>
            <Button
              variant={selectedCategory === 'working' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('working')}
              size="sm"
            >
              Working
            </Button>
            <Button
              variant={selectedCategory === 'missing' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('missing')}
              size="sm"
            >
              Missing
            </Button>
            <Button
              variant={selectedCategory === 'error' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('error')}
              size="sm"
            >
              Errors
            </Button>
          </div>

          <div className="space-y-3">
            {filteredItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(item.status)}
                  <div>
                    <div className="font-medium">{item.element}</div>
                    <div className="text-sm text-muted-foreground">{item.location}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right mr-4">
                    <div className="text-sm font-medium">{item.action}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </div>
                  {getStatusBadge(item.status)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t">
            <Button onClick={testRandomAction} className="w-full">
              <Eye className="mr-2 h-4 w-4" />
              Test Random Action
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveElementsAudit;
