
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAnalytics } from '@/hooks/useAnalytics';
import { AlertTriangle, CheckCircle, FileText, Users } from 'lucide-react';

const AnalyticsEnabledActions: React.FC = () => {
  const { trackAction, trackCompliance, reportError } = useAnalytics();

  const handleCreateCase = async () => {
    try {
      trackCompliance('case_creation_started');
      
      // Simulate case creation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      trackCompliance('case_creation_completed', {
        case_type: 'aml_investigation',
        priority: 'high',
      });
      
      trackAction('create_case', {
        source: 'compliance_dashboard',
        success: true,
      });
    } catch (error) {
      reportError(error as Error, {
        action: 'create_case',
        source: 'compliance_dashboard',
      });
    }
  };

  const handleRunRiskAssessment = () => {
    trackCompliance('risk_assessment_started');
    trackAction('run_risk_assessment', {
      assessment_type: 'customer_due_diligence',
    });
  };

  const handleGenerateReport = () => {
    trackCompliance('report_generation', {
      report_type: 'compliance_summary',
      format: 'pdf',
    });
    trackAction('generate_report');
  };

  const handleViewUserProfiles = () => {
    trackAction('view_user_profiles', {
      filter: 'high_risk',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
          Analytics-Enabled Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={handleCreateCase} className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Create Case
          </Button>
          
          <Button onClick={handleRunRiskAssessment} variant="outline" className="flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            Risk Assessment
          </Button>
          
          <Button onClick={handleGenerateReport} variant="outline" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
          
          <Button onClick={handleViewUserProfiles} variant="outline" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            View Profiles
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground mt-4 p-2 bg-muted rounded">
          💡 All actions are tracked with analytics. Check the browser console (dev mode) 
          or the analytics dashboard to see the events being logged.
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsEnabledActions;
