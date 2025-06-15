
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Search, AlertTriangle, TrendingUp, Shield } from 'lucide-react';
import { Pattern } from '@/types/sar';
import { useTranslation } from 'react-i18next';

interface PatternAnalysisSummaryProps {
  patterns: Pattern[];
}

const PatternAnalysisSummary: React.FC<PatternAnalysisSummaryProps> = ({ patterns }) => {
  const { t } = useTranslation();
  const getTotalMatches = () => {
    return patterns.reduce((total, pattern) => total + pattern.matchCount, 0);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('aml.activePatterns')}</p>
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
              <p className="text-sm font-medium text-muted-foreground">{t('aml.totalMatches')}</p>
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
              <p className="text-sm font-medium text-muted-foreground">{t('aml.highPriority')}</p>
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
              <p className="text-sm font-medium text-muted-foreground">{t('aml.riskRules')}</p>
              <p className="text-2xl font-bold">19</p>
            </div>
            <Shield className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatternAnalysisSummary;
