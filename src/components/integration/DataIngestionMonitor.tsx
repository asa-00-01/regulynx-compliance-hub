
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataIngestionLog, IntegrationConfig } from '@/types/integration';
import { Database, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
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
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Ingestion Monitor
          </CardTitle>
          <div className="w-64">
            <Select 
              value={selectedClientId || 'all'} 
              onValueChange={(value) => onClientSelect(value === 'all' ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
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
              <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(log.status)}
                  <div>
                    <h4 className="font-medium">{log.ingestionType} ingestion</h4>
                    <p className="text-sm text-muted-foreground">
                      Client: {log.clientId} • {log.recordCount} records
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(log.status)}>
                    {log.status}
                  </Badge>
                  <div className="text-sm text-muted-foreground mt-1">
                    Success: {log.successCount} / Error: {log.errorCount}
                  </div>
                  {log.processingTimeMs && (
                    <div className="text-xs text-muted-foreground">
                      {log.processingTimeMs}ms
                    </div>
                  )}
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
