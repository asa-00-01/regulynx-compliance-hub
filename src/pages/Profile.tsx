
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import UserProfileForm from '@/components/profile/UserProfileForm';
import UserSecuritySettings from '@/components/profile/UserSecuritySettings';
import UserPreferences from '@/components/profile/UserPreferences';
import { useTranslation } from 'react-i18next';

const Profile = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const getTabFromUrl = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['profile', 'security', 'preferences'].includes(tab)) {
      return tab;
    }
    return 'profile';
  }, [location.search]);

  const [activeTab, setActiveTab] = useState(getTabFromUrl());

  useEffect(() => {
    setActiveTab(getTabFromUrl());
  }, [getTabFromUrl]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/profile?tab=${value}`, { replace: true });
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('profile.pageTitle')}</h1>
            <p className="text-muted-foreground">
              {t('profile.pageDescription')}
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="profile">{t('navigation.profile')}</TabsTrigger>
              <TabsTrigger value="security">{t('profile.tabSecurity')}</TabsTrigger>
              <TabsTrigger value="preferences">{t('profile.tabPreferences')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-4">
              <UserProfileForm user={user} />
            </TabsContent>
            
            <TabsContent value="security" className="space-y-4">
              <UserSecuritySettings />
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4">
              <UserPreferences />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
