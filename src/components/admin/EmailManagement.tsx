
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEmailAutomation } from '@/hooks/useEmailAutomation';
import { EmailTemplate } from '@/services/emailAutomation';
import { Mail, Send, Calendar, History, Settings } from 'lucide-react';

const EmailManagement = () => {
  const { templates, isSending, sendEmail, scheduleEmail, loadTemplates } = useEmailAutomation();
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [recipient, setRecipient] = useState('');
  const [variables, setVariables] = useState<Record<string, string>>({});

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      // Initialize variables object
      const initialVars: Record<string, string> = {};
      template.variables.forEach(variable => {
        initialVars[variable] = '';
      });
      setVariables(initialVars);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedTemplate || !recipient) return;
    
    try {
      await sendEmail(selectedTemplate.id, recipient, variables);
      setRecipient('');
      setVariables({});
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  };

  const handleVariableChange = (variable: string, value: string) => {
    setVariables(prev => ({ ...prev, [variable]: value }));
  };

  const getTypeColor = (category: string) => {
    switch (category) {
      case 'compliance': return 'bg-orange-100 text-orange-800';
      case 'kyc': return 'bg-green-100 text-green-800';
      case 'system': return 'bg-blue-100 text-blue-800';
      case 'marketing': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Mail className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Email Management</h1>
      </div>

      <Tabs defaultValue="send" className="space-y-4">
        <TabsList>
          <TabsTrigger value="send">Send Email</TabsTrigger>
          <TabsTrigger value="schedule">Schedule Email</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="send">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Send className="h-5 w-5" />
                  <span>Send Email</span>
                </CardTitle>
                <CardDescription>Send an email using a predefined template</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="template">Email Template</Label>
                  <Select onValueChange={handleTemplateSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="recipient">Recipient Email</Label>
                  <Input
                    id="recipient"
                    type="email"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="Enter recipient email"
                  />
                </div>

                {selectedTemplate && selectedTemplate.variables.length > 0 && (
                  <div>
                    <Label>Template Variables</Label>
                    <div className="space-y-2 mt-2">
                      {selectedTemplate.variables.map(variable => (
                        <div key={variable}>
                          <Label htmlFor={variable} className="text-sm">
                            {variable.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Label>
                          <Input
                            id={variable}
                            value={variables[variable] || ''}
                            onChange={(e) => handleVariableChange(variable, e.target.value)}
                            placeholder={`Enter ${variable}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleSendEmail} 
                  disabled={!selectedTemplate || !recipient || isSending}
                  className="w-full"
                >
                  {isSending ? 'Sending...' : 'Send Email'}
                </Button>
              </CardContent>
            </Card>

            {selectedTemplate && (
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>Template: {selectedTemplate.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Subject</Label>
                      <p className="text-sm text-muted-foreground">{selectedTemplate.subject}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Category</Label>
                      <Badge className={getTypeColor(selectedTemplate.category)}>
                        {selectedTemplate.category}
                      </Badge>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Content Preview</Label>
                      <div 
                        className="border rounded p-3 text-sm bg-gray-50 max-h-64 overflow-y-auto"
                        dangerouslySetInnerHTML={{ __html: selectedTemplate.html_content }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Email Templates</span>
              </CardTitle>
              <CardDescription>Manage email templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map(template => (
                  <Card key={template.id} className="border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Badge className={getTypeColor(template.category)}>
                          {template.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">{template.subject}</p>
                      {template.variables.length > 0 && (
                        <div>
                          <Label className="text-xs">Variables:</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {template.variables.map(variable => (
                              <Badge key={variable} variant="outline" className="text-xs">
                                {variable}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="h-5 w-5" />
                <span>Email History</span>
              </CardTitle>
              <CardDescription>View sent and scheduled emails</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Email history will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailManagement;
