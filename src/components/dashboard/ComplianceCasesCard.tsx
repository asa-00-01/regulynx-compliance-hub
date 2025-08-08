import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ComplianceCaseDetails } from '@/types/case';
import { User } from '@/types';
import { useNavigate } from 'react-router-dom';

interface ComplianceCasesCardProps {
  complianceCases: ComplianceCaseDetails[];
  loading: boolean;
  currentUser?: User;
}

const ComplianceCasesCard = ({ complianceCases, loading, currentUser }: ComplianceCasesCardProps) => {
  const navigate = useNavigate();
  
  const handleViewAllCases = () => {
    navigate('/compliance-cases');
  };
  
  const handleViewCase = (caseItem: ComplianceCaseDetails) => {
    navigate('/compliance-cases', {
      state: {
        viewCase: caseItem.id
      }
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Cases</CardTitle>
        <CardDescription>Open cases by risk level</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="high">High Risk</TabsTrigger>
            <TabsTrigger value="assigned">My Cases</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4 mt-4">
            {loading ? (
              <div className="space-y-3">
                {Array(3).fill(null).map((_, i) => (
                  <div key={i} className="flex justify-between p-3 border rounded-md">
                    <div className="w-2/3 h-4 bg-muted rounded animate-pulse"></div>
                    <div className="w-1/4 h-4 bg-muted rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {complianceCases.map((caseItem) => (
                  <div 
                    key={caseItem.id} 
                    className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/30 cursor-pointer"
                    onClick={() => handleViewCase(caseItem)}
                  >
                    <div>
                      <div className="font-medium">{caseItem.type.toUpperCase()}</div>
                      <div className="text-xs text-muted-foreground">
                        {caseItem.description}
                      </div>
                    </div>
                    <div className={`rounded-full px-2 py-1 text-xs font-medium ${
                      caseItem.riskScore >= 80 
                        ? 'bg-red-100 text-red-800' 
                        : caseItem.riskScore >= 60 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      Score: {caseItem.riskScore}
                    </div>
                  </div>
                ))}
                <Button size="sm" variant="outline" className="w-full" onClick={handleViewAllCases}>
                  View All Cases
                </Button>
              </div>
            )}
          </TabsContent>
          <TabsContent value="high" className="space-y-4 mt-4">
            <div className="space-y-3">
              {complianceCases
                .filter(c => c.riskScore >= 80)
                .map((caseItem) => (
                  <div 
                    key={caseItem.id} 
                    className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/30 cursor-pointer"
                    onClick={() => handleViewCase(caseItem)}
                  >
                    <div>
                      <div className="font-medium">{caseItem.type.toUpperCase()}</div>
                      <div className="text-xs text-muted-foreground">
                        {caseItem.description}
                      </div>
                    </div>
                    <div className="bg-red-100 text-red-800 rounded-full px-2 py-1 text-xs font-medium">
                      Score: {caseItem.riskScore}
                    </div>
                  </div>
              ))}
              <Button size="sm" variant="outline" className="w-full" onClick={handleViewAllCases}>
                View All High Risk Cases
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="assigned" className="space-y-4 mt-4">
            <div className="space-y-3">
              {complianceCases
                .filter(c => c.assignedTo === currentUser?.id)
                .map((caseItem) => (
                  <div 
                    key={caseItem.id} 
                    className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/30 cursor-pointer"
                    onClick={() => handleViewCase(caseItem)}
                  >
                    <div>
                      <div className="font-medium">{caseItem.type.toUpperCase()}</div>
                      <div className="text-xs text-muted-foreground">
                        {caseItem.description}
                      </div>
                    </div>
                    <div className={`rounded-full px-2 py-1 text-xs font-medium ${
                      caseItem.riskScore >= 80 
                        ? 'bg-red-100 text-red-800' 
                        : caseItem.riskScore >= 60 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      Score: {caseItem.riskScore}
                    </div>
                  </div>
              ))}
              <Button size="sm" variant="outline" className="w-full" onClick={handleViewAllCases}>
                View All My Cases
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ComplianceCasesCard;
