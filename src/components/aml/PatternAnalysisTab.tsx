
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSARData } from '@/hooks/useSARData';
import RiskRulesDisplay from '@/components/aml/RiskRulesDisplay';
import { Shield } from 'lucide-react';
import { PatternMatch } from '@/types/sar';
import PatternAnalysisSummary from './PatternAnalysisSummary';
import PatternList from './PatternList';
import PatternTypesExplanation from './PatternTypesExplanation';
import PatternMatchesView from './PatternMatchesView';
import { useTranslation } from 'react-i18next';

const PatternAnalysisTab = () => {
  const { patterns, getPatternMatches, createAlertFromMatch, createSARFromMatch } = useSARData();
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('patterns');
  const [matches, setMatches] = useState<PatternMatch[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const { t } = useTranslation();

  const selectedPattern = patterns.find(p => p.id === selectedPatternId);
  
  useEffect(() => {
    if (selectedPatternId) {
      const fetchMatches = async () => {
        setIsLoadingMatches(true);
        const fetchedMatches = await getPatternMatches(selectedPatternId);
        setMatches(fetchedMatches);
        setIsLoadingMatches(false);
      };
      fetchMatches();
    } else {
      setMatches([]);
    }
  }, [selectedPatternId, getPatternMatches]);


  const handleViewMatches = (patternId: string) => {
    setSelectedPatternId(patternId);
    setActiveTab('matches');
  };

  const handleBackToPatterns = () => {
    setSelectedPatternId(null);
    setActiveTab('patterns');
  };

  return (
    <div className="space-y-6">
      <PatternAnalysisSummary patterns={patterns} />

      <Tabs value={activeTab} onValueChange={(value) => {
        if (value !== 'matches') {
          setSelectedPatternId(null);
        }
        setActiveTab(value);
      }}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="patterns">{t('aml.patternDetection')}</TabsTrigger>
            <TabsTrigger value="risk-rules">{t('aml.riskRulesEngine')}</TabsTrigger>
            <TabsTrigger value="matches" disabled={!selectedPatternId}>
              {t('aml.patternMatches')}
              {selectedPattern && (
                <Badge variant="secondary" className="ml-2">
                  {selectedPattern.matchCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {activeTab === 'matches' && (
            <Button variant="outline" onClick={handleBackToPatterns}>
              {t('aml.backToPatterns')}
            </Button>
          )}
        </div>

        <TabsContent value="patterns" className="space-y-4">
          <PatternList patterns={patterns} onViewMatches={handleViewMatches} />
          <PatternTypesExplanation />
        </TabsContent>

        <TabsContent value="risk-rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t('aml.rulesEngineTitle')}
              </CardTitle>
              <p className="text-muted-foreground">
                {t('aml.rulesEngineDesc')}
              </p>
            </CardHeader>
            <CardContent>
              <RiskRulesDisplay />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matches" className="space-y-4">
          {selectedPattern && (
            <PatternMatchesView
              pattern={selectedPattern}
              matches={matches}
              isLoading={isLoadingMatches}
              onCreateAlert={createAlertFromMatch}
              onCreateSAR={createSARFromMatch}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatternAnalysisTab;
