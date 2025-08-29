import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { 
  Download, 
  Upload, 
  Database, 
  FileText, 
  Settings, 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Calendar,
  Filter,
  Archive,
  Trash2,
  Eye,
  Play,
  Pause,
  Stop
} from 'lucide-react';

interface ExportJob {
  id: string;
  name: string;
  type: 'export' | 'import';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  dataType: string;
  format: string;
  filters: Record<string, any>;
  createdAt: string;
  completedAt?: string;
  fileSize?: number;
  recordCount?: number;
  error?: string;
}

interface DataType {
  id: string;
  name: string;
  description: string;
  category: 'compliance' | 'transaction' | 'user' | 'system';
  estimatedSize: number;
  supportedFormats: string[];
  filters: DataFilter[];
}

interface DataFilter {
  field: string;
  label: string;
  type: 'date' | 'text' | 'select' | 'number';
  options?: string[];
}

const DataExportImport: React.FC = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<ExportJob[]>([]);
  const [selectedDataType, setSelectedDataType] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Sample data types
  const dataTypes: DataType[] = [
    {
      id: 'transactions',
      name: 'Transaction Data',
      description: 'All transaction records with risk scores and flags',
      category: 'transaction',
      estimatedSize: 150,
      supportedFormats: ['CSV', 'JSON', 'XML', 'Excel'],
      filters: [
        { field: 'dateRange', label: 'Date Range', type: 'date' },
        { field: 'status', label: 'Status', type: 'select', options: ['all', 'approved', 'pending', 'flagged', 'rejected'] },
        { field: 'riskLevel', label: 'Risk Level', type: 'select', options: ['all', 'low', 'medium', 'high', 'critical'] },
        { field: 'amount', label: 'Amount Range', type: 'number' }
      ]
    },
    {
      id: 'users',
      name: 'User Data',
      description: 'Customer and user information with KYC status',
      category: 'user',
      estimatedSize: 25,
      supportedFormats: ['CSV', 'JSON', 'XML'],
      filters: [
        { field: 'kycStatus', label: 'KYC Status', type: 'select', options: ['all', 'pending', 'approved', 'rejected'] },
        { field: 'riskScore', label: 'Risk Score Range', type: 'number' },
        { field: 'registrationDate', label: 'Registration Date', type: 'date' }
      ]
    },
    {
      id: 'compliance_cases',
      name: 'Compliance Cases',
      description: 'Compliance investigation cases and resolutions',
      category: 'compliance',
      estimatedSize: 50,
      supportedFormats: ['CSV', 'JSON', 'PDF'],
      filters: [
        { field: 'caseStatus', label: 'Case Status', type: 'select', options: ['all', 'open', 'closed', 'escalated'] },
        { field: 'priority', label: 'Priority', type: 'select', options: ['all', 'low', 'medium', 'high', 'critical'] },
        { field: 'assignedTo', label: 'Assigned To', type: 'text' }
      ]
    },
    {
      id: 'audit_logs',
      name: 'Audit Logs',
      description: 'System audit trails and user activity logs',
      category: 'system',
      estimatedSize: 200,
      supportedFormats: ['CSV', 'JSON', 'Log'],
      filters: [
        { field: 'dateRange', label: 'Date Range', type: 'date' },
        { field: 'user', label: 'User', type: 'text' },
        { field: 'action', label: 'Action', type: 'select', options: ['all', 'login', 'logout', 'create', 'update', 'delete'] }
      ]
    },
    {
      id: 'sar_reports',
      name: 'SAR Reports',
      description: 'Suspicious Activity Reports filed with authorities',
      category: 'compliance',
      estimatedSize: 30,
      supportedFormats: ['PDF', 'XML', 'GoAML'],
      filters: [
        { field: 'filingDate', label: 'Filing Date', type: 'date' },
        { field: 'status', label: 'Status', type: 'select', options: ['all', 'draft', 'submitted', 'filed', 'rejected'] }
      ]
    }
  ];

  // Sample jobs
  const sampleJobs: ExportJob[] = [
    {
      id: '1',
      name: 'Transaction Export - Q1 2024',
      type: 'export',
      status: 'completed',
      progress: 100,
      dataType: 'transactions',
      format: 'CSV',
      filters: { dateRange: '2024-01-01 to 2024-03-31', status: 'all' },
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      completedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      fileSize: 45.2,
      recordCount: 15420
    },
    {
      id: '2',
      name: 'User Data Import',
      type: 'import',
      status: 'running',
      progress: 65,
      dataType: 'users',
      format: 'CSV',
      filters: {},
      createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      recordCount: 2500
    },
    {
      id: '3',
      name: 'Compliance Cases Export',
      type: 'export',
      status: 'failed',
      progress: 0,
      dataType: 'compliance_cases',
      format: 'PDF',
      filters: { caseStatus: 'open' },
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      error: 'PDF generation failed due to template error'
    }
  ];

  useEffect(() => {
    setJobs(sampleJobs);
  }, []);

  const startExport = async () => {
    if (!selectedDataType || !selectedFormat) {
      toast({
        title: 'Error',
        description: 'Please select data type and format',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    const dataType = dataTypes.find(dt => dt.id === selectedDataType);
    
    const newJob: ExportJob = {
      id: Date.now().toString(),
      name: `${dataType?.name} Export - ${new Date().toLocaleDateString()}`,
      type: 'export',
      status: 'pending',
      progress: 0,
      dataType: selectedDataType,
      format: selectedFormat,
      filters,
      createdAt: new Date().toISOString()
    };

    setJobs(prev => [newJob, ...prev]);

    // Simulate export process
    setTimeout(() => {
      setJobs(prev => prev.map(job => 
        job.id === newJob.id 
          ? { ...job, status: 'running', progress: 25 }
          : job
      ));
    }, 1000);

    setTimeout(() => {
      setJobs(prev => prev.map(job => 
        job.id === newJob.id 
          ? { ...job, progress: 75 }
          : job
      ));
    }, 3000);

    setTimeout(() => {
      setJobs(prev => prev.map(job => 
        job.id === newJob.id 
          ? { 
              ...job, 
              status: 'completed', 
              progress: 100, 
              completedAt: new Date().toISOString(),
              fileSize: Math.random() * 100 + 10,
              recordCount: Math.floor(Math.random() * 10000) + 1000
            }
          : job
      ));
      setIsExporting(false);
      toast({
        title: 'Success',
        description: 'Export completed successfully',
      });
    }, 5000);
  };

  const startImport = async (file: File) => {
    setIsImporting(true);
    
    const newJob: ExportJob = {
      id: Date.now().toString(),
      name: `Import - ${file.name}`,
      type: 'import',
      status: 'pending',
      progress: 0,
      dataType: 'users', // Default for import
      format: file.name.split('.').pop()?.toUpperCase() || 'CSV',
      filters: {},
      createdAt: new Date().toISOString()
    };

    setJobs(prev => [newJob, ...prev]);

    // Simulate import process
    setTimeout(() => {
      setJobs(prev => prev.map(job => 
        job.id === newJob.id 
          ? { ...job, status: 'running', progress: 30 }
          : job
      ));
    }, 1000);

    setTimeout(() => {
      setJobs(prev => prev.map(job => 
        job.id === newJob.id 
          ? { ...job, progress: 80 }
          : job
      ));
    }, 3000);

    setTimeout(() => {
      setJobs(prev => prev.map(job => 
        job.id === newJob.id 
          ? { 
              ...job, 
              status: 'completed', 
              progress: 100, 
              completedAt: new Date().toISOString(),
              recordCount: Math.floor(Math.random() * 5000) + 500
            }
          : job
      ));
      setIsImporting(false);
      toast({
        title: 'Success',
        description: 'Import completed successfully',
      });
    }, 5000);
  };

  const cancelJob = (jobId: string) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, status: 'cancelled' }
        : job
    ));
    toast({
      title: 'Cancelled',
      description: 'Job has been cancelled',
    });
  };

  const deleteJob = (jobId: string) => {
    setJobs(prev => prev.filter(job => job.id !== jobId));
    toast({
      title: 'Deleted',
      description: 'Job has been deleted',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'running': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running': return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled': return <Stop className="h-4 w-4 text-gray-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const selectedDataTypeInfo = dataTypes.find(dt => dt.id === selectedDataType);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Data Export & Import</h2>
          <p className="text-muted-foreground">
            Export and import data for compliance reporting and data migration
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="export" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="export">Export Data</TabsTrigger>
          <TabsTrigger value="import">Import Data</TabsTrigger>
          <TabsTrigger value="jobs">Job History</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Configuration
              </CardTitle>
              <CardDescription>
                Configure data export parameters and filters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Data Type Selection */}
              <div className="space-y-2">
                <Label>Data Type</Label>
                <Select value={selectedDataType} onValueChange={setSelectedDataType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select data type to export" />
                  </SelectTrigger>
                  <SelectContent>
                    {dataTypes.map((dataType) => (
                      <SelectItem key={dataType.id} value={dataType.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{dataType.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {dataType.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Format Selection */}
              {selectedDataType && (
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select export format" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedDataTypeInfo?.supportedFormats.map((format) => (
                        <SelectItem key={format} value={format}>
                          {format}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Filters */}
              {selectedDataType && selectedDataTypeInfo && (
                <div className="space-y-4">
                  <Label>Filters</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedDataTypeInfo.filters.map((filter) => (
                      <div key={filter.field} className="space-y-2">
                        <Label>{filter.label}</Label>
                        {filter.type === 'select' ? (
                          <Select 
                            value={filters[filter.field] || 'all'} 
                            onValueChange={(value) => setFilters(prev => ({ ...prev, [filter.field]: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {filter.options?.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : filter.type === 'date' ? (
                          <Input 
                            type="date" 
                            value={filters[filter.field] || ''}
                            onChange={(e) => setFilters(prev => ({ ...prev, [filter.field]: e.target.value }))}
                          />
                        ) : (
                          <Input 
                            placeholder={`Enter ${filter.label.toLowerCase()}`}
                            value={filters[filter.field] || ''}
                            onChange={(e) => setFilters(prev => ({ ...prev, [filter.field]: e.target.value }))}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Export Options */}
              <div className="space-y-4">
                <Label>Export Options</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="include-headers" defaultChecked />
                    <Label htmlFor="include-headers">Include Headers</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="compress" />
                    <Label htmlFor="compress">Compress File</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="encrypt" />
                    <Label htmlFor="encrypt">Encrypt Export</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="notify" defaultChecked />
                    <Label htmlFor="notify">Email Notification</Label>
                  </div>
                </div>
              </div>

              {/* Estimated Info */}
              {selectedDataTypeInfo && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Export Information</span>
                  </div>
                  <div className="text-sm text-blue-800 space-y-1">
                    <div>Estimated Size: ~{selectedDataTypeInfo.estimatedSize} MB</div>
                    <div>Estimated Records: ~{Math.floor(selectedDataTypeInfo.estimatedSize * 1000)} records</div>
                    <div>Estimated Time: ~{Math.ceil(selectedDataTypeInfo.estimatedSize / 10)} minutes</div>
                  </div>
                </div>
              )}

              <Button 
                onClick={startExport} 
                disabled={!selectedDataType || !selectedFormat || isExporting}
                className="w-full"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Start Export
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Import Data
              </CardTitle>
              <CardDescription>
                Import data from external sources
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Import File</Label>
                  <Input 
                    type="file" 
                    accept=".csv,.json,.xml,.xlsx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        startImport(file);
                      }
                    }}
                    disabled={isImporting}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Import Options</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="validate-data" defaultChecked />
                      <Label htmlFor="validate-data">Validate Data</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="update-existing" />
                      <Label htmlFor="update-existing">Update Existing Records</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="backup-before" defaultChecked />
                      <Label htmlFor="backup-before">Backup Before Import</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="notify-import" defaultChecked />
                      <Label htmlFor="notify-import">Email Notification</Label>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-yellow-900">Import Guidelines</span>
                  </div>
                  <div className="text-sm text-yellow-800 space-y-1">
                    <div>• Supported formats: CSV, JSON, XML, Excel</div>
                    <div>• Maximum file size: 100 MB</div>
                    <div>• Data will be validated before import</div>
                    <div>• Existing records may be updated if option is enabled</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Job History
              </CardTitle>
              <CardDescription>
                Track export and import job progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobs.length === 0 ? (
                  <div className="text-center py-8">
                    <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Jobs</h3>
                    <p className="text-muted-foreground">No export or import jobs have been created yet.</p>
                  </div>
                ) : (
                  jobs.map((job) => (
                    <div key={job.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getStatusIcon(job.status)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">{job.name}</h3>
                              <Badge className={getStatusColor(job.status)}>
                                {job.status.toUpperCase()}
                              </Badge>
                              <Badge variant="outline">
                                {job.type.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {job.dataType} • {job.format} • {new Date(job.createdAt).toLocaleString()}
                            </p>
                            
                            {job.status === 'running' && (
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Progress</span>
                                  <span>{job.progress}%</span>
                                </div>
                                <Progress value={job.progress} className="h-2" />
                              </div>
                            )}
                            
                            {job.status === 'completed' && (
                              <div className="text-sm text-muted-foreground">
                                {job.fileSize && `File size: ${job.fileSize.toFixed(1)} MB • `}
                                {job.recordCount && `${job.recordCount.toLocaleString()} records • `}
                                Completed: {new Date(job.completedAt!).toLocaleString()}
                              </div>
                            )}
                            
                            {job.status === 'failed' && job.error && (
                              <div className="text-sm text-red-600">
                                Error: {job.error}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {job.status === 'running' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => cancelJob(job.id)}
                            >
                              <Stop className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {job.status === 'completed' && (
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteJob(job.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataExportImport;
