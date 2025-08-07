
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, FileText, Zap, Shield } from 'lucide-react';

const APIDocumentation = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Integration API Documentation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="authentication">Authentication</TabsTrigger>
              <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
                <p className="text-muted-foreground mb-4">
                  The Compliance System Integration API allows you to securely transmit customer data, 
                  transaction records, and documents for compliance processing.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Security First
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      All data transmission is encrypted using industry-standard protocols. 
                      API keys are required for all requests.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Real-time Processing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Data is processed in real-time with immediate feedback via 
                      webhooks and API responses.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Base URL</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm">
                  https://mqsouubnefdyjyaxjcwr.supabase.co/functions/v1
                </div>
              </div>
            </TabsContent>

            <TabsContent value="authentication" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">API Authentication</h3>
                <p className="text-muted-foreground mb-4">
                  All API requests must include a valid API key in the request payload.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Getting an API Key</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Contact your compliance officer or system administrator</li>
                  <li>Provide your client ID and integration requirements</li>
                  <li>Receive your unique API key and client credentials</li>
                  <li>Store the API key securely (never commit to version control)</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Request Format</h4>
                <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
{`{
  "client_id": "your-client-id",
  "api_key": "your-api-key-hash",
  "data_type": "customer|transaction|document",
  "records": [...]
}`}
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="endpoints" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Available Endpoints</h3>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Data Ingestion</CardTitle>
                    <Badge>POST</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <code className="bg-muted px-2 py-1 rounded text-sm">
                      /data-ingestion
                    </code>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Submit customer data, transaction records, or documents for processing.
                  </p>
                  
                  <div>
                    <h5 className="font-semibold text-sm mb-2">Request Body:</h5>
                    <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`{
  "client_id": "string",
  "api_key": "string",
  "data_type": "customer|transaction|document",
  "records": [
    {
      "external_id": "string",
      "customer_id": "string",
      // ... additional fields based on data_type
    }
  ]
}`}
                    </pre>
                  </div>

                  <div>
                    <h5 className="font-semibold text-sm mb-2">Response:</h5>
                    <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`{
  "success": true,
  "processed": 10,
  "successful": 9,
  "failed": 1,
  "processing_time_ms": 1234,
  "log_id": "uuid"
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Data Types</CardTitle>
                    <Badge variant="outline">Reference</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Badge className="mb-2">customer</Badge>
                      <p className="text-sm text-muted-foreground">
                        Customer identity information, KYC data, and profile details.
                      </p>
                    </div>
                    <div>
                      <Badge className="mb-2">transaction</Badge>
                      <p className="text-sm text-muted-foreground">
                        Financial transaction records with amounts, parties, and metadata.
                      </p>
                    </div>
                    <div>
                      <Badge className="mb-2">document</Badge>
                      <p className="text-sm text-muted-foreground">
                        Supporting documents and attachments for compliance review.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="webhooks" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Webhook Notifications</h3>
                <p className="text-muted-foreground mb-4">
                  Configure webhook URLs to receive real-time notifications about data processing events.
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Event Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Badge>data_ingestion_completed</Badge>
                      <div>
                        <p className="text-sm">Sent when a batch of data has been processed.</p>
                        <p className="text-xs text-muted-foreground">
                          Includes processing statistics and any errors.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Webhook Format</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Webhooks are sent as POST requests to your configured endpoint:
                  </p>
                  <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
{`{
  "event_type": "data_ingestion_completed",
  "client_id": "your-client-id",
  "timestamp": "2024-01-01T12:00:00Z",
  "data": {
    "client_id": "your-client-id",
    "data_type": "transaction",
    "record_count": 100,
    "success_count": 98,
    "error_count": 2,
    "processing_time_ms": 5000,
    "log_id": "uuid"
  }
}`}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Webhook Security</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Webhooks are sent from our secure servers</li>
                    <li>• Implement proper authentication on your webhook endpoints</li>
                    <li>• Use HTTPS endpoints only</li>
                    <li>• Failed webhooks will be retried up to 3 times</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default APIDocumentation;
