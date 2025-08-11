
import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const NotificationBell = () => {
  const notificationCount = 0; // This would come from your notification system

  return (
    <Button variant="ghost" size="icon" className="relative">
      <Bell className="h-5 w-5" />
      {notificationCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
        >
          {notificationCount > 9 ? '9+' : notificationCount}
        </Badge>
      )}
      <span className="sr-only">Notifications</span>
    </Button>
  );
};

export default NotificationBell;
