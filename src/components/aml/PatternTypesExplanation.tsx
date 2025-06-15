
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, TrendingUp, Clock } from 'lucide-react';

const PatternTypesExplanation: React.FC = () => {
    return (
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
    );
};

export default PatternTypesExplanation;
