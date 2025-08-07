
import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth/AuthContext';

interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  timestamp: Date;
  read: boolean;
}

const NotificationCenter: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  useEffect(() => {
    // Initialize with some sample notifications
    setNotifications([
      {
        id: '1',
        type: 'info',
        message: 'Welcome to ComplianceOS',
        timestamp: new Date(),
        read: false,
      },
    ]);
  }, []);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="relative">
      <Button variant="ghost" onClick={toggleOpen}>
        <Bell className="h-5 w-5" />
        {notifications.filter(n => !n.read).length > 0 && (
          <Badge className="absolute top-0 right-0 rounded-full h-4 w-4 p-0 flex items-center justify-center text-xs">
            {notifications.filter(n => !n.read).length}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-md shadow-lg z-50 border">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearAllNotifications}>
                Clear All
              </Button>
            </CardHeader>
            <CardContent className="pl-2 pr-2">
              {notifications.length === 0 ? (
                <CardDescription>No notifications</CardDescription>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-2">
                        {getIcon(notification.type)}
                        <div>
                          <p className="text-sm">{notification.message}</p>
                          <p className="text-xs text-gray-500">
                            {notification.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
