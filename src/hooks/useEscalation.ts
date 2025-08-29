import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { EscalationService } from '@/services/escalation/escalationService';
import {
  EscalationRule,
  EscalationHistory,
  EscalationNotification,
  SLATracking,
  EscalationSummary,
  EscalationMetrics,
  EscalationFilters,
  ManualEscalationRequest,
  EscalationResolutionRequest,
  CreateEscalationRuleRequest,
  UpdateEscalationRuleRequest
} from '@/types/escalation';

interface UseEscalationOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
  enableNotifications?: boolean;
}

export function useEscalation(options: UseEscalationOptions = {}) {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    enableNotifications = true
  } = options;

  const { toast } = useToast();
  const { user } = useAuth();

  // State management
  const [escalationRules, setEscalationRules] = useState<EscalationRule[]>([]);
  const [escalationHistory, setEscalationHistory] = useState<EscalationHistory[]>([]);
  const [escalationSummary, setEscalationSummary] = useState<EscalationSummary | null>(null);
  const [escalationMetrics, setEscalationMetrics] = useState<EscalationMetrics | null>(null);
  const [pendingNotifications, setPendingNotifications] = useState<EscalationNotification[]>([]);
  const [slaBreaches, setSlaBreaches] = useState<SLATracking[]>([]);
  const [loading, setLoading] = useState({
    rules: false,
    history: false,
    summary: false,
    metrics: false,
    notifications: false,
    slaBreaches: false
  });
  const [error, setError] = useState<string | null>(null);

  // Load escalation rules
  const loadEscalationRules = useCallback(async () => {
    setLoading(prev => ({ ...prev, rules: true }));
    setError(null);
    
    try {
      const rules = await EscalationService.getEscalationRules(user?.customer_id);
      setEscalationRules(rules);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load escalation rules';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, rules: false }));
    }
  }, [user?.customer_id, toast]);

  // Load escalation history
  const loadEscalationHistory = useCallback(async (filters: EscalationFilters = {}) => {
    setLoading(prev => ({ ...prev, history: true }));
    setError(null);
    
    try {
      const history = await EscalationService.getEscalationHistory(filters);
      setEscalationHistory(history);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load escalation history';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, history: false }));
    }
  }, [toast]);

  // Load escalation summary
  const loadEscalationSummary = useCallback(async () => {
    setLoading(prev => ({ ...prev, summary: true }));
    setError(null);
    
    try {
      const summary = await EscalationService.getEscalationSummary();
      setEscalationSummary(summary);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load escalation summary';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, summary: false }));
    }
  }, [toast]);

  // Load escalation metrics
  const loadEscalationMetrics = useCallback(async () => {
    setLoading(prev => ({ ...prev, metrics: true }));
    setError(null);
    
    try {
      const metrics = await EscalationService.getEscalationMetrics();
      setEscalationMetrics(metrics);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load escalation metrics';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, metrics: false }));
    }
  }, [toast]);

  // Load SLA breaches
  const loadSLABreaches = useCallback(async () => {
    setLoading(prev => ({ ...prev, slaBreaches: true }));
    setError(null);
    
    try {
      const breaches = await EscalationService.checkSLABreaches();
      setSlaBreaches(breaches);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load SLA breaches';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, slaBreaches: false }));
    }
  }, [toast]);

  // Manual escalation
  const manuallyEscalateCase = useCallback(async (request: ManualEscalationRequest) => {
    setError(null);
    
    try {
      const escalation = await EscalationService.manuallyEscalateCase(request);
      
      toast({
        title: 'Case Escalated',
        description: `Case has been escalated to level ${request.escalationLevel}`,
        variant: 'default'
      });

      // Refresh data
      await Promise.all([
        loadEscalationHistory(),
        loadEscalationSummary(),
        loadEscalationMetrics()
      ]);

      return escalation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to escalate case';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      throw err;
    }
  }, [loadEscalationHistory, loadEscalationSummary, loadEscalationMetrics, toast]);

  // Resolve escalation
  const resolveEscalation = useCallback(async (request: EscalationResolutionRequest) => {
    setError(null);
    
    try {
      await EscalationService.resolveEscalation(request);
      
      toast({
        title: 'Escalation Resolved',
        description: 'Escalation has been marked as resolved',
        variant: 'default'
      });

      // Refresh data
      await Promise.all([
        loadEscalationHistory(),
        loadEscalationSummary(),
        loadEscalationMetrics()
      ]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resolve escalation';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      throw err;
    }
  }, [loadEscalationHistory, loadEscalationSummary, loadEscalationMetrics, toast]);

  // Create escalation rule
  const createEscalationRule = useCallback(async (rule: CreateEscalationRuleRequest) => {
    setError(null);
    
    try {
      const newRule = await EscalationService.createEscalationRule(rule);
      
      toast({
        title: 'Rule Created',
        description: 'Escalation rule has been created successfully',
        variant: 'default'
      });

      // Refresh rules
      await loadEscalationRules();
      
      return newRule;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create escalation rule';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      throw err;
    }
  }, [loadEscalationRules, toast]);

  // Update escalation rule
  const updateEscalationRule = useCallback(async (ruleId: string, updates: UpdateEscalationRuleRequest) => {
    setError(null);
    
    try {
      const updatedRule = await EscalationService.updateEscalationRule(ruleId, updates);
      
      toast({
        title: 'Rule Updated',
        description: 'Escalation rule has been updated successfully',
        variant: 'default'
      });

      // Refresh rules
      await loadEscalationRules();
      
      return updatedRule;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update escalation rule';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      throw err;
    }
  }, [loadEscalationRules, toast]);

  // Delete escalation rule
  const deleteEscalationRule = useCallback(async (ruleId: string) => {
    setError(null);
    
    try {
      await EscalationService.deleteEscalationRule(ruleId);
      
      toast({
        title: 'Rule Deleted',
        description: 'Escalation rule has been deleted successfully',
        variant: 'default'
      });

      // Refresh rules
      await loadEscalationRules();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete escalation rule';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      throw err;
    }
  }, [loadEscalationRules, toast]);

  // Mark notification as read
  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    setError(null);
    
    try {
      await EscalationService.markNotificationAsRead(notificationId);
      
      // Update local state
      setPendingNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, status: 'read', readAt: new Date().toISOString() }
            : notification
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark notification as read';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  }, [toast]);

  // Check if case should be escalated
  const checkCaseEscalation = useCallback(async (caseId: string) => {
    setError(null);
    
    try {
      const results = await EscalationService.checkCaseEscalation(caseId);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check case escalation';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      throw err;
    }
  }, [toast]);

  // Get SLA tracking for a case
  const getSLATracking = useCallback(async (caseId: string) => {
    setError(null);
    
    try {
      const tracking = await EscalationService.getSLATracking(caseId);
      return tracking;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get SLA tracking';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      throw err;
    }
  }, [toast]);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    await Promise.all([
      loadEscalationRules(),
      loadEscalationHistory(),
      loadEscalationSummary(),
      loadEscalationMetrics(),
      loadSLABreaches()
    ]);
  }, [loadEscalationRules, loadEscalationHistory, loadEscalationSummary, loadEscalationMetrics, loadSLABreaches]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh || !user) return;

    // Initial load
    refreshAll();

    // Set up interval
    const interval = setInterval(refreshAll, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, user, refreshAll]);

  // Manual refresh effect (when user changes)
  useEffect(() => {
    if (user) {
      refreshAll();
    }
  }, [user, refreshAll]);

  return {
    // State
    escalationRules,
    escalationHistory,
    escalationSummary,
    escalationMetrics,
    pendingNotifications,
    slaBreaches,
    loading,
    error,
    
    // Actions
    loadEscalationRules,
    loadEscalationHistory,
    loadEscalationSummary,
    loadEscalationMetrics,
    loadSLABreaches,
    manuallyEscalateCase,
    resolveEscalation,
    createEscalationRule,
    updateEscalationRule,
    deleteEscalationRule,
    markNotificationAsRead,
    checkCaseEscalation,
    getSLATracking,
    refreshAll,
    
    // Utilities
    clearError: () => setError(null)
  };
}
