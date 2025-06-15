
import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TooltipHelp } from '@/components/ui/tooltip-custom';
import { mockNotifications } from '@/mocks/notificationData';
import { Notification } from '@/types/notification';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const NotificationIcon = ({ type }: { type: Notification['type'] }) => {
  const colorClass = {
    alert: 'text-red-500',
    case: 'text-blue-500',
    system: 'text-gray-500',
  }[type];

  return <Bell className={cn('h-4 w-4', colorClass)} />;
};

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // In a real app, you'd fetch this from an API
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };
  
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markNotificationAsRead(notification.id);
      setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));
    }
    // Navigate to a relevant page, e.g.
    if(notification.type === 'case') {
      navigate('/cases');
    }
  };

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <DropdownMenu>
      <TooltipHelp content="View notifications">
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-regulynx-red-alert text-xs text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
            <span className="sr-only">Notifications</span>
          </Button>
        </DropdownMenuTrigger>
      </TooltipHelp>
      <DropdownMenuContent className="w-80 md:w-96" align="end">
        <DropdownMenuLabel>
          <div className="flex items-center justify-between">
            <span className="font-semibold">Notifications</span>
            {unreadCount > 0 && (
                <Button variant="link" size="sm" className="h-auto p-0" onClick={handleMarkAllAsRead}>
                    Mark all as read
                </Button>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-96 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <DropdownMenuItem
                key={notification.id}
                className={cn('cursor-pointer items-start gap-3', !notification.read && 'bg-accent')}
                onSelect={(e) => { e.preventDefault(); handleNotificationClick(notification); }}
              >
                <div className="mt-1">
                  <NotificationIcon type={notification.type} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{notification.title}</p>
                  <p className="text-sm text-muted-foreground">{notification.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {!notification.read && (
                    <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" title="Unread"></div>
                )}
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              You have no new notifications.
            </div>
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center cursor-pointer" onSelect={() => navigate('/profile?tab=preferences')}>
            <span>Notification Settings</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
