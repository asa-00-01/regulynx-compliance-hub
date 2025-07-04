import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, AlertTriangle, Eye, Download } from 'lucide-react';
import config from '@/config/environment';

interface SecurityEvent {
  id: string;
  type: 'auth' | 'rate_limit' | 'csp_violation' | 'security_header' | 'input_validation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  details?: any;
  userAgent?: string;
  ip?: string;
}

interface SecurityAuditLogProps {
  embedded?: boolean;
}

const SecurityAuditLog: React.FC<SecurityAuditLogProps> = ({ embedded = false }) => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Mock security events for demonstration
    const mockEvents: SecurityEvent[] = [
      {
        id: '1',
        type: 'auth',
        severity: 'medium',
        message: 'Failed login attempt',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        details: { email: 'user@example.com', attempts: 3 }
      },
      {
        id: '2',
        type: 'rate_limit',
        severity: 'high',
        message: 'Rate limit exceeded',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        details: { endpoint: '/api/login', limit: 5, attempts: 8 }
      },
      {
        id: '3',
        type: 'csp_violation',
        severity: 'medium',
        message: 'Content Security Policy violation detected',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        details: { violatedDirective: 'script-src', blockedURI: 'inline' }
      }
    ];

    setEvents(mockEvents);
  }, []);

  const getSeverityColor = (severity: SecurityEvent['severity']) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'auth': return '🔐';
      case 'rate_limit': return '⏱️';
      case 'csp_violation': return '🚫';
      case 'security_header': return '🛡️';
      case 'input_validation': return '🔍';
      default: return '⚠️';
    }
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(events, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `security-audit-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // If embedded, show content without card wrapper
  if (embedded) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Security Audit Log</span>
          </div>
          <Button
            onClick={exportLogs}
            variant="ghost"
            size="sm"
          >
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
        </div>
        <ScrollArea className="h-80 p-4">
          {events.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              No security events recorded
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="border rounded-lg p-3 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span>{getTypeIcon(event.type)}</span>
                      <Badge variant={getSeverityColor(event.severity)} className="text-xs">
                        {event.severity}
                      </Badge>
                    </div>
                    <span className="text-muted-foreground">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="font-medium mb-1">{event.message}</div>
                  {event.details && (
                    <pre className="text-muted-foreground bg-muted p-2 rounded text-xs overflow-hidden">
                      {JSON.stringify(event.details, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    );
  }

  // Don't show floating version anymore
  return null;
};

export default SecurityAuditLog;
