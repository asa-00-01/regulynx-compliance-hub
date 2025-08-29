import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { config } from '@/config/environment';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Lock,
  Users,
  Activity,
  Clock,
  Search,
  Filter,
  Download,
  Settings,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Globe,
  Database,
  Server,
  Network,
  Key,
  Fingerprint,
  ShieldCheck,
  AlertCircle,
  Info,
  Zap,
  Target,
  Award,
  Calendar,
  FileText,
  Clipboard,
  RefreshCw
} from 'lucide-react';

interface SecurityStats {
  totalIncidents: number;
  resolvedIncidents: number;
  activeThreats: number;
  securityScore: number;
  complianceScore: number;
  lastAudit: string;
  nextAudit: string;
  dataBreaches: number;
}

interface SecurityIncident {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  description: string;
  reportedAt: string;
  resolvedAt?: string;
  affectedUsers: number;
  affectedSystems: string[];
}

interface ComplianceRequirement {
  id: string;
  name: string;
  category: string;
  status: 'compliant' | 'non-compliant' | 'pending' | 'review';
  lastChecked: string;
  nextCheck: string;
  description: string;
  requirements: string[];
}

const SecurityComplianceConsole: React.FC = () => {
  const navigate = useNavigate();
  const [securityStats, setSecurityStats] = useState<SecurityStats>({
    totalIncidents: 12,
    resolvedIncidents: 10,
    activeThreats: 2,
    securityScore: 94,
    complianceScore: 98,
    lastAudit: '2024-01-15',
    nextAudit: '2024-04-15',
    dataBreaches: 0
  });

  const [incidents, setIncidents] = useState<SecurityIncident[]>(config.features.useMockData ? [
    {
      id: 'inc_001',
      type: 'Failed Login Attempts',
      severity: 'medium',
      status: 'investigating',
      description: 'Multiple failed login attempts detected from suspicious IP addresses',
      reportedAt: '2024-01-20T10:30:00Z',
      affectedUsers: 5,
      affectedSystems: ['Authentication Service', 'User Portal']
    },
    {
      id: 'inc_002',
      type: 'Data Access Violation',
      severity: 'high',
      status: 'open',
      description: 'Unauthorized access attempt to sensitive customer data',
      reportedAt: '2024-01-19T14:15:00Z',
      affectedUsers: 1,
      affectedSystems: ['Customer Database', 'API Gateway']
    }
  ] : []);

  const [complianceRequirements, setComplianceRequirements] = useState<ComplianceRequirement[]>(config.features.useMockData ? [
    {
      id: 'comp_001',
      name: 'GDPR Compliance',
      category: 'Data Privacy',
      status: 'compliant',
      lastChecked: '2024-01-15',
      nextCheck: '2024-04-15',
      description: 'General Data Protection Regulation compliance requirements',
      requirements: [
        'Data encryption at rest and in transit',
        'User consent management',
        'Data retention policies',
        'Right to be forgotten implementation'
      ]
    },
    {
      id: 'comp_002',
      name: 'SOC 2 Type II',
      category: 'Security Controls',
      status: 'compliant',
      lastChecked: '2024-01-10',
      nextCheck: '2024-07-10',
      description: 'Service Organization Control 2 Type II certification',
      requirements: [
        'Access control policies',
        'Change management procedures',
        'Incident response procedures',
        'Risk assessment framework'
      ]
    },
    {
      id: 'comp_003',
      name: 'PCI DSS',
      category: 'Payment Security',
      status: 'pending',
      lastChecked: '2024-01-05',
      nextCheck: '2024-02-05',
      description: 'Payment Card Industry Data Security Standard',
      requirements: [
        'Secure payment processing',
        'Cardholder data protection',
        'Vulnerability management',
        'Security monitoring'
      ]
    }
  ] : []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'non-compliant': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'review': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const quickActions = [
    {
      title: 'Run Security Scan',
      description: 'Initiate comprehensive security scan',
      icon: Shield,
      action: () => {
        // TODO: Implement security scan functionality
        console.log('Run security scan - initiating system scan');
        alert('Security scan initiated! This may take several minutes to complete.');
        // This would typically start an async security scan process
      },
      color: 'bg-blue-500'
    },
    {
      title: 'Generate Compliance Report',
      description: 'Create compliance audit report',
      icon: FileText,
      action: () => {
        // TODO: Implement compliance report generation
        console.log('Generate compliance report - creating audit report');
        const reportData = {
          complianceScore: securityStats.complianceScore,
          securityScore: securityStats.securityScore,
          totalIncidents: securityStats.totalIncidents,
          openIncidents: securityStats.totalIncidents - securityStats.resolvedIncidents, // Assuming openIncidents is total - resolved
          lastScanDate: new Date().toISOString(),
          reportType: 'compliance_audit'
        };
        
        const reportContent = 'data:text/json;charset=utf-8,' + JSON.stringify(reportData, null, 2);
        const encodedUri = encodeURI(reportContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'compliance_report.json');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      color: 'bg-green-500'
    },
    {
      title: 'Review Incidents',
      description: 'Review and manage security incidents',
      icon: AlertTriangle,
      action: () => {
        // TODO: Implement incident review functionality
        console.log('Review incidents - opening incident management interface');
        alert('Incident review interface coming soon!');
      },
      color: 'bg-orange-500'
    },
    {
      title: 'Update Policies',
      description: 'Manage security and compliance policies',
      icon: Settings,
      action: () => {
        // TODO: Implement policy management functionality
        console.log('Update policies - opening policy management interface');
        alert('Policy management interface coming soon!');
      },
      color: 'bg-purple-500'
    }
  ];

  const securityMetrics = [
    {
      title: 'System Uptime',
      value: '99.9%',
      trend: 'up',
      description: 'Last 30 days'
    },
    {
      title: 'Active Threats',
      value: securityStats.activeThreats.toString(),
      trend: 'down',
      description: 'Blocked successfully'
    },
    {
      title: 'Data Encryption',
      value: '100%',
      trend: 'stable',
      description: 'At rest and in transit'
    },
    {
      title: 'Access Controls',
      value: 'Enforced',
      trend: 'stable',
      description: 'Multi-factor enabled'
    }
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-bold tracking-tight">Security & Compliance</h1>
          <p className="text-muted-foreground">
            Monitor security threats, manage incidents, and ensure compliance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Shield className="h-4 w-4 mr-2" />
            Security Scan
          </Button>
        </div>
      </div>

      {/* Security Score Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 w-full">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getSecurityScoreColor(securityStats.securityScore)}`}>
              {securityStats.securityScore}/100
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              +2 points this month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{securityStats.complianceScore}/100</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
              All requirements met
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{securityStats.activeThreats}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              {securityStats.resolvedIncidents} resolved this month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Breaches</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{securityStats.dataBreaches}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ShieldCheck className="h-3 w-3 mr-1 text-green-600" />
              No breaches detected
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common security and compliance tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 w-full">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start"
                onClick={action.action}
              >
                <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                  <action.icon className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Security Metrics</CardTitle>
          <CardDescription>
            Real-time security performance indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 w-full">
            {securityMetrics.map((metric, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Activity className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium">{metric.title}</div>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="text-xs text-muted-foreground">{metric.description}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Security & Compliance Management</CardTitle>
          <CardDescription>
            Comprehensive security monitoring and compliance management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="incidents" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="incidents">Incidents</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="threats">Threats</TabsTrigger>
              <TabsTrigger value="audit">Audit</TabsTrigger>
            </TabsList>

            <TabsContent value="incidents" className="space-y-4">
              <div className="space-y-4">
                {incidents.map((incident) => (
                  <div key={incident.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <div className="font-medium">{incident.type}</div>
                        <div className="text-sm text-muted-foreground">{incident.description}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getSeverityColor(incident.severity)}>
                            {incident.severity}
                          </Badge>
                          <Badge variant="outline">
                            {incident.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-medium">{incident.affectedUsers} users affected</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(incident.reportedAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-4">
              <div className="space-y-4">
                {complianceRequirements.map((requirement) => (
                  <div key={requirement.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{requirement.name}</div>
                        <div className="text-sm text-muted-foreground">{requirement.description}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getStatusColor(requirement.status)}>
                            {requirement.status}
                          </Badge>
                          <Badge variant="outline">
                            {requirement.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-medium">Next check: {requirement.nextCheck}</div>
                        <div className="text-sm text-muted-foreground">
                          Last: {requirement.lastChecked}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            // TODO: Implement view compliance requirement details
                            console.log('View compliance requirement:', requirement.name);
                            alert(`Viewing details for: ${requirement.name}`);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            // TODO: Implement refresh compliance check
                            console.log('Refresh compliance check for:', requirement.name);
                            alert(`Refreshing compliance check for: ${requirement.name}`);
                          }}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="threats" className="space-y-4">
              <div className="text-center py-8">
                <Shield className="h-12 w-12 mx-auto text-blue-500 mb-4" />
                <h3 className="text-lg font-semibold">Threat Intelligence</h3>
                <p className="text-muted-foreground">
                  Monitor and analyze security threats in real-time
                </p>
                <Button className="mt-4" onClick={() => {
                  // TODO: Implement threat dashboard navigation
                  console.log('View threat dashboard - opening threat intelligence interface');
                  alert('Threat Intelligence Dashboard coming soon!');
                }}>
                  View Threat Dashboard
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="audit" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Last Audit Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Security Controls</span>
                        <Badge className="bg-green-100 text-green-800">Passed</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Data Protection</span>
                        <Badge className="bg-green-100 text-green-800">Passed</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Access Management</span>
                        <Badge className="bg-green-100 text-green-800">Passed</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Incident Response</span>
                        <Badge className="bg-yellow-100 text-yellow-800">Review</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Next Audit Schedule</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Internal Security Review</span>
                        <span className="font-medium">Feb 15, 2024</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Compliance Assessment</span>
                        <span className="font-medium">Apr 15, 2024</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Penetration Testing</span>
                        <span className="font-medium">Mar 1, 2024</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Third-party Audit</span>
                        <span className="font-medium">Jun 1, 2024</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityComplianceConsole;
