
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Flag, ArrowUpRight, X, LayoutGrid, Clock } from 'lucide-react';

// Mock alerts data
const initialAlerts = [
  {
    id: '1',
    userId: '101',
    userName: 'John Doe',
    type: 'transaction_spike',
    description: 'Sudden increase in transaction frequency (10 in last 24h)',
    severity: 'high',
    timestamp: '2025-05-04T08:30:00Z',
    dismissed: false
  },
  {
    id: '2',
    userId: '102',
    userName: 'Sofia Rodriguez',
    type: 'suspicious_country',
    description: 'Transaction with high-risk country (Nigeria)',
    severity: 'medium',
    timestamp: '2025-05-03T14:45:00Z',
    dismissed: false
  },
  {
    id: '3',
    userId: '103',
    userName: 'Alexander Petrov',
    type: 'incomplete_kyc',
    description: 'KYC documents still incomplete after 14-day deadline',
    severity: 'medium',
    timestamp: '2025-05-03T10:15:00Z',
    dismissed: false
  },
  {
    id: '4',
    userId: '104',
    userName: 'Jane Smith',
    type: 'transaction_amount',
    description: 'Large transaction (75,000 SEK) requiring enhanced due diligence',
    severity: 'high',
    timestamp: '2025-05-04T09:20:00Z',
    dismissed: false
  },
  {
    id: '5',
    userId: '105',
    userName: 'Ahmed Hassan',
    type: 'rapid_transfers',
    description: 'Multiple rapid transfers in sequence (5 transactions in 2 hours)',
    severity: 'high',
    timestamp: '2025-05-04T11:30:00Z',
    dismissed: false
  }
];

const RedFlagsAlerts = () => {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [escalatingAlert, setEscalatingAlert] = useState<any>(null);
  const [escalationDialogOpen, setEscalationDialogOpen] = useState(false);
  const { toast } = useToast();

  // Handle dismissing an alert
  const handleDismissAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId
        ? { ...alert, dismissed: true }
        : alert
    ));
    
    toast({
      title: "Alert dismissed",
      description: "The alert has been dismissed and won't appear in the list anymore"
    });
  };

  // Handle escalating an alert to a case
  const handleEscalateAlert = () => {
    if (!escalatingAlert) return;
    
    // Mark alert as dismissed after escalation
    setAlerts(prev => prev.map(alert => 
      alert.id === escalatingAlert.id
        ? { ...alert, dismissed: true }
        : alert
    ));
    
    toast({
      title: "Alert escalated",
      description: `Alert for ${escalatingAlert.userName} has been escalated to a compliance case`
    });
    
    setEscalatingAlert(null);
    setEscalationDialogOpen(false);
  };

  // Start escalation process for an alert
  const startEscalation = (alert: any) => {
    setEscalatingAlert(alert);
    setEscalationDialogOpen(true);
  };

  // Helper function to get severity indicator color class
  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case 'low':
        return "bg-blue-100 text-blue-800";
      case 'medium':
        return "bg-yellow-100 text-yellow-800";
      case 'high':
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Helper function to get alert type icon
  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'transaction_spike':
        return <ArrowUpRight className="h-5 w-5 text-red-500" />;
      case 'suspicious_country':
        return <Flag className="h-5 w-5 text-orange-500" />;
      case 'incomplete_kyc':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'transaction_amount':
        return <ArrowUpRight className="h-5 w-5 text-red-500" />;
      case 'rapid_transfers':
        return <Clock className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  // Filter out dismissed alerts
  const activeAlerts = alerts.filter(alert => !alert.dismissed);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Red Flags & Alerts</CardTitle>
            <CardDescription>
              Recent compliance alerts that require attention
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <LayoutGrid className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activeAlerts.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No active alerts</h3>
              <p className="text-muted-foreground">
                All current alerts have been handled
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeAlerts.map((alert) => (
                <Card key={alert.id} className="overflow-hidden">
                  <div className={`h-1 ${getSeverityClass(alert.severity)}`} />
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="mt-1">
                          {getAlertTypeIcon(alert.type)}
                        </div>
                        <div>
                          <h4 className="font-medium">{alert.userName}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {alert.description}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getSeverityClass(alert.severity)}`}>
                              {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)} Severity
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(alert.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDismissAlert(alert.id)}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Dismiss</span>
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button 
                        size="sm" 
                        onClick={() => startEscalation(alert)}
                      >
                        Escalate to Case
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t bg-muted/50 px-6 py-3">
          <div className="flex items-center justify-between w-full text-xs">
            <div className="text-muted-foreground">
              Showing {activeAlerts.length} active alerts
            </div>
            <div>
              <a href="#" className="text-primary hover:underline">
                View alert history
              </a>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* Escalation Dialog */}
      <AlertDialog 
        open={escalationDialogOpen} 
        onOpenChange={setEscalationDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Escalate to Compliance Case</AlertDialogTitle>
            <AlertDialogDescription>
              {escalatingAlert && (
                <>
                  You are about to escalate the alert for <strong>{escalatingAlert.userName}</strong> to a formal compliance case.
                  This will create a new case that requires review and resolution.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleEscalateAlert}>
              Create Compliance Case
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RedFlagsAlerts;
