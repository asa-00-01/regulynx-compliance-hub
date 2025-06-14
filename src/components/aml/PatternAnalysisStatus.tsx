
import React from 'react';
import { Search, Loader2 } from 'lucide-react';

interface PatternAnalysisStatusProps {
  isAnalyzing: boolean;
  hasPatterns: boolean;
}

const PatternAnalysisStatus: React.FC<PatternAnalysisStatusProps> = ({
  isAnalyzing,
  hasPatterns,
}) => {
  if (isAnalyzing) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
        <h3 className="text-lg font-semibold mb-2">Analyzing Transaction Patterns</h3>
        <p className="text-muted-foreground">
          Processing transaction data for suspicious patterns...
        </p>
      </div>
    );
  }

  if (!hasPatterns) {
    return (
      <div className="text-center py-8">
        <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Analysis Run Yet</h3>
        <p className="text-muted-foreground">
          Click "Run Analysis" to detect suspicious patterns in transaction data.
        </p>
      </div>
    );
  }

  return null;
};

export default PatternAnalysisStatus;
