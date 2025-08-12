
import React from 'react';
import { Bell, Clock, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

const NotificationBell = () => {
  const notifications = [
    {
      id: 1,
      type: 'alert',
      title: 'High Risk Transaction Detected',
      message: 'Transaction ID: TXN-2024-001 requires immediate review',
      time: '2 minutes ago',
      unread: true,
      icon: AlertTriangle,
      iconColor: 'text-destructive'
    },
    {
      id: 2,
      type: 'info',
      title: 'KYC Review Completed',
      message: 'User John Doe has been successfully verified',
      time: '1 hour ago',
      unread: true,
      icon: CheckCircle,
      iconColor: 'text-green-600'
    },
    {
      id: 3,
      type: 'info',
      title: 'System Maintenance',
      message: 'Scheduled maintenance tonight at 2:00 AM EST',
      time: '3 hours ago',
      unread: false,
      icon: Info,
      iconColor: 'text-blue-600'
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative h-8 w-8 p-0">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} new
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-72">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex items-start gap-3 p-3 cursor-pointer hover:bg-accent/50"
                >
                  <div className={`p-1 rounded-full bg-muted ${notification.iconColor}`}>
                    <Icon className="h-3 w-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {notification.title}
                      </p>
                      {notification.unread && (
                        <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {notification.time}
                      </span>
                    </div>
                  </div>
                </DropdownMenuItem>
              );
            })
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center p-2">
              <Button variant="ghost" size="sm" className="w-full text-xs">
                View all notifications
              </Button>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
