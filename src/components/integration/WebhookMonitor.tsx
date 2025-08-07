
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, Send, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WebhookNotification {
  id: string;
  client_id: string;
  event_type: string;
  payload: any;
  webhook_url: string;
  status: 'pending' | 'delivered' | 'failed';
  retry_count: number;
  last_attempt_at?: string;
  created_at: string;
  delivered_at?: string;
}

const WebhookMonitor = () => {
  const [webhooks, setWebhooks] = useState<WebhookNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const loadWebhooks = async () => {
    try {
      const { data, error } = await supabase
        .from('webhook_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setWebhooks(data || []);
    } catch (error) {
      console.error('Error loading webhooks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load webhook notifications.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const processWebhooks = async () => {
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('webhook-sender');

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Processed ${data.processed} webhooks: ${data.successful} successful, ${data.failed} failed.`,
      });

      await loadWebhooks();
    } catch (error) {
      console.error('Error processing webhooks:', error);
      toast({
        title: 'Error',
        description: 'Failed to process webhooks.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    loadWebhooks();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Loading webhooks...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Webhook Notifications
          </CardTitle>
          <div className="flex gap-2">
            <Button onClick={loadWebhooks} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={processWebhooks} disabled={processing} size="sm">
              {processing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Process Webhooks
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {webhooks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No webhook notifications found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Client ID</TableHead>
                <TableHead>Event Type</TableHead>
                <TableHead>Webhook URL</TableHead>
                <TableHead>Retry Count</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Attempt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {webhooks.map((webhook) => (
                <TableRow key={webhook.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(webhook.status)}
                      <Badge variant={getStatusVariant(webhook.status)}>
                        {webhook.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {webhook.client_id}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {webhook.event_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate" title={webhook.webhook_url}>
                    {webhook.webhook_url}
                  </TableCell>
                  <TableCell>
                    <Badge variant={webhook.retry_count > 0 ? "secondary" : "outline"}>
                      {webhook.retry_count}/3
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(webhook.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {webhook.last_attempt_at ? 
                      new Date(webhook.last_attempt_at).toLocaleString() : 
                      'Never'
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default WebhookMonitor;
