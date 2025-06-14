
import React from 'react';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';

interface PatternAnalysisButtonProps {
  isAnalyzing: boolean;
  onRunAnalysis: () => void;
}

const PatternAnalysisButton: React.FC<PatternAnalysisButtonProps> = ({
  isAnalyzing,
  onRunAnalysis,
}) => {
  return (
    <Button 
      onClick={onRunAnalysis}
      disabled={isAnalyzing}
      className="flex items-center gap-2"
    >
      {isAnalyzing ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Analyzing...
        </>
      ) : (
        <>
          <Search className="h-4 w-4" />
          Run Analysis
        </>
      )}
    </Button>
  );
};

export default PatternAnalysisButton;
