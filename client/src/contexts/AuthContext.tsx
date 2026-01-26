import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as AuthUser } from '@supabase/supabase-js';
import {
  supabase,
  User,
  getCurrentAuthUser,
  getCurrentUserProfile,
  signIn as supabaseSignIn,
  signUp as supabaseSignUp,
  signOut as supabaseSignOut
} from '../lib/supabase';

// Helper to ensure user record exists in our users table
async function ensureUserRecord(authUser: AuthUser): Promise<User | null> {
  // First try to get existing profile
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('openId', authUser.id)
    .maybeSingle();

  if (existingUser) {
    return existingUser as User;
  }

  // Create new user record if none exists
  // Check if this email should be admin (for initial setup)
  const isAdminEmail = authUser.email === 'admin@speakeasy.com';

  const { data: newUser, error } = await supabase
    .from('users')
    .insert({
      openId: authUser.id,
      email: authUser.email,
      name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Member',
      role: isAdminEmail ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastSignedIn: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating user record:', error);
    return null;
  }

  return newUser as User;
}

interface AuthContextType {
  authUser: AuthUser | null;
  userProfile: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = userProfile?.role === 'admin';

  const refreshProfile = async () => {
    const profile = await getCurrentUserProfile();
    setUserProfile(profile);
  };

  useEffect(() => {
    // Check initial session
    const initAuth = async () => {
      try {
        const user = await getCurrentAuthUser();
        setAuthUser(user);

        if (user) {
          // Ensure user record exists and get profile
          const profile = await ensureUserRecord(user);
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuthUser(session?.user ?? null);

        if (session?.user) {
          // Ensure user record exists and get profile
          const profile = await ensureUserRecord(session.user);
          setUserProfile(profile);
        } else {
          setUserProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await supabaseSignIn(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    try {
      await supabaseSignUp(email, password, name);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabaseSignOut();
      setAuthUser(null);
      setUserProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authUser,
        userProfile,
        isLoading,
        isAdmin,
        signIn,
        signUp,
        signOut,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
