
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AuthCallback = (session: Session | null, user: User | null) => void;

class AuthManager {
  private static instance: AuthManager | null = null;
  private listeners: Set<AuthCallback> = new Set();
  private authSubscription: any = null;
  private currentSession: Session | null = null;
  private initialized = false;

  private constructor() {
    // Private constructor to ensure singleton
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    console.log('🔐 Initializing AuthManager (singleton)');
    
    // Set up the auth listener only once
    if (!this.authSubscription) {
      this.authSubscription = supabase.auth.onAuthStateChange((event, session) => {
        console.log('🔐 AuthManager state change:', event, session?.user?.email);
        this.currentSession = session;
        this.notifyListeners(session, session?.user || null);
      });
    }

    // Get initial session
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('❌ Error getting initial session:', error);
      } else {
        this.currentSession = session;
        this.notifyListeners(session, session?.user || null);
      }
    } catch (error) {
      console.error('❌ Failed to get initial session:', error);
    }

    this.initialized = true;
  }

  subscribe(callback: AuthCallback): () => void {
    this.listeners.add(callback);
    
    // Immediately call with current session if available
    if (this.currentSession !== undefined) {
      callback(this.currentSession, this.currentSession?.user || null);
    }

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(session: Session | null, user: User | null): void {
    this.listeners.forEach(callback => {
      try {
        callback(session, user);
      } catch (error) {
        console.error('❌ Error in auth listener callback:', error);
      }
    });
  }

  getCurrentSession(): Session | null {
    return this.currentSession;
  }

  destroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
      this.authSubscription = null;
    }
    this.listeners.clear();
    this.initialized = false;
    AuthManager.instance = null;
    console.log('🔐 AuthManager destroyed');
  }
}

export const authManager = AuthManager.getInstance();
