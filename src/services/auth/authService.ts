
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export class AuthService {
  static async signIn(email: string, password: string) {
    try {
      console.log('AuthService.signIn starting for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        console.error('AuthService.signIn error:', error);
        return { error };
      }
      
      console.log('AuthService.signIn success:', {
        user: data.user?.email,
        session: !!data.session
      });
      
      return { error: null, data };
    } catch (error: any) {
      console.error('AuthService.signIn exception:', error);
      return { error };
    }
  }

  static async signUp(email: string, password: string, userData?: any) {
    try {
      console.log('AuthService.signUp starting for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) {
        console.error('AuthService.signUp error:', error);
        return { error };
      }
      
      console.log('AuthService.signUp success:', {
        user: data.user?.email,
        session: !!data.session
      });
      
      return { error: null, data };
    } catch (error: any) {
      console.error('AuthService.signUp exception:', error);
      return { error };
    }
  }

  static async signOut() {
    try {
      console.log('AuthService.signOut starting');
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
        console.error('AuthService.signOut error:', error);
        throw error;
      }
      console.log('AuthService.signOut success');
    } catch (error: any) {
      console.error('AuthService.signOut exception:', error);
      throw error;
    }
  }

  static async refreshSession() {
    try {
      console.log('AuthService.refreshSession starting');
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('AuthService.refreshSession error:', error);
        throw error;
      }
      console.log('AuthService.refreshSession success');
      return data;
    } catch (error: any) {
      console.error('AuthService.refreshSession exception:', error);
      throw error;
    }
  }
}
