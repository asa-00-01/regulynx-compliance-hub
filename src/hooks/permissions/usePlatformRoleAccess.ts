
import { useAuth } from '@/context/AuthContext';

export const usePlatformRoleAccess = () => {
  const { user } = useAuth();

  const isPlatformOwner = () => {
    return user?.isPlatformOwner || false;
  };

  const isPlatformAdmin = () => {
    return user?.platform_roles?.includes('platform_admin') || false;
  };

  const hasPlatformPermission = (permission: string) => {
    if (!user) return false;
    
    // Platform owners have all permissions
    if (user.isPlatformOwner) return true;
    
    // Check specific platform permissions
    const platformPermissions = [
      'platform:admin',
      'platform:support',
      'platform:billing',
      'platform:users',
      'platform:settings'
    ];
    
    if (permission === 'platform:support') {
      return user.platform_roles?.includes('platform_support') || 
             user.platform_roles?.includes('platform_admin') || false;
    }
    
    return user.platform_roles?.includes('platform_admin') || false;
  };

  return {
    isPlatformOwner,
    isPlatformAdmin,
    hasPlatformPermission
  };
};
