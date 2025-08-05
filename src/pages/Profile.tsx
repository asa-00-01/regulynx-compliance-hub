
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import UserProfileForm from '@/components/profile/UserProfileForm';
import UserSecuritySettings from '@/components/profile/UserSecuritySettings';
import UserPreferences from '@/components/profile/UserPreferences';
import SubscriptionManagement from '@/components/profile/SubscriptionManagement';
import SubscriptionTester from '@/components/subscription/SubscriptionTester';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Shield, Settings, CreditCard, TestTube } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.avatarUrl} alt={user?.name || user?.email} />
            <AvatarFallback className="text-lg">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{user?.name || 'User Profile'}</h1>
            <p className="text-gray-600">{user?.email}</p>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="secondary">{user?.role}</Badge>
              {user?.status && (
                <Badge variant={user.status === 'verified' ? 'default' : 'secondary'}>
                  {user.status}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span>Subscription</span>
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center space-x-2">
            <TestTube className="h-4 w-4" />
            <span>Test</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Preferences</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <UserProfileForm user={user} />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <UserSecuritySettings />
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <SubscriptionManagement />
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <SubscriptionTester />
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <UserPreferences />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
