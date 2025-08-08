
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import LoadingScreen from "@/components/app/LoadingScreen";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, authLoaded } = useAuth();
  
  useEffect(() => {
    if (!authLoaded) return; // Wait for auth to be loaded
    
    console.log('🏠 Index page - Auth status:', { isAuthenticated, authLoaded });
    
    if (isAuthenticated) {
      console.log('✅ User is authenticated, redirecting to dashboard');
      navigate("/dashboard", { replace: true });
    } else {
      console.log('❌ User not authenticated, redirecting to login');
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, authLoaded, navigate]);

  if (!authLoaded) {
    return <LoadingScreen />;
  }

  return null; // This component just redirects, no need to render anything
};

export default Index;
