
import { useState } from 'react';
import { TransactionAlert } from '@/types/transaction';
import { useToast } from '@/hooks/use-toast';

export function useAlertManagement(initialAlerts: TransactionAlert[]) {
  const [alerts, setAlerts] = useState<TransactionAlert[]>(initialAlerts);
  const { toast } = useToast();

  // Handle alert status changes
  const updateAlertStatus = (alertId: string, newStatus: TransactionAlert['status']) => {
    setAlerts(currentAlerts => 
      currentAlerts.map(alert => 
        alert.id === alertId ? { ...alert, status: newStatus } : alert
      )
    );
    
    toast({
      title: "Alert Updated",
      description: `Alert status changed to ${newStatus}`
    });
  };

  // Add note to an alert
  const addAlertNote = (alertId: string, note: string) => {
    setAlerts(currentAlerts => 
      currentAlerts.map(alert => 
        alert.id === alertId 
          ? { 
              ...alert, 
              notes: [...(alert.notes || []), note] 
            } 
          : alert
      )
    );
    
    toast({
      title: "Note Added",
      description: "The note has been added to the alert"
    });
  };

  // Create compliance case from alert
  const createCaseFromAlert = (alertId: string) => {
    // In a real implementation, this would create a case in the database
    // For now, we'll just update the alert status
    updateAlertStatus(alertId, 'investigating');
    
    toast({
      title: "Case Created",
      description: "A new compliance case has been created from this alert"
    });
  };

  // Dismiss alert
  const dismissAlert = (alertId: string) => {
    updateAlertStatus(alertId, 'closed');
    
    toast({
      title: "Alert Dismissed",
      description: "The alert has been marked as closed"
    });
  };

  return {
    alerts,
    setAlerts,
    updateAlertStatus,
    addAlertNote,
    createCaseFromAlert,
    dismissAlert
  };
}
