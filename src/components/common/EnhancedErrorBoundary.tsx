
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Bug } from 'lucide-react';
import { productionMonitor } from '@/services/productionMonitor';
import config from '@/config/environment';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo, errorId: string | null) => ReactNode;
  context?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

class EnhancedErrorBoundary extends Component<Props, State> {
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
      errorId: `boundary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`🚨 Error Boundary caught error in ${this.props.context || 'Unknown Component'}:`, error, errorInfo);
    
    this.setState({ errorInfo });
    
    try {
      // Log error to production monitoring system
      const errorId = await productionMonitor.logError(
        this.state.errorId || `boundary_${Date.now()}`,
        error.message,
        error.stack,
        'react_error',
        'high',
        window.location.href,
        navigator.userAgent,
        {
          component_stack: errorInfo.componentStack,
          error_boundary: this.props.context || 'EnhancedErrorBoundary',
          props: JSON.stringify(this.props, (key, value) => {
            if (key === 'children' || typeof value === 'function') return '[Filtered]';
            return value;
          }),
          timestamp: new Date().toISOString()
        }
      );

      if (errorId) {
        this.setState({ errorId });
      }

    } catch (loggingError) {
      console.error('Failed to log error to production monitor:', loggingError);
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
      if (this.props.fallback && this.state.error) {
        return this.props.fallback(this.state.error, this.state.errorInfo!, this.state.errorId);
      }

      return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle className="text-destructive">Component Error</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                An error occurred in the {this.props.context || 'application'} component.
                {this.state.errorId && ' The error has been logged for investigation.'}
              </p>

              {this.state.errorId && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    Error ID: <code className="text-xs bg-background px-1 py-0.5 rounded">{this.state.errorId}</code>
                  </p>
                </div>
              )}

              {config.isDevelopment && this.state.error && (
                <details className="text-left bg-muted p-3 rounded text-xs">
                  <summary className="cursor-pointer font-medium">
                    Debug Information (Development Only)
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap break-all">
                    {this.state.error.message}
                    {this.state.error.stack && '\n\nStack Trace:\n' + this.state.error.stack}
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
                  <Bug className="h-4 w-4 mr-2" />
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

export default EnhancedErrorBoundary;
