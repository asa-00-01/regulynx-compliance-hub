
import { useAuth } from '@/context/AuthContext';
import { useAuditLogging } from './useAuditLogging';
import { useCallback } from 'react';

export const useEnhancedAuth = () => {
  const auth = useAuth();
  const { logAuthentication, logSecurityEvent, logError } = useAuditLogging();

  const enhancedLogin = useCallback(async (email: string, password: string) => {
    try {
      console.log('🔐 Starting login process for:', email);
      
      await logAuthentication('login_attempt', { email, method: 'password' });
      
      const result = await auth.login(email, password);
      
      if (result) {
        await logAuthentication('login_success', { 
          email, 
          method: 'password',
          user_id: result.id 
        }, true);
        console.log('✅ Login successful for:', email);
      } else {
        await logAuthentication('login_failed', { 
          email, 
          method: 'password',
          reason: 'invalid_credentials' 
        }, false);
        console.warn('❌ Login failed for:', email);
      }
      
      return result;
    } catch (error: any) {
      console.error('🚨 Login error:', error);
      await logAuthentication('login_error', { 
        email, 
        method: 'password',
        error: error.message 
      }, false);
      await logError(error, 'login_process', { email });
      throw error;
    }
  }, [auth.login, logAuthentication, logError]);

  const enhancedLogout = useCallback(async () => {
    try {
      console.log('🔐 Starting logout process');
      
      const currentUser = auth.user;
      await logAuthentication('logout_attempt', { 
        user_id: currentUser?.id,
        email: currentUser?.email 
      });
      
      await auth.logout();
      
      await logAuthentication('logout_success', { 
        user_id: currentUser?.id,
        email: currentUser?.email 
      }, true);
      
      console.log('✅ Logout successful');
    } catch (error: any) {
      console.error('🚨 Logout error:', error);
      await logAuthentication('logout_error', { 
        user_id: auth.user?.id,
        error: error.message 
      }, false);
      await logError(error, 'logout_process');
      throw error;
    }
  }, [auth.logout, auth.user, logAuthentication, logError]);

  const enhancedSignup = useCallback(async (email: string, password: string, role: any, name?: string) => {
    try {
      console.log('🔐 Starting signup process for:', email);
      
      await logAuthentication('signup_attempt', { email, role, name });
      
      await auth.signup(email, password, role, name);
      
      await logAuthentication('signup_success', { 
        email, 
        role, 
        name 
      }, true);
      
      console.log('✅ Signup successful for:', email);
    } catch (error: any) {
      console.error('🚨 Signup error:', error);
      await logAuthentication('signup_error', { 
        email, 
        role,
        name,
        error: error.message 
      }, false);
      await logError(error, 'signup_process', { email, role, name });
      throw error;
    }
  }, [auth.signup, logAuthentication, logError]);

  return {
    ...auth,
    login: enhancedLogin,
    logout: enhancedLogout,
    signup: enhancedSignup
  };
};
