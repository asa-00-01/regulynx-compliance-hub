import React, { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import UserCaseOverview from '@/components/user/UserCaseOverview';
import { useCompliance } from '@/context/ComplianceContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const UserCasePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const [searchParams] = useSearchParams();
  const { setSelectedUser, getUserById } = useCompliance();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Determine which user ID to use (URL param or query param)
  const userIdToUse = userId || searchParams.get('userId');
  
  // Back button path
  const backPath = searchParams.get('returnTo') || '/compliance';
  
  // Set the selected user on component mount
  useEffect(() => {
    if (userIdToUse) {
      setSelectedUser(userIdToUse);
    }
    
    // Cleanup on unmount
    return () => {
      setSelectedUser(null);
    };
  }, [userIdToUse, setSelectedUser]);
  
  // Check if the user exists
  const userExists = userIdToUse ? !!getUserById(userIdToUse) : false;
  
  return (
    <DashboardLayout requiredRoles={['complianceOfficer', 'admin']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate(backPath)}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> {t('userCase.backButton')}
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">{t('userCase.title')}</h1>
            <p className="text-muted-foreground">
              {t('userCase.description')}
            </p>
          </div>
        </div>
        
        {!userIdToUse && (
          <div className="flex items-center justify-center h-64 border border-dashed rounded-lg">
            <div className="text-center">
              <h3 className="text-lg font-medium">{t('userCase.noUserSelectedTitle')}</h3>
              <p className="text-muted-foreground mt-1">
                {t('userCase.noUserSelectedDescription')}
              </p>
            </div>
          </div>
        )}
        
        {userIdToUse && !userExists && (
          <div className="flex items-center justify-center h-64 border border-dashed rounded-lg">
            <div className="text-center">
              <h3 className="text-lg font-medium">{t('userCase.userNotFoundTitle')}</h3>
              <p className="text-muted-foreground mt-1">
                {t('userCase.userNotFoundDescription')}
              </p>
              <Button 
                onClick={() => navigate('/compliance')}
                className="mt-4"
                variant="outline"
              >
                {t('userCase.returnToComplianceButton')}
              </Button>
            </div>
          </div>
        )}
        
        {userIdToUse && userExists && <UserCaseOverview />}
      </div>
    </DashboardLayout>
  );
};

export default UserCasePage;
