import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, FileText, Users, CheckCircle, XCircle } from 'lucide-react';
import { UnifiedUserData } from '@/context/compliance/types';
import { complianceCaseWorkflow, RiskAssessmentResult } from '@/services/complianceCaseWorkflow';
import { useNavigate } from 'react-router-dom';

interface ComplianceCaseRecommendationsProps {
  user: UnifiedUserData;
  onCaseCreated?: () => void;
}

const ComplianceCaseRecommendations: React.FC<ComplianceCaseRecommendationsProps> = ({
  user,
  onCaseCreated
}) => {
  const navigate = useNavigate();
  const assessment = complianceCaseWorkflow.assessCaseCreation(user);
  const recommendations = complianceCaseWorkflow.getWorkflowRecommendations(user, assessment);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCaseTypeIcon = (caseType: string) => {
    switch (caseType) {
      case 'sanctions_hit': return <AlertTriangle className="h-4 w-4" />;
      case 'pep_review': return <Shield className="h-4 w-4" />;
      case 'kyc_review': return <Users className="h-4 w-4" />;
      case 'aml_alert': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const handleCreateCase = () => {
    const caseData = complianceCaseWorkflow.generateCaseData(user, assessment);
    
    navigate('/compliance-cases', {
      state: {
        createCase: true,
        userData: caseData
      }
    });
    
    onCaseCreated?.();
  };

  if (!assessment.shouldCreateCase) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-600" />
            No Compliance Case Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-green-700">
            This user meets current compliance standards. Risk score: {user.riskScore}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          Compliance Case Recommended
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Risk Assessment Summary */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Risk Assessment:</span>
            <Badge className={getPriorityColor(assessment.priority)}>
              {assessment.priority.toUpperCase()}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            {getCaseTypeIcon(assessment.caseType)}
            <span className="font-medium">{assessment.caseType.replace('_', ' ').toUpperCase()}</span>
          </div>
          
          <p className="text-sm text-orange-700">{assessment.reason}</p>
        </div>

        {/* Risk Factors */}
        {assessment.riskFactors.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-medium">Risk Factors:</span>
            <div className="flex flex-wrap gap-1">
              {assessment.riskFactors.map((factor, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {factor}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-medium">Recommended Actions:</span>
            <ul className="space-y-1">
              {recommendations.slice(0, 3).map((recommendation, index) => (
                <li key={index} className="text-sm text-orange-700 flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">•</span>
                  {recommendation}
                </li>
              ))}
            </ul>
            {recommendations.length > 3 && (
              <p className="text-xs text-orange-600">
                +{recommendations.length - 3} more recommendations
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            onClick={handleCreateCase}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Create Compliance Case
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              // Show detailed recommendations modal or navigate to risk analysis
              console.log('Show detailed recommendations for:', user.id);
            }}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceCaseRecommendations;
