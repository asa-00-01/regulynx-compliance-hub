
import React from 'react';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Play, Loader2 } from 'lucide-react';

interface AssessmentHeaderProps {
  onRunAssessment: () => void;
  isRunningAssessment: boolean;
}

const AssessmentHeader: React.FC<AssessmentHeaderProps> = ({
  onRunAssessment,
  isRunningAssessment
}) => {
  const handleRunAssessment = () => {
    console.log('=== ASSESSMENT BUTTON CLICKED ===');
    console.log('isRunningAssessment:', isRunningAssessment);
    console.log('onRunAssessment function:', typeof onRunAssessment);
    
    if (typeof onRunAssessment === 'function') {
      console.log('Calling onRunAssessment...');
      onRunAssessment();
    } else {
      console.error('onRunAssessment is not a function!');
    }
  };

  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Risk Scoring Engine
          </CardTitle>
          <CardDescription>
            Manage risk assessment rules and monitor user risk distribution
          </CardDescription>
        </div>
        <Button 
          onClick={handleRunAssessment}
          disabled={isRunningAssessment}
          className="flex items-center gap-2"
        >
          {isRunningAssessment ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {isRunningAssessment ? 'Running Assessment...' : 'Run Assessment'}
        </Button>
      </div>
    </CardHeader>
  );
};

export default AssessmentHeader;
