import React, { Component, ErrorInfo, ReactNode } from 'react';
import { auditLogger } from '@/services/auditLogger';
import config from '@/config/environment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Global Error Boundary caught an error:', error, errorInfo);
    
    this.setState({ errorInfo });
    
    try {
      // Log to audit system
      await auditLogger.logError(error, 'react_error_boundary', {
        error_id: this.state.errorId,
        component_stack: errorInfo.componentStack,
        error_boundary: 'GlobalErrorBoundary',
        url: window.location.href,
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });

      // Log to analytics if enabled
      if (config.features.enableErrorReporting) {
        const { analytics } = await import('@/services/analytics');
        analytics.reportError(error, {
          error_id: this.state.errorId,
          component_stack: errorInfo.componentStack,
          error_boundary: 'GlobalErrorBoundary'
        });
      }
    } catch (loggingError) {
      console.error('Failed to log error to audit system:', loggingError);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle className="text-destructive">Something went wrong</CardTitle>
              <CardDescription>
                An unexpected error occurred. Our team has been notified.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {this.state.errorId && (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Error ID: {this.state.errorId}
                  </p>
                </div>
              )}
              
              {config.isDevelopment && this.state.error && (
                <details className="bg-muted p-3 rounded text-xs">
                  <summary className="cursor-pointer font-medium">
                    Technical Details (Development Only)
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap break-all">
                    {this.state.error.message}
                    {'\n\n'}
                    {this.state.error.stack}
                    {this.state.errorInfo && '\n\nComponent Stack:\n' + this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
              
              <div className="flex gap-2">
                <Button onClick={this.handleRetry} variant="outline" className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={this.handleReload} className="flex-1">
                  Reload Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
