
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { usePlatformRoleAccess } from "@/hooks/permissions/usePlatformRoleAccess";
import LoadingScreen from "@/components/app/LoadingScreen";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, authLoaded, loading, user } = useAuth();
  const { isPlatformOwner, isPlatformAdmin, hasPlatformPermission } = usePlatformRoleAccess();
  
  useEffect(() => {
    // Don't do anything while auth is still loading
    if (loading || !authLoaded) {
      console.log('🏠 Index page - Waiting for auth to load...', { loading, authLoaded });
      return;
    }
    
    console.log('🏠 Index page - Auth loaded:', { isAuthenticated, authLoaded, loading });
    
    if (isAuthenticated && user) {
      // Check if user should go to platform app
      const shouldUsePlatformApp = isPlatformOwner() || isPlatformAdmin() || hasPlatformPermission('platform:support');
      
      if (shouldUsePlatformApp) {
        console.log('✅ Platform user authenticated, redirecting to platform app');
        navigate("/platform/dashboard", { replace: true });
      } else {
        console.log('✅ Customer user authenticated, redirecting to customer dashboard');
        navigate("/dashboard", { replace: true });
      }
    } else {
      console.log('❌ User not authenticated, redirecting to login');
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, authLoaded, loading, navigate, user, isPlatformOwner, isPlatformAdmin, hasPlatformPermission]);

  // Show loading while auth is being determined
  if (loading || !authLoaded) {
    return <LoadingScreen text="Initializing application..." />;
  }

  return null; // This component just redirects, no need to render anything
};

export default Index;
