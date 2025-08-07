
import { supabase } from '@/integrations/supabase/client';

export interface AuthResult {
  error: any;
}

export class AuthService {
  static async signIn(email: string, password: string): Promise<AuthResult> {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  }

  static async signUp(email: string, password: string, userData?: any): Promise<AuthResult> {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: userData || {}
      }
    });
    return { error };
  }

  static async signOut(): Promise<void> {
    await supabase.auth.signOut();
  }

  static async refreshSession(): Promise<void> {
    await supabase.auth.refreshSession();
  }
}
