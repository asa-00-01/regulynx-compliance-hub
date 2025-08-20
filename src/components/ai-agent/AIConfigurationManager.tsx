import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Bot, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import { customerAIService } from '@/services/ai/customerAIService';
import { AIConfiguration, CustomerAISettings } from '@/types/ai';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface AIConfigurationManagerProps {
  customerId: string;
  onConfigurationChange?: () => void;
}

const AIConfigurationManager: React.FC<AIConfigurationManagerProps> = ({
  customerId,
  onConfigurationChange
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [configurations, setConfigurations] = useState<AIConfiguration[]>([]);
  const [customerSettings, setCustomerSettings] = useState<CustomerAISettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingConfiguration, setEditingConfiguration] = useState<AIConfiguration | null>(null);
  
  const [newConfiguration, setNewConfiguration] = useState({
    name: '',
    description: '',
    systemPrompt: '',
    availableTools: [] as string[],
    settings: {
      maxTokens: 1000,
      temperature: 0.7,
      model: 'gpt-4o-mini',
      enableMockMode: false,
      enableDatabaseLogging: true,
      enableConversationHistory: true,
      maxHistoryLength: 10
    }
  });

  // Load configurations and settings
  useEffect(() => {
    loadData();
  }, [customerId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [configs, settings] = await Promise.all([
        customerAIService.getCustomerConfigurations(customerId),
        customerAIService.getCustomerAISettings(customerId)
      ]);
      
      setConfigurations(configs);
      setCustomerSettings(settings);
    } catch (error) {
      console.error('Error loading AI configurations:', error);
      // Don't show error toast since this is expected when database tables don't exist
      // Just set empty configurations and default settings
      setConfigurations([]);
      setCustomerSettings({
        customerId,
        defaultConfigurationId: undefined,
        openaiApiKey: undefined,
        customTools: [],
        customCategories: [],
        preferences: {
          language: 'en',
          expertise: 'intermediate',
          focus: ['aml', 'kyc', 'sar'],
          responseStyle: 'detailed'
        },
        limits: {
          maxRequestsPerDay: 1000,
          maxTokensPerRequest: 1000,
          maxConversationLength: 50
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConfiguration = async () => {
    try {
      setSaving(true);
      
      const configId = await customerAIService.createAIConfiguration(customerId, {
        ...newConfiguration,
        isActive: true,
        responseCategories: {
          compliance: {
            name: 'AML & Compliance',
            description: 'Anti-money laundering and regulatory compliance',
            responses: [{
              content: 'Based on our compliance database, I can provide guidance on AML compliance.',
              tools: ['RAG System', 'Compliance Database'],
              confidence: 0.92,
              sources: ['AML Guidelines 2024', 'FATF Recommendations']
            }]
          },
          kyc: {
            name: 'KYC & Verification',
            description: 'Know Your Customer procedures and verification',
            responses: [{
              content: 'For KYC procedures, you need to verify identity documents and assess risk level.',
              tools: ['KYC Database', 'Document Verification'],
              confidence: 0.89,
              sources: ['KYC Procedures Manual', 'Identity Verification Standards']
            }]
          },
          general: {
            name: 'General Assistance',
            description: 'General compliance and platform assistance',
            responses: [{
              content: 'I can help with your compliance questions and provide guidance on various topics.',
              tools: ['RAG System', 'Compliance Database'],
              confidence: 0.85,
              sources: ['General Compliance Guidelines', 'Platform Documentation']
            }]
          }
        }
      });

      if (configId) {
        toast({
          title: 'Success',
          description: 'AI configuration created successfully',
          variant: 'default'
        });
        
        setIsCreateDialogOpen(false);
        setNewConfiguration({
          name: '',
          description: '',
          systemPrompt: '',
          availableTools: [],
          settings: {
            maxTokens: 1000,
            temperature: 0.7,
            model: 'gpt-4o-mini',
            enableMockMode: false,
            enableDatabaseLogging: true,
            enableConversationHistory: true,
            maxHistoryLength: 10
          }
        });
        
        await loadData();
        onConfigurationChange?.();
      }
    } catch (error) {
      console.error('Error creating AI configuration:', error);
      toast({
        title: 'Error',
        description: 'Failed to create AI configuration',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateConfiguration = async () => {
    if (!editingConfiguration) return;
    
    try {
      setSaving(true);
      
      const success = await customerAIService.updateAIConfiguration(
        editingConfiguration.id,
        {
          name: editingConfiguration.name,
          description: editingConfiguration.description,
          systemPrompt: editingConfiguration.systemPrompt,
          availableTools: editingConfiguration.availableTools,
          settings: editingConfiguration.settings
        }
      );

      if (success) {
        toast({
          title: 'Success',
          description: 'AI configuration updated successfully',
          variant: 'default'
        });
        
        setIsEditDialogOpen(false);
        setEditingConfiguration(null);
        
        await loadData();
        onConfigurationChange?.();
      }
    } catch (error) {
      console.error('Error updating AI configuration:', error);
      toast({
        title: 'Error',
        description: 'Failed to update AI configuration',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefaultConfiguration = async (configurationId: string) => {
    try {
      const success = await customerAIService.updateCustomerAISettings(customerId, {
        defaultConfigurationId: configurationId
      });

      if (success) {
        toast({
          title: 'Success',
          description: 'Default configuration updated',
          variant: 'default'
        });
        
        await loadData();
        onConfigurationChange?.();
      }
    } catch (error) {
      console.error('Error setting default configuration:', error);
      toast({
        title: 'Error',
        description: 'Failed to set default configuration',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading AI configurations...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Configuration Manager</h2>
          <p className="text-muted-foreground">
            Manage your AI assistant configurations and settings
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Configuration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create AI Configuration</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Configuration Name</Label>
                <Input
                  id="name"
                  value={newConfiguration.name}
                  onChange={(e) => setNewConfiguration(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Compliance Assistant v2"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newConfiguration.description}
                  onChange={(e) => setNewConfiguration(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this configuration"
                />
              </div>
              
              <div>
                <Label htmlFor="systemPrompt">System Prompt</Label>
                <Textarea
                  id="systemPrompt"
                  value={newConfiguration.systemPrompt}
                  onChange={(e) => setNewConfiguration(prev => ({ ...prev, systemPrompt: e.target.value }))}
                  placeholder="Define the AI assistant's role and behavior..."
                  rows={6}
                />
              </div>
              
              <div>
                <Label>Available Tools</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {[
                    'RAG System', 'Compliance Database', 'Risk Engine', 'Regulatory Updates',
                    'Case Management', 'AML Monitoring System', 'Transaction Analysis',
                    'Customer Profiling', 'Geographic Risk Assessment', 'KYC Database'
                  ].map((tool) => (
                    <div key={tool} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={tool}
                        checked={newConfiguration.availableTools.includes(tool)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewConfiguration(prev => ({
                              ...prev,
                              availableTools: [...prev.availableTools, tool]
                            }));
                          } else {
                            setNewConfiguration(prev => ({
                              ...prev,
                              availableTools: prev.availableTools.filter(t => t !== tool)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={tool} className="text-sm">{tool}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateConfiguration} disabled={saving || !newConfiguration.name}>
                {saving ? 'Creating...' : 'Create Configuration'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Configurations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Configurations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {configurations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No AI configurations found</p>
              <p className="text-sm">Create your first configuration to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {configurations.map((config) => (
                <div key={config.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{config.name}</h3>
                        {customerSettings?.defaultConfigurationId === config.id && (
                          <Badge variant="default">Default</Badge>
                        )}
                        {config.isActive ? (
                          <Badge variant="secondary">Active</Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </div>
                      
                      {config.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {config.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        {config.availableTools.slice(0, 5).map((tool) => (
                          <Badge key={tool} variant="outline" className="text-xs">
                            {tool}
                          </Badge>
                        ))}
                        {config.availableTools.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{config.availableTools.length - 5} more
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(config.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {customerSettings?.defaultConfigurationId !== config.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefaultConfiguration(config.id)}
                        >
                          Set Default
                        </Button>
                      )}
                      
                      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingConfiguration(config)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Edit AI Configuration</DialogTitle>
                          </DialogHeader>
                          
                          {editingConfiguration && (
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="edit-name">Configuration Name</Label>
                                <Input
                                  id="edit-name"
                                  value={editingConfiguration.name}
                                  onChange={(e) => setEditingConfiguration(prev => 
                                    prev ? { ...prev, name: e.target.value } : null
                                  )}
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="edit-description">Description</Label>
                                <Input
                                  id="edit-description"
                                  value={editingConfiguration.description || ''}
                                  onChange={(e) => setEditingConfiguration(prev => 
                                    prev ? { ...prev, description: e.target.value } : null
                                  )}
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="edit-systemPrompt">System Prompt</Label>
                                <Textarea
                                  id="edit-systemPrompt"
                                  value={editingConfiguration.systemPrompt}
                                  onChange={(e) => setEditingConfiguration(prev => 
                                    prev ? { ...prev, systemPrompt: e.target.value } : null
                                  )}
                                  rows={6}
                                />
                              </div>
                            </div>
                          )}
                          
                          <div className="flex justify-end space-x-2 pt-4">
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleUpdateConfiguration} disabled={saving}>
                              {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Settings */}
      {customerSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Customer AI Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Default Configuration</Label>
                <p className="text-sm text-muted-foreground">
                  {customerSettings.defaultConfigurationId 
                    ? configurations.find(c => c.id === customerSettings.defaultConfigurationId)?.name || 'Unknown'
                    : 'Not set'
                  }
                </p>
              </div>
              
              <div>
                <Label>Daily Request Limit</Label>
                <p className="text-sm text-muted-foreground">
                  {customerSettings.limits.maxRequestsPerDay} requests per day
                </p>
              </div>
              
              <div>
                <Label>Response Style</Label>
                <p className="text-sm text-muted-foreground capitalize">
                  {customerSettings.preferences.responseStyle}
                </p>
              </div>
              
              <div>
                <Label>Expertise Level</Label>
                <p className="text-sm text-muted-foreground capitalize">
                  {customerSettings.preferences.expertise}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIConfigurationManager;
