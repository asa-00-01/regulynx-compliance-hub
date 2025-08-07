
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataIngestionLog, IntegrationConfig } from '@/types/integration';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DataIngestionMonitorProps {
  logs: DataIngestionLog[];
  selectedClientId: string | null;
  onClientSelect: (clientId: string | null) => void;
  integrationConfigs: IntegrationConfig[];
}

const DataIngestionMonitor = ({ logs, selectedClientId, onClientSelect, integrationConfigs }: DataIngestionMonitorProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'partial':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      partial: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getSuccessRate = (log: DataIngestionLog) => {
    if (log.recordCount === 0) return 0;
    return Math.round((log.successCount / log.recordCount) * 100);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Data Ingestion Monitor</CardTitle>
          <div className="w-64">
            <Select value={selectedClientId || ''} onValueChange={(value) => onClientSelect(value || null)}>
              <SelectTrigger>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All clients</SelectItem>
                {integrationConfigs.map((config) => (
                  <SelectItem key={config.id} value={config.clientId}>
                    {config.clientName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No data ingestion logs found.
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  {getStatusIcon(log.status)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium">{log.clientId}</h4>
                      <Badge className={getStatusBadge(log.status)}>
                        {log.status}
                      </Badge>
                      <Badge variant="outline">
                        {log.ingestionType}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>
                        {log.recordCount} records ({log.successCount} success, {log.errorCount} errors)
                      </span>
                      {log.processingTimeMs && (
                        <span>{log.processingTimeMs}ms</span>
                      )}
                      <span>
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    {log.recordCount > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Success Rate</span>
                          <span>{getSuccessRate(log)}%</span>
                        </div>
                        <Progress value={getSuccessRate(log)} className="h-2" />
                      </div>
                    )}
                    {log.errorDetails && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
                        <details>
                          <summary className="cursor-pointer text-red-700 font-medium">
                            Error Details
                          </summary>
                          <pre className="mt-1 text-xs overflow-auto">
                            {JSON.stringify(log.errorDetails, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataIngestionMonitor;
