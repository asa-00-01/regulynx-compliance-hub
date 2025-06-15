
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';
import PatternCard from '@/components/sar/PatternCard';
import { Pattern } from '@/types/sar';
import { useTranslation } from 'react-i18next';

interface PatternListProps {
    patterns: Pattern[];
    onViewMatches: (patternId: string) => void;
}

const PatternList: React.FC<PatternListProps> = ({ patterns, onViewMatches }) => {
    const { t } = useTranslation();
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    {t('aml.detectedPatterns')}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {patterns.map((pattern) => (
                        <PatternCard
                            key={pattern.id}
                            pattern={pattern}
                            onViewMatches={onViewMatches}
                        />
                    ))}
                </div>

                {patterns.length === 0 && (
                    <div className="text-center py-8">
                        <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">{t('aml.noPatterns')}</h3>
                        <p className="text-muted-foreground">
                            {t('aml.noPatternsDesc')}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default PatternList;
