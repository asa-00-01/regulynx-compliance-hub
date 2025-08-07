
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export class AuthService {
  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        return { error };
      }
      
      return { error: null };
    } catch (error: any) {
      console.error('SignIn error:', error);
      return { error };
    }
  }

  static async signUp(email: string, password: string, userData?: any) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      
      if (error) {
        return { error };
      }
      
      return { error: null };
    } catch (error: any) {
      console.error('SignUp error:', error);
      return { error };
    }
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      console.error('SignOut error:', error);
    }
  }

  static async refreshSession() {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error('Refresh session error:', error);
      throw error;
    }
    return data;
  }
}
