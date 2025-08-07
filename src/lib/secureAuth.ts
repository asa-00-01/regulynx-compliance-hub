
import { supabase } from '@/integrations/supabase/client';
import { rateLimitAuth } from './rateLimiting';
import { sanitizeInput, validateEmail } from './security';
import config from '@/config/environment';
import { toast } from 'sonner';

export interface SecureAuthOptions {
  enableRateLimit?: boolean;
  enableInputSanitization?: boolean;
  sessionTimeout?: number;
}

class SecureAuthManager {
  private options: SecureAuthOptions;
  private sessionCheckInterval?: NodeJS.Timeout;

  constructor(options: SecureAuthOptions = {}) {
    this.options = {
      enableRateLimit: true,
      enableInputSanitization: true,
      sessionTimeout: config.security.sessionTimeout,
      ...options
    };

    this.initializeSessionMonitoring();
  }

  private initializeSessionMonitoring() {
    if (this.options.sessionTimeout && this.options.sessionTimeout > 0) {
      this.sessionCheckInterval = setInterval(() => {
        this.checkSessionExpiry();
      }, 60000); // Check every minute
    }
  }

  private async checkSessionExpiry() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      const now = Date.now() / 1000;
      const expiresAt = session.expires_at || 0;
      
      // Warn user 5 minutes before expiry
      if (expiresAt - now < 300 && expiresAt - now > 240) {
        toast.warning('Your session will expire in 5 minutes. Please save your work.');
      }
      
      // Auto-refresh session if it's about to expire
      if (expiresAt - now < 120) {
        try {
          await supabase.auth.refreshSession();
          console.log('🔒 Session automatically refreshed');
        } catch (error) {
          console.error('Failed to refresh session:', error);
          toast.error('Session expired. Please log in again.');
          await this.signOut();
        }
      }
    }
  }

  async signIn(email: string, password: string, rememberMe = false): Promise<any> {
    try {
      // Rate limiting
      if (this.options.enableRateLimit) {
        if (!rateLimitAuth(email)) {
          throw new Error('Too many login attempts. Please try again later.');
        }
      }

      // Input sanitization and validation
      if (this.options.enableInputSanitization) {
        email = sanitizeInput(email);
        if (!validateEmail(email)) {
          throw new Error('Invalid email format');
        }
      }

      // Enhanced sign in with security options
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Log successful authentication
      console.log('🔒 Secure authentication successful:', {
        user: data.user?.email,
        session: !!data.session,
        timestamp: new Date().toISOString()
      });

      return data;
    } catch (error: any) {
      console.error('🔒 Authentication failed:', error.message);
      throw error;
    }
  }

  async signUp(email: string, password: string, userData?: any): Promise<any> {
    try {
      // Rate limiting
      if (this.options.enableRateLimit) {
        if (!rateLimitAuth(email)) {
          throw new Error('Too many registration attempts. Please try again later.');
        }
      }

      // Input sanitization and validation
      if (this.options.enableInputSanitization) {
        email = sanitizeInput(email);
        if (!validateEmail(email)) {
          throw new Error('Invalid email format');
        }

        // Sanitize user data
        if (userData) {
          Object.keys(userData).forEach(key => {
            if (typeof userData[key] === 'string') {
              userData[key] = sanitizeInput(userData[key]);
            }
          });
        }
      }

      // Password strength validation
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;

      console.log('🔒 Secure registration successful:', {
        user: data.user?.email,
        timestamp: new Date().toISOString()
      });

      return data;
    } catch (error: any) {
      console.error('🔒 Registration failed:', error.message);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear any stored session data
      localStorage.removeItem('supabase.auth.token');
      
      console.log('🔒 Secure sign out completed');
    } catch (error: any) {
      console.error('🔒 Sign out failed:', error.message);
      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      // Rate limiting
      if (this.options.enableRateLimit) {
        if (!rateLimitAuth(email)) {
          throw new Error('Too many password reset attempts. Please try again later.');
        }
      }

      // Input sanitization
      if (this.options.enableInputSanitization) {
        email = sanitizeInput(email);
        if (!validateEmail(email)) {
          throw new Error('Invalid email format');
        }
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      console.log('🔒 Password reset initiated for:', email);
    } catch (error: any) {
      console.error('🔒 Password reset failed:', error.message);
      throw error;
    }
  }

  cleanup() {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }
  }
}

// Global secure auth manager instance
export const secureAuth = new SecureAuthManager();

export default secureAuth;
