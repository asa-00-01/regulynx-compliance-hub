
import React, { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import UserCaseOverview from '@/components/user/UserCaseOverview';
import { useCompliance } from '@/context/ComplianceContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const UserCasePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const [searchParams] = useSearchParams();
  const { setSelectedUser, getUserById, selectedUser } = useCompliance();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Determine which user ID to use (URL param or query param)
  const userIdToUse = userId || searchParams.get('userId');
  
  // Back button path
  const backPath = searchParams.get('returnTo') || '/compliance';
  
  // Set the selected user on component mount
  useEffect(() => {
    if (userIdToUse) {
      console.log('UserCase: Setting selected user to:', userIdToUse);
      setSelectedUser(userIdToUse);
    }
    
    // Cleanup on unmount
    return () => {
      console.log('UserCase: Cleaning up selected user');
      setSelectedUser(null);
    };
  }, [userIdToUse, setSelectedUser]);
  
  // Check if the user exists
  const user = userIdToUse ? getUserById(userIdToUse) : null;
  
  console.log('UserCase render:', {
    userIdToUse,
    user: user ? `${user.fullName} (${user.id})` : 'null',
    selectedUser: selectedUser ? `${selectedUser.fullName} (${selectedUser.id})` : 'null'
  });
  
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
              {user ? `Compliance profile for ${user.fullName}` : t('userCase.description')}
            </p>
          </div>
        </div>
        
        {!userIdToUse && (
          <div className="flex items-center justify-center h-64 border border-dashed rounded-lg">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">{t('userCase.noUserSelectedTitle')}</h3>
              <p className="text-muted-foreground mt-1">
                {t('userCase.noUserSelectedDescription')}
              </p>
              <Button 
                onClick={() => navigate('/compliance')}
                className="mt-4"
                variant="outline"
              >
                Go to Compliance Dashboard
              </Button>
            </div>
          </div>
        )}
        
        {userIdToUse && !user && (
          <div className="flex items-center justify-center h-64 border border-dashed rounded-lg">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-700">User Not Found</h3>
              <p className="text-muted-foreground mt-1">
                The user with ID <code className="bg-muted px-2 py-1 rounded text-sm">{userIdToUse}</code> could not be found in the system.
              </p>
              <div className="flex gap-2 justify-center mt-4">
                <Button 
                  onClick={() => navigate(backPath)}
                  variant="outline"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Go Back
                </Button>
                <Button 
                  onClick={() => navigate('/compliance')}
                  variant="default"
                >
                  Compliance Dashboard
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {userIdToUse && user && <UserCaseOverview />}
      </div>
    </DashboardLayout>
  );
};

export default UserCasePage;
