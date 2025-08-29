import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Bell, CheckCircle, Clock, AlertTriangle, Mail, MessageSquare, Smartphone } from 'lucide-react';
import { useEscalation } from '@/hooks/useEscalation';
import { EscalationNotification } from '@/types/escalation';
import { format } from 'date-fns';

const EscalationNotifications: React.FC = () => {
  const { pendingNotifications, markNotificationAsRead, loading } = useEscalation();
  const [selectedNotification, setSelectedNotification] = useState<EscalationNotification | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <Smartphone className="h-4 w-4" />;
      case 'in_app':
        return <MessageSquare className="h-4 w-4" />;
      case 'slack':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'read':
        return 'bg-gray-100 text-gray-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleViewDetails = (notification: EscalationNotification) => {
    setSelectedNotification(notification);
    setIsDetailDialogOpen(true);
  };

  const unreadCount = pendingNotifications.filter(n => n.status !== 'read').length;

  if (loading.notifications) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Escalation Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array(3).fill(null).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Escalation Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingNotifications.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-muted-foreground">No pending notifications</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingNotifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border rounded-lg ${
                    notification.status !== 'read' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="mt-1">
                        {getNotificationIcon(notification.notificationType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-sm truncate">
                            {notification.subject || 'Escalation Notification'}
                          </h4>
                          <Badge className={getStatusColor(notification.status)}>
                            {notification.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          <span>{format(new Date(notification.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                          <span className="capitalize">{notification.notificationType}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(notification)}
                      >
                        View
                      </Button>
                      {notification.status !== 'read' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {pendingNotifications.length > 5 && (
                <div className="text-center pt-4">
                  <Button variant="outline" size="sm">
                    View All ({pendingNotifications.length})
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedNotification && getNotificationIcon(selectedNotification.notificationType)}
              Notification Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about the escalation notification
            </DialogDescription>
          </DialogHeader>
          
          {selectedNotification && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <p className="text-sm capitalize">{selectedNotification.notificationType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Badge className={getStatusColor(selectedNotification.status)}>
                    {selectedNotification.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="text-sm">
                    {format(new Date(selectedNotification.createdAt), 'MMM dd, yyyy HH:mm:ss')}
                  </p>
                </div>
                {selectedNotification.sentAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Sent</label>
                    <p className="text-sm">
                      {format(new Date(selectedNotification.sentAt), 'MMM dd, yyyy HH:mm:ss')}
                    </p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Subject</label>
                <p className="text-sm font-medium mt-1">
                  {selectedNotification.subject || 'No subject'}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Message</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm whitespace-pre-wrap">{selectedNotification.message}</p>
                </div>
              </div>
              
              {selectedNotification.errorMessage && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Error</label>
                  <div className="mt-1 p-3 bg-red-50 rounded-md">
                    <p className="text-sm text-red-700">{selectedNotification.errorMessage}</p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-2 pt-4">
                {selectedNotification.status !== 'read' && (
                  <Button
                    onClick={() => {
                      handleMarkAsRead(selectedNotification.id);
                      setIsDetailDialogOpen(false);
                    }}
                  >
                    Mark as Read
                  </Button>
                )}
                <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EscalationNotifications;
