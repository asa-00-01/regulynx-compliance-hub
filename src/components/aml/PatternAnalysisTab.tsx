
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSARData } from '@/hooks/useSARData';
import PatternCard from '@/components/sar/PatternCard';
import MatchesList from '@/components/sar/MatchesList';
import RiskRulesDisplay from '@/components/aml/RiskRulesDisplay';
import { AlertTriangle, TrendingUp, Clock, Search, Shield } from 'lucide-react';
import { PatternMatch } from '@/types/sar';

const PatternAnalysisTab = () => {
  const { patterns, getPatternMatches, createAlertFromMatch, createSARFromMatch } = useSARData();
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('patterns');
  const [matches, setMatches] = useState<PatternMatch[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);

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

  const getPatternTypeIcon = (category: string) => {
    switch (category) {
      case 'structuring':
        return <TrendingUp className="h-5 w-5 text-purple-600" />;
      case 'high_risk_corridor':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'time_pattern':
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <Search className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTotalMatches = () => {
    return patterns.reduce((total, pattern) => total + pattern.matchCount, 0);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Patterns</p>
                <p className="text-2xl font-bold">{patterns.length}</p>
              </div>
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Matches</p>
                <p className="text-2xl font-bold">{getTotalMatches()}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold">
                  {patterns.filter(p => p.matchCount > 10).length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Risk Rules</p>
                <p className="text-2xl font-bold">19</p>
              </div>
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="patterns">Pattern Detection</TabsTrigger>
            <TabsTrigger value="risk-rules">Risk Rules Engine</TabsTrigger>
            <TabsTrigger value="matches" disabled={!selectedPatternId}>
              Pattern Matches
              {selectedPattern && (
                <Badge variant="secondary" className="ml-2">
                  {selectedPattern.matchCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {selectedPatternId && (
            <Button variant="outline" onClick={handleBackToPatterns}>
              Back to Patterns
            </Button>
          )}
        </div>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Detected Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {patterns.map((pattern) => (
                  <PatternCard
                    key={pattern.id}
                    pattern={pattern}
                    onViewMatches={handleViewMatches}
                  />
                ))}
              </div>

              {patterns.length === 0 && (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Patterns Detected</h3>
                  <p className="text-muted-foreground">
                    The system is continuously monitoring for suspicious patterns.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pattern Types Explanation */}
          <Card>
            <CardHeader>
              <CardTitle>Pattern Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="bg-purple-100 rounded-full p-2">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Structuring</h4>
                    <p className="text-sm text-muted-foreground">
                      Multiple small transactions below reporting thresholds
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="bg-red-100 rounded-full p-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">High-Risk Corridors</h4>
                    <p className="text-sm text-muted-foreground">
                      Transactions to/from high-risk jurisdictions
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="bg-blue-100 rounded-full p-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Time Patterns</h4>
                    <p className="text-sm text-muted-foreground">
                      Unusual timing or frequency patterns
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk-rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Rule-Based Risk Scoring Engine
              </CardTitle>
              <p className="text-muted-foreground">
                Evaluate transactions and users against 19 pre-defined risk rules
              </p>
            </CardHeader>
            <CardContent>
              <RiskRulesDisplay />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matches" className="space-y-4">
          {selectedPattern && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getPatternTypeIcon(selectedPattern.category)}
                    <CardTitle>{selectedPattern.name}</CardTitle>
                  </div>
                  <Badge variant="outline">
                    {selectedPattern.matchCount} matches
                  </Badge>
                </div>
                <p className="text-muted-foreground">{selectedPattern.description}</p>
              </CardHeader>
              <CardContent>
                <MatchesList
                  matches={matches}
                  onCreateAlert={createAlertFromMatch}
                  onCreateSAR={createSARFromMatch}
                  isLoading={isLoadingMatches}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatternAnalysisTab;
