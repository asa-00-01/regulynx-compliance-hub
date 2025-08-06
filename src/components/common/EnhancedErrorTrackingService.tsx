
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { auditLogger } from '@/services/auditLogger';
import { analytics } from '@/services/analytics';
import config from '@/config/environment';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo) => ReactNode;
  context?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class EnhancedErrorTrackingService extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`🚨 Error caught in ${this.props.context || 'ErrorTrackingService'}:`, error, errorInfo);
    
    this.setState({ errorInfo });
    
    try {
      // Enhanced audit logging
      await auditLogger.logError(error, this.props.context || 'react_component_error', {
        component_stack: errorInfo.componentStack,
        error_boundary: this.props.context || 'ErrorTrackingService',
        props: JSON.stringify(this.props, (key, value) => {
          if (key === 'children' || typeof value === 'function') return '[Filtered]';
          return value;
        }),
        url: window.location.href,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        local_storage_keys: Object.keys(localStorage || {}),
        session_storage_keys: Object.keys(sessionStorage || {})
      });

      // Analytics reporting
      if (config.features.enableErrorReporting) {
        analytics.reportError(error, {
          component_stack: errorInfo.componentStack,
          error_boundary: this.props.context || 'ErrorTrackingService',
          context: this.props.context
        });
      }
    } catch (loggingError) {
      console.error('Failed to log component error:', loggingError);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback && this.state.error) {
        return this.props.fallback(this.state.error, this.state.errorInfo!);
      }
      
      return (
        <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-md">
          <h3 className="text-sm font-medium text-destructive mb-2">
            Component Error
          </h3>
          <p className="text-xs text-muted-foreground">
            {this.state.error?.message || 'An unexpected error occurred in this component'}
          </p>
          {config.isDevelopment && (
            <details className="mt-2">
              <summary className="text-xs cursor-pointer">Debug Info</summary>
              <pre className="text-xs mt-1 p-2 bg-background rounded overflow-auto max-h-32">
                {this.state.error?.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default EnhancedErrorTrackingService;
