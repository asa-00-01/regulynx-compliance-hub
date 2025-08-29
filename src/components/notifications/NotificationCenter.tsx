
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  XCircle, 
  Settings, 
  Trash2, 
  Eye,
  EyeOff,
  RefreshCw,
  Filter,
  Download,
  Save
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'critical';
  category: 'system' | 'compliance' | 'security' | 'user' | 'transaction';
  priority: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  createdAt: string;
  expiresAt?: string;
  actions?: NotificationAction[];
  metadata?: Record<string, string | number | boolean>;
}

interface NotificationAction {
  label: string;
  action: string;
  url?: string;
}

interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  frequency: 'immediate' | 'hourly' | 'daily';
  categories: {
    system: boolean;
    compliance: boolean;
    security: boolean;
    user: boolean;
    transaction: boolean;
  };
  priorities: {
    low: boolean;
    medium: boolean;
    high: boolean;
    critical: boolean;
  };
}

const NotificationCenter: React.FC = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    inAppEnabled: true,
    frequency: 'immediate',
    categories: {
      system: true,
      compliance: true,
      security: true,
      user: true,
      transaction: true,
    },
    priorities: {
      low: true,
      medium: true,
      high: true,
      critical: true,
    },
  });
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Sample notifications for demonstration
  const sampleNotifications: Notification[] = [
    {
      id: '1',
      title: 'High Risk Transaction Detected',
      message: 'Transaction ID TXN-12345 has been flagged for manual review due to high risk score.',
      type: 'warning',
      category: 'transaction',
      priority: 'high',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      actions: [
        { label: 'Review Transaction', action: 'review', url: '/transactions/TXN-12345' },
        { label: 'Dismiss', action: 'dismiss' }
      ],
      metadata: {
        transactionId: 'TXN-12345',
        amount: 15000,
        riskScore: 85
      }
    },
    {
      id: '2',
      title: 'PEP Match Found',
      message: 'Customer John Doe has been identified as a Politically Exposed Person.',
      type: 'critical',
      category: 'compliance',
      priority: 'critical',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      actions: [
        { label: 'Review Customer', action: 'review', url: '/kyc-verification' },
        { label: 'Generate Case', action: 'generate_case' }
      ],
      metadata: {
        customerId: 'CUST-789',
        pepLevel: 'high',
        country: 'Russia'
      }
    },
    {
      id: '3',
      title: 'System Maintenance Scheduled',
      message: 'Scheduled maintenance will occur on Saturday at 2:00 AM UTC.',
      type: 'info',
      category: 'system',
      priority: 'medium',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days from now
      actions: [
        { label: 'View Details', action: 'view_details' }
      ]
    },
    {
      id: '4',
      title: 'Failed Login Attempt',
      message: 'Multiple failed login attempts detected for user admin@company.com.',
      type: 'error',
      category: 'security',
      priority: 'high',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
      actions: [
        { label: 'Review Security Log', action: 'review_log', url: '/audit-logs' },
        { label: 'Reset Password', action: 'reset_password' }
      ],
      metadata: {
        username: 'admin@company.com',
        attempts: 5,
        ipAddress: '192.168.1.100'
      }
    },
    {
      id: '5',
      title: 'SAR Filed Successfully',
      message: 'Suspicious Activity Report SAR-2024-001 has been successfully filed with authorities.',
      type: 'success',
      category: 'compliance',
      priority: 'medium',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
      actions: [
        { label: 'View SAR', action: 'view_sar', url: '/sar-center' }
      ],
      metadata: {
        sarId: 'SAR-2024-001',
        filingDate: new Date().toISOString()
      }
    }
  ];

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      // TODO: Load notifications from API/database
      console.log('Loading notifications...');
      setNotifications(sampleNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
      
      toast({
        title: 'Success',
        description: 'Notification marked as read',
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
      );
      
      toast({
        title: 'Success',
        description: 'Notification deleted',
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    if (confirm('Are you sure you want to clear all notifications?')) {
      try {
        setNotifications([]);
        
        toast({
          title: 'Success',
          description: 'All notifications cleared',
        });
      } catch (error) {
        console.error('Error clearing notifications:', error);
      }
    }
  };

  const saveSettings = async () => {
    try {
      // TODO: Save settings to API/database
      console.log('Saving notification settings:', settings);
      
      toast({
        title: 'Success',
        description: 'Notification settings saved',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'system': return 'bg-blue-100 text-blue-800';
      case 'compliance': return 'bg-purple-100 text-purple-800';
      case 'security': return 'bg-red-100 text-red-800';
      case 'user': return 'bg-green-100 text-green-800';
      case 'transaction': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !notification.read) ||
      (filter === 'read' && notification.read);
    
    const matchesCategory = categoryFilter === 'all' || notification.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || notification.priority === priorityFilter;
    
    return matchesFilter && matchesCategory && matchesPriority;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading notifications...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Notification Center</h2>
          <p className="text-muted-foreground">
            Manage your notifications and preferences
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllAsRead}>
            <Eye className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
          <Button variant="outline" onClick={clearAllNotifications}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications">
            Notifications ({unreadCount} unread)
          </TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={filter} onValueChange={(value) => setFilter(value as 'all' | 'unread' | 'read')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Notifications</SelectItem>
                      <SelectItem value="unread">Unread Only</SelectItem>
                      <SelectItem value="read">Read Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="transaction">Transaction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button variant="outline" onClick={loadNotifications}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No notifications</h3>
                    <p className="text-muted-foreground">
                      {filter === 'all' ? 'You\'re all caught up!' : 'No notifications match your filters.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card key={notification.id} className={`${!notification.read ? 'border-l-4 border-l-blue-500' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">
                          {getTypeIcon(notification.type)}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{notification.title}</h3>
                            <Badge className={getPriorityColor(notification.priority)}>
                              {notification.priority.toUpperCase()}
                            </Badge>
                            <Badge className={getCategoryColor(notification.category)}>
                              {notification.category}
                            </Badge>
                            {!notification.read && (
                              <Badge variant="secondary">NEW</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              {new Date(notification.createdAt).toLocaleString()}
                            </span>
                            {notification.metadata && (
                              <span>
                                {Object.entries(notification.metadata).map(([key, value]) => (
                                  <span key={key} className="mr-2">
                                    {key}: {String(value)}
                                  </span>
                                ))}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {notification.actions && notification.actions.length > 0 && (
                          <div className="flex gap-1">
                            {notification.actions.map((action, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (action.url) {
                                    window.open(action.url, '_blank');
                                  }
                                  console.log('Action:', action.action);
                                }}
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}
                        
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Delivery Methods */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Delivery Methods</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={settings.emailEnabled}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailEnabled: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive urgent notifications via SMS
                      </p>
                    </div>
                    <Switch
                      checked={settings.smsEnabled}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, smsEnabled: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications in your browser
                      </p>
                    </div>
                    <Switch
                      checked={settings.pushEnabled}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, pushEnabled: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>In-App Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Show notifications within the application
                      </p>
                    </div>
                    <Switch
                      checked={settings.inAppEnabled}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, inAppEnabled: checked }))}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Frequency */}
              <div className="space-y-2">
                <Label>Notification Frequency</Label>
                                 <Select 
                   value={settings.frequency} 
                   onValueChange={(value) => setSettings(prev => ({ ...prev, frequency: value as 'immediate' | 'hourly' | 'daily' }))}
                 >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="hourly">Hourly Digest</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Categories */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Categories</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(settings.categories).map(([category, enabled]) => (
                    <div key={category} className="flex items-center justify-between">
                      <Label className="capitalize">{category}</Label>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({
                            ...prev,
                            categories: { ...prev.categories, [category]: checked }
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Priorities */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Priorities</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(settings.priorities).map(([priority, enabled]) => (
                    <div key={priority} className="flex items-center justify-between">
                      <Label className="capitalize">{priority}</Label>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({
                            ...prev,
                            priorities: { ...prev.priorities, [priority]: checked }
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveSettings}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationCenter;
