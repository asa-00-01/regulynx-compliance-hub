
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Code, FileText, Zap, Shield, Copy, Check, Download, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const APIDocumentation = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const downloadOpenAPISpec = () => {
    const openAPISpec = {
      openapi: '3.0.0',
      info: {
        title: 'Compliance System API',
        version: '1.0.0',
        description: 'API for compliance data ingestion and risk assessment'
      },
      servers: [
        {
          url: 'https://api.compliance.your-domain.com/v1',
          description: 'Production server'
        },
        {
          url: 'https://sandbox-api.compliance.your-domain.com/v1',
          description: 'Sandbox server'
        }
      ],
      paths: {
        '/data-ingestion': {
          post: {
            summary: 'Submit data for compliance processing',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      client_id: { type: 'string' },
                      data_type: { type: 'string', enum: ['customer', 'transaction', 'document'] },
                      records: {
                        type: 'array',
                        items: { type: 'object' }
                      }
                    }
                  }
                }
              }
            },
            responses: {
              '200': {
                description: 'Data processed successfully',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean' },
                        batch_id: { type: 'string' },
                        processed: { type: 'number' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '/risk-assessment/{entity_id}': {
          get: {
            summary: 'Get risk assessment for entity',
            parameters: [
              {
                name: 'entity_id',
                in: 'path',
                required: true,
                schema: { type: 'string' }
              }
            ],
            responses: {
              '200': {
                description: 'Risk assessment data',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        entity_id: { type: 'string' },
                        risk_assessment: { type: 'object' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer'
          }
        }
      },
      security: [
        { BearerAuth: [] }
      ]
    };

    const blob = new Blob([JSON.stringify(openAPISpec, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'compliance-api-openapi-spec.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('OpenAPI specification downloaded');
  };

  const downloadPostmanCollection = () => {
    const postmanCollection = {
      info: {
        name: 'Compliance System API',
        description: 'Complete API collection for compliance system integration',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      variable: [
        {
          key: 'baseUrl',
          value: 'https://api.compliance.your-domain.com/v1',
          type: 'string'
        },
        {
          key: 'apiToken',
          value: 'YOUR_API_TOKEN',
          type: 'string'
        }
      ],
      auth: {
        type: 'bearer',
        bearer: [
          {
            key: 'token',
            value: '{{apiToken}}',
            type: 'string'
          }
        ]
      },
      item: [
        {
          name: 'Data Ingestion',
          item: [
            {
              name: 'Submit Customer Data',
              request: {
                method: 'POST',
                header: [
                  {
                    key: 'Content-Type',
                    value: 'application/json'
                  }
                ],
                body: {
                  mode: 'raw',
                  raw: JSON.stringify({
                    client_id: 'your-client-id',
                    data_type: 'customer',
                    records: [
                      {
                        external_id: 'cust_001',
                        full_name: 'John Doe',
                        email: 'john.doe@example.com',
                        date_of_birth: '1990-01-15',
                        nationality: 'US'
                      }
                    ]
                  }, null, 2)
                },
                url: {
                  raw: '{{baseUrl}}/data-ingestion',
                  host: ['{{baseUrl}}'],
                  path: ['data-ingestion']
                }
              }
            }
          ]
        },
        {
          name: 'Risk Assessment',
          item: [
            {
              name: 'Get Customer Risk Assessment',
              request: {
                method: 'GET',
                header: [],
                url: {
                  raw: '{{baseUrl}}/risk-assessment/cust_001?entity_type=customer&include_history=true',
                  host: ['{{baseUrl}}'],
                  path: ['risk-assessment', 'cust_001'],
                  query: [
                    {
                      key: 'entity_type',
                      value: 'customer'
                    },
                    {
                      key: 'include_history',
                      value: 'true'
                    }
                  ]
                }
              }
            }
          ]
        },
        {
          name: 'Compliance Cases',
          item: [
            {
              name: 'Get Cases',
              request: {
                method: 'GET',
                header: [],
                url: {
                  raw: '{{baseUrl}}/cases?status=open&priority=high&page=1&limit=50',
                  host: ['{{baseUrl}}'],
                  path: ['cases'],
                  query: [
                    {
                      key: 'status',
                      value: 'open'
                    },
                    {
                      key: 'priority',
                      value: 'high'
                    },
                    {
                      key: 'page',
                      value: '1'
                    },
                    {
                      key: 'limit',
                      value: '50'
                    }
                  ]
                }
              }
            }
          ]
        }
      ]
    };

    const blob = new Blob([JSON.stringify(postmanCollection, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'compliance-api-postman-collection.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Postman collection downloaded');
  };

  const CodeBlock = ({ code, language = 'json', id }: { code: string; language?: string; id: string }) => (
    <div className="relative">
      <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto border">
        <code className={`language-${language}`}>{code}</code>
      </pre>
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2"
        onClick={() => copyToClipboard(code, id)}
      >
        {copiedCode === id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Compliance System API Documentation
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={downloadOpenAPISpec}>
                <Download className="h-4 w-4 mr-2" />
                Download OpenAPI Spec
              </Button>
              <Button variant="outline" size="sm" onClick={downloadPostmanCollection}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Postman Collection
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="authentication">Auth</TabsTrigger>
              <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
              <TabsTrigger value="schemas">Schemas</TabsTrigger>
              <TabsTrigger value="sdks">SDKs</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
                <p className="text-muted-foreground mb-4">
                  The Compliance System Integration API allows you to securely transmit customer data, 
                  transaction records, and documents for compliance processing. Built with REST principles 
                  and secured with industry-standard protocols.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Enterprise Security
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• TLS 1.3 encryption</li>
                      <li>• OAuth 2.0 + JWT tokens</li>
                      <li>• Rate limiting & DDoS protection</li>
                      <li>• IP whitelisting available</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      High Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• 99.9% uptime SLA</li>
                      <li>• Global CDN distribution</li>
                      <li>• Real-time processing</li>
                      <li>• Bulk operations support</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Developer Friendly
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• RESTful API design</li>
                      <li>• Comprehensive SDKs</li>
                      <li>• Interactive documentation</li>
                      <li>• Sandbox environment</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Base URLs</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Badge variant="secondary" className="mb-2">Production</Badge>
                    <CodeBlock 
                      code="https://api.compliance.your-domain.com/v1" 
                      language="text"
                      id="prod-url"
                    />
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-2">Sandbox</Badge>
                    <CodeBlock 
                      code="https://sandbox-api.compliance.your-domain.com/v1" 
                      language="text"
                      id="sandbox-url"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Quick Start Example</h4>
                <CodeBlock 
                  code={`curl -X POST "https://api.compliance.your-domain.com/v1/data-ingestion" \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "client_id": "your-client-id",
    "data_type": "customer",
    "records": [
      {
        "external_id": "cust_001",
        "full_name": "John Doe",
        "email": "john.doe@example.com",
        "date_of_birth": "1990-01-15",
        "nationality": "US"
      }
    ]
  }'`}
                  language="bash"
                  id="quick-start"
                />
              </div>
            </TabsContent>

            <TabsContent value="authentication" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">API Authentication</h3>
                <p className="text-muted-foreground mb-4">
                  All API requests must include a valid API token in the Authorization header.
                  We support both API Key and OAuth 2.0 authentication methods.
                </p>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">API Key Authentication</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Include your API key in the Authorization header of every request:
                    </p>
                    <CodeBlock 
                      code={`Authorization: Bearer sk_live_1234567890abcdef...`}
                      language="text"
                      id="api-key-auth"
                    />
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-900 mb-2">Getting an API Key</h5>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                        <li>Contact your compliance officer or system administrator</li>
                        <li>Provide your client ID and integration requirements</li>
                        <li>Receive your unique API key and client credentials</li>
                        <li>Store the API key securely (never commit to version control)</li>
                      </ol>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">OAuth 2.0 Flow</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      For server-to-server authentication, use the Client Credentials flow:
                    </p>
                    
                    <div>
                      <h5 className="font-semibold text-sm mb-2">1. Get Access Token</h5>
                      <CodeBlock 
                        code={`curl -X POST "https://api.compliance.your-domain.com/oauth/token" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=client_credentials" \\
  -d "client_id=YOUR_CLIENT_ID" \\
  -d "client_secret=YOUR_CLIENT_SECRET" \\
  -d "scope=compliance:read compliance:write"`}
                        language="bash"
                        id="oauth-token"
                      />
                    </div>

                    <div>
                      <h5 className="font-semibold text-sm mb-2">2. Use Access Token</h5>
                      <CodeBlock 
                        code={`Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}
                        language="text"
                        id="oauth-use"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Rate Limiting</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">1,000</div>
                        <div className="text-sm text-muted-foreground">Requests per hour</div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">100</div>
                        <div className="text-sm text-muted-foreground">Bulk records per request</div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">10MB</div>
                        <div className="text-sm text-muted-foreground">Max request size</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="endpoints" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">API Endpoints</h3>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Data Ingestion</CardTitle>
                      <Badge>POST</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <code className="bg-muted px-2 py-1 rounded text-sm">
                        POST /v1/data-ingestion
                      </code>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Submit customer data, transaction records, or documents for compliance processing.
                    </p>
                    
                    <div>
                      <h5 className="font-semibold text-sm mb-2">Request Body:</h5>
                      <CodeBlock 
                        code={`{
  "client_id": "your-client-id",
  "data_type": "customer|transaction|document",
  "records": [
    {
      "external_id": "unique_identifier",
      "customer_id": "customer_identifier",
      "full_name": "John Doe",
      "email": "john.doe@example.com",
      "date_of_birth": "1990-01-15",
      "nationality": "US",
      "phone_number": "+1-555-0123",
      "address": "123 Main St, City, State 12345",
      "identity_number": "123-45-6789",
      "risk_factors": ["high_value_customer", "frequent_transactions"]
    }
  ],
  "metadata": {
    "source_system": "crm",
    "batch_id": "batch_001",
    "processing_priority": "normal"
  }
}`}
                        language="json"
                        id="data-ingestion-request"
                      />
                    </div>

                    <div>
                      <h5 className="font-semibold text-sm mb-2">Response:</h5>
                      <CodeBlock 
                        code={`{
  "success": true,
  "batch_id": "batch_67890",
  "processed": 10,
  "successful": 9,
  "failed": 1,
  "processing_time_ms": 1234,
  "log_id": "log_abc123",
  "errors": [
    {
      "record_id": "cust_005",
      "error_code": "INVALID_EMAIL",
      "message": "Email format is invalid",
      "field": "email"
    }
  ],
  "warnings": [
    {
      "record_id": "cust_003",
      "warning_code": "MISSING_OPTIONAL_FIELD",
      "message": "Phone number not provided",
      "field": "phone_number"
    }
  ]
}`}
                        language="json"
                        id="data-ingestion-response"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Risk Assessment</CardTitle>
                      <Badge variant="secondary">GET</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <code className="bg-muted px-2 py-1 rounded text-sm">
                        GET /v1/risk-assessment/:entity_id
                      </code>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Retrieve risk assessment results for a specific customer or transaction.
                    </p>

                    <div>
                      <h5 className="font-semibold text-sm mb-2">Query Parameters:</h5>
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <code className="text-xs bg-muted px-2 py-1 rounded">entity_type</code>
                          <span className="text-sm text-muted-foreground">customer | transaction</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <code className="text-xs bg-muted px-2 py-1 rounded">include_history</code>
                          <span className="text-sm text-muted-foreground">boolean (optional)</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-semibold text-sm mb-2">Response:</h5>
                      <CodeBlock 
                        code={`{
  "entity_id": "cust_001",
  "entity_type": "customer",
  "risk_assessment": {
    "overall_score": 75,
    "risk_level": "medium",
    "confidence": 0.89,
    "last_updated": "2024-01-15T10:30:00Z",
    "factors": [
      {
        "category": "transaction_volume",
        "score": 80,
        "weight": 0.3,
        "description": "High transaction volume in past 30 days"
      },
      {
        "category": "geographic_risk",
        "score": 45,
        "weight": 0.2,
        "description": "Transactions from medium-risk jurisdictions"
      }
    ]
  },
  "compliance_status": {
    "kyc_status": "verified",
    "aml_status": "pending_review",
    "sanctions_status": "clear",
    "pep_status": "not_pep"
  }
}`}
                        language="json"
                        id="risk-assessment-response"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Compliance Cases</CardTitle>
                      <Badge variant="outline">GET</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <code className="bg-muted px-2 py-1 rounded text-sm">
                        GET /v1/cases
                      </code>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Retrieve compliance cases with optional filtering and pagination.
                    </p>

                    <div>
                      <h5 className="font-semibold text-sm mb-2">Query Parameters:</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-muted px-2 py-1 rounded">status</code>
                            <span className="text-xs text-muted-foreground">open | closed | pending</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-muted px-2 py-1 rounded">priority</code>
                            <span className="text-xs text-muted-foreground">low | medium | high | critical</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-muted px-2 py-1 rounded">page</code>
                            <span className="text-xs text-muted-foreground">Page number (default: 1)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-muted px-2 py-1 rounded">limit</code>
                            <span className="text-xs text-muted-foreground">Results per page (max: 100)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="webhooks" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Webhook Notifications</h3>
                <p className="text-muted-foreground mb-4">
                  Configure webhook URLs to receive real-time notifications about compliance events,
                  risk assessments, and case updates.
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Webhook Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Register your webhook endpoint through the dashboard or API:
                  </p>
                  <CodeBlock 
                    code={`curl -X POST "https://api.compliance.your-domain.com/v1/webhooks" \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://your-domain.com/webhooks/compliance",
    "events": [
      "data_ingestion_completed",
      "risk_assessment_updated",
      "case_status_changed",
      "document_processed"
    ],
    "secret": "your_webhook_secret"
  }'`}
                    language="bash"
                    id="webhook-config"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Event Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <Badge className="mb-2">data_ingestion_completed</Badge>
                        <p className="text-sm text-muted-foreground">
                          Triggered when a batch of data has been processed
                        </p>
                      </div>
                      <div>
                        <Badge className="mb-2">risk_assessment_updated</Badge>
                        <p className="text-sm text-muted-foreground">
                          Sent when risk scores are recalculated
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Badge className="mb-2">case_status_changed</Badge>
                        <p className="text-sm text-muted-foreground">
                          Notifies when compliance case status changes
                        </p>
                      </div>
                      <div>
                        <Badge className="mb-2">document_processed</Badge>
                        <p className="text-sm text-muted-foreground">
                          Confirms document upload and processing
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Webhook Payload Example</CardTitle>
                </CardHeader>
                <CardContent>
                  <CodeBlock 
                    code={`{
  "event_id": "evt_abc123",
  "event_type": "risk_assessment_updated",
  "timestamp": "2024-01-15T10:30:00Z",
  "client_id": "your-client-id",
  "data": {
    "entity_id": "cust_001",
    "entity_type": "customer",
    "previous_risk_score": 65,
    "new_risk_score": 78,
    "risk_level": "medium",
    "changed_factors": [
      {
        "category": "transaction_volume",
        "previous_score": 70,
        "new_score": 85,
        "reason": "Significant increase in transaction frequency"
      }
    ],
    "assessment_id": "assess_xyz789"
  },
  "metadata": {
    "source": "automated_assessment",
    "trigger": "transaction_threshold_exceeded"
  }
}`}
                    language="json"
                    id="webhook-payload"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Webhook Security</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-semibold text-sm mb-2">Signature Verification</h5>
                      <p className="text-sm text-muted-foreground mb-2">
                        Each webhook includes an HMAC signature for verification:
                      </p>
                      <CodeBlock 
                        code={`X-Webhook-Signature: sha256=5d41402abc4b2a76b9719d911017c592`}
                        language="text"
                        id="webhook-signature"
                      />
                    </div>
                    
                    <div>
                      <h5 className="font-semibold text-sm mb-2">Verification Example (Node.js)</h5>
                      <CodeBlock 
                        code={`const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
  
  return signature === 'sha256=' + expectedSignature;
}`}
                        language="javascript"
                        id="webhook-verify"
                      />
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h5 className="font-semibold text-yellow-900 mb-2">Best Practices</h5>
                      <ul className="text-sm text-yellow-800 space-y-1">
                        <li>• Always verify webhook signatures</li>
                        <li>• Use HTTPS endpoints only</li>
                        <li>• Implement idempotency checks</li>
                        <li>• Return 2xx status codes promptly</li>
                        <li>• Handle retry logic gracefully</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schemas" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Data Schemas</h3>
                <p className="text-muted-foreground mb-4">
                  Complete reference for all data structures used in the API.
                </p>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Customer Schema</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock 
                      code={`{
  "external_id": "string (required)",
  "full_name": "string (required)",
  "email": "string (required, format: email)",
  "date_of_birth": "string (required, format: YYYY-MM-DD)",
  "nationality": "string (required, ISO 3166-1 alpha-2)",
  "phone_number": "string (optional, E.164 format)",
  "address": "string (optional)",
  "identity_number": "string (optional)",
  "occupation": "string (optional)",
  "source_of_funds": "string (optional)",
  "expected_transaction_volume": "number (optional)",
  "risk_factors": "array of strings (optional)",
  "custom_fields": "object (optional)"
}`}
                      language="json"
                      id="customer-schema"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Transaction Schema</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock 
                      code={`{
  "external_id": "string (required)",
  "customer_id": "string (required)",
  "transaction_type": "credit|debit|transfer (required)",
  "amount": "number (required)",
  "currency": "string (required, ISO 4217)",
  "counterparty": {
    "name": "string (optional)",
    "account_number": "string (optional)",
    "bank_name": "string (optional)",
    "country": "string (optional)"
  },
  "transaction_date": "string (required, ISO 8601)",
  "value_date": "string (optional, ISO 8601)",
  "description": "string (optional)",
  "channel": "online|branch|atm|mobile (optional)",
  "risk_indicators": "array of strings (optional)",
  "custom_fields": "object (optional)"
}`}
                      language="json"
                      id="transaction-schema"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Document Schema</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock 
                      code={`{
  "external_id": "string (required)",
  "customer_id": "string (required)",
  "document_type": "passport|national_id|driver_license|utility_bill|bank_statement (required)",
  "file_name": "string (required)",
  "file_content": "string (required, base64 encoded)",
  "file_type": "pdf|jpg|jpeg|png (required)",
  "issue_date": "string (optional, YYYY-MM-DD)",
  "expiry_date": "string (optional, YYYY-MM-DD)",
  "issuing_authority": "string (optional)",
  "document_number": "string (optional)",
  "custom_fields": "object (optional)"
}`}
                      language="json"
                      id="document-schema"
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="sdks" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Official SDKs</h3>
                <p className="text-muted-foreground mb-4">
                  We provide official SDKs for popular programming languages to help you integrate quickly.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Node.js / JavaScript</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock 
                      code={`npm install @compliance/api-client`}
                      language="bash"
                      id="sdk-nodejs"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Python</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock 
                      code={`pip install compliance-api-client`}
                      language="bash"
                      id="sdk-python"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Java</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock 
                      code={`implementation 'com.compliance:api-client:1.0.0'`}
                      language="gradle"
                      id="sdk-java"
                    />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Node.js Example</CardTitle>
                </CardHeader>
                <CardContent>
                  <CodeBlock 
                    code={`const { ComplianceClient } = require('@compliance/api-client');

const client = new ComplianceClient({
  apiKey: 'sk_live_...',
  environment: 'production' // or 'sandbox'
});

// Submit customer data
async function createCustomer() {
  try {
    const result = await client.dataIngestion.submit({
      clientId: 'your-client-id',
      dataType: 'customer',
      records: [{
        externalId: 'cust_001',
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        dateOfBirth: '1990-01-15',
        nationality: 'US'
      }]
    });
    
    console.log('Ingestion result:', result);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Get risk assessment
async function getRiskAssessment(customerId) {
  try {
    const assessment = await client.riskAssessment.get(customerId, {
      entityType: 'customer',
      includeHistory: true
    });
    
    console.log('Risk assessment:', assessment);
  } catch (error) {
    console.error('Error:', error.message);
  }
}`}
                    language="javascript"
                    id="sdk-nodejs-example"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Python Example</CardTitle>
                </CardHeader>
                <CardContent>
                  <CodeBlock 
                    code={`from compliance_api_client import ComplianceClient

client = ComplianceClient(
    api_key='sk_live_...',
    environment='production'  # or 'sandbox'
)

# Submit customer data
def create_customer():
    try:
        result = client.data_ingestion.submit({
            'client_id': 'your-client-id',
            'data_type': 'customer',
            'records': [{
                'external_id': 'cust_001',
                'full_name': 'John Doe',
                'email': 'john.doe@example.com',
                'date_of_birth': '1990-01-15',
                'nationality': 'US'
            }]
        })
        
        print(f'Ingestion result: {result}')
    except Exception as error:
        print(f'Error: {error}')

# Get risk assessment
def get_risk_assessment(customer_id):
    try:
        assessment = client.risk_assessment.get(
            customer_id,
            entity_type='customer',
            include_history=True
        )
        
        print(f'Risk assessment: {assessment}')
    except Exception as error:
        print(f'Error: {error}')`}
                    language="python"
                    id="sdk-python-example"
                  />
                </CardContent>
              </Card>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-semibold text-blue-900 mb-2">Need Help?</h5>
                <p className="text-sm text-blue-800 mb-3">
                  Our developer support team is here to help you integrate successfully.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    View Examples
                  </Button>
                  <Button size="sm" variant="outline">
                    Contact Support
                  </Button>
                  <Button size="sm" variant="outline">
                    Join Discord
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default APIDocumentation;
