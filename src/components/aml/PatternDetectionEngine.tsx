
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AMLTransaction } from '@/types/aml';
import { DetectedPattern } from '@/types/pattern';
import { usePatternDetection } from '@/hooks/usePatternDetection';
import PatternAnalysisButton from './PatternAnalysisButton';
import PatternAnalysisStatus from './PatternAnalysisStatus';
import PatternCard from './PatternCard';
import PatternStatistics from './PatternStatistics';
import PatternDetailsModal from './PatternDetailsModal';
import TransactionDetailsModal from './TransactionDetailsModal';

const PatternDetectionEngine: React.FC = () => {
  const { patterns, isAnalyzing, runPatternAnalysis, updatePatternTransactions } = usePatternDetection();
  const [selectedPattern, setSelectedPattern] = useState<DetectedPattern | null>(null);
  const [isPatternDetailsOpen, setIsPatternDetailsOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<AMLTransaction | null>(null);
  const [isTransactionDetailsOpen, setIsTransactionDetailsOpen] = useState(false);
  const { toast } = useToast();

  const handleViewDetails = (pattern: DetectedPattern) => {
    setSelectedPattern(pattern);
    setIsPatternDetailsOpen(true);
  };

  const handleViewTransaction = (transaction: AMLTransaction) => {
    setSelectedTransaction(transaction);
    setIsTransactionDetailsOpen(true);
  };

  const handleFlagTransaction = (transaction: AMLTransaction) => {
    const updatedTransaction = {
      ...transaction,
      isSuspect: !transaction.isSuspect,
      status: !transaction.isSuspect ? 'flagged' : 'completed'
    };

    updatePatternTransactions(updatedTransaction);

    toast({
      title: transaction.isSuspect ? "Transaction Unflagged" : "Transaction Flagged",
      description: `Transaction ${transaction.id.substring(0, 8)}... has been ${transaction.isSuspect ? 'unflagged' : 'flagged as suspicious'}`,
      variant: transaction.isSuspect ? "default" : "destructive",
    });
  };

  const handleCreateCase = (transaction: AMLTransaction) => {
    toast({
      title: "AML Case Created",
      description: `Investigation case created for transaction ${transaction.id.substring(0, 8)}...`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Real-Time Pattern Detection Engine
            </CardTitle>
            <PatternAnalysisButton
              isAnalyzing={isAnalyzing}
              onRunAnalysis={runPatternAnalysis}
            />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Advanced machine learning algorithms detect suspicious transaction patterns in real-time.
          </p>

          <PatternAnalysisStatus
            isAnalyzing={isAnalyzing}
            hasPatterns={patterns.length > 0}
          />

          {patterns.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patterns.map((pattern) => (
                <PatternCard
                  key={pattern.id}
                  pattern={pattern}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <PatternStatistics patterns={patterns} />

      {selectedPattern && (
        <PatternDetailsModal
          pattern={selectedPattern}
          isOpen={isPatternDetailsOpen}
          onOpenChange={setIsPatternDetailsOpen}
          onViewTransaction={handleViewTransaction}
          onFlagTransaction={handleFlagTransaction}
          onCreateCase={handleCreateCase}
        />
      )}

      <TransactionDetailsModal
        transaction={selectedTransaction}
        open={isTransactionDetailsOpen}
        onOpenChange={setIsTransactionDetailsOpen}
        onFlag={handleFlagTransaction}
        onCreateCase={handleCreateCase}
      />
    </div>
  );
};

export default PatternDetectionEngine;
