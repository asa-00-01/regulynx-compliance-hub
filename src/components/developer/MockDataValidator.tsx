
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, RefreshCw, Users, FileText, CreditCard, Shield } from 'lucide-react';
import { useCoherentMockData } from '@/hooks/useCoherentMockData';

const MockDataValidator: React.FC = () => {
  const {
    isMockMode,
    validation,
    isValidating,
    validateData,
    completeTestUser,
    allUsersWithData
  } = useCoherentMockData();

  if (!isMockMode) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Mock data mode is disabled. Enable it in the configuration to use the validator.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Mock Data Coherence Validator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Button 
              onClick={validateData} 
              disabled={isValidating}
              variant="outline"
            >
              {isValidating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              {isValidating ? 'Validating...' : 'Validate Data'}
            </Button>
            
            {validation && (
              <Badge variant={validation.isValid ? "default" : "destructive"}>
                {validation.isValid ? 'All Good' : `${validation.issues.length} Issues`}
              </Badge>
            )}
          </div>

          {validation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold">{validation.summary.totalUsers}</div>
                  <div className="text-sm text-muted-foreground">Total Users</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <FileText className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold">{validation.summary.usersWithDocuments}</div>
                  <div className="text-sm text-muted-foreground">With Documents</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <CreditCard className="h-8 w-8 text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold">{validation.summary.usersWithTransactions}</div>
                  <div className="text-sm text-muted-foreground">With Transactions</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Shield className="h-8 w-8 text-orange-500" />
                  </div>
                  <div className="text-2xl font-bold">{validation.summary.usersWithCases}</div>
                  <div className="text-sm text-muted-foreground">With Cases</div>
                </div>
              </div>

              {validation.issues.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium mb-2">Data Consistency Issues:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {validation.issues.map((issue, index) => (
                        <li key={index} className="text-sm">{issue}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {completeTestUser && (
        <Card>
          <CardHeader>
            <CardTitle>Complete Test User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{completeTestUser.fullName}</span>
                <Badge variant={completeTestUser.riskScore > 70 ? "destructive" : "default"}>
                  Risk: {completeTestUser.riskScore}
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Documents:</span> {completeTestUser.documents.length}
                </div>
                <div>
                  <span className="text-muted-foreground">Transactions:</span> {completeTestUser.transactions.length}
                </div>
                <div>
                  <span className="text-muted-foreground">Cases:</span> {completeTestUser.complianceCases.length}
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                ID: {completeTestUser.id}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>User Data Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {allUsersWithData.slice(0, 5).map(user => (
              <div key={user.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div className="flex-1">
                  <div className="font-medium">{user.fullName}</div>
                  <div className="text-sm text-muted-foreground">
                    Docs: {user.documents.length} | 
                    Txs: {user.transactions.length} | 
                    Cases: {user.complianceCases.length}
                    {user.metadata && ` | Score: ${user.metadata.completenessScore}%`}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {user.isPEP && <Badge variant="secondary">PEP</Badge>}
                  {user.isSanctioned && <Badge variant="destructive">Sanctioned</Badge>}
                  <Badge variant={user.riskScore > 70 ? "destructive" : "default"}>
                    {user.riskScore}
                  </Badge>
                </div>
              </div>
            ))}
            {allUsersWithData.length > 5 && (
              <div className="text-center text-sm text-muted-foreground pt-2">
                And {allUsersWithData.length - 5} more users...
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MockDataValidator;
