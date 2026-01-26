import { useState, useEffect, useCallback } from "react";
import { supabase, User } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
    isAuthenticated: false,
    isAdmin: false,
  });

  // Fetch user data from our users table
  const fetchUserData = useCallback(async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        return null;
      }
      return data as User;
    } catch (err) {
      console.error('Error fetching user:', err);
      return null;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user?.email) {
        const userData = await fetchUserData(session.user.email);
        setState({
          session,
          user: userData,
          loading: false,
          error: null,
          isAuthenticated: !!userData,
          isAdmin: userData?.role === 'admin',
        });
      } else {
        setState({
          session: null,
          user: null,
          loading: false,
          error: null,
          isAuthenticated: false,
          isAdmin: false,
        });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user?.email) {
          const userData = await fetchUserData(session.user.email);
          setState({
            session,
            user: userData,
            loading: false,
            error: null,
            isAuthenticated: !!userData,
            isAdmin: userData?.role === 'admin',
          });
        } else {
          setState({
            session: null,
            user: null,
            loading: false,
            error: null,
            isAuthenticated: false,
            isAdmin: false,
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchUserData]);

  // Sign up with email/password
  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // Create user record in our table
      if (authData.user) {
        const { error: insertError } = await supabase.from('users').insert({
          openId: authData.user.id,
          email,
          name: name || null,
          role: 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastSignedIn: new Date().toISOString(),
        });

        if (insertError) {
          console.error('Error creating user record:', insertError);
        }
      }

      return { success: true, error: null };
    } catch (err: any) {
      setState(prev => ({ ...prev, loading: false, error: err.message }));
      return { success: false, error: err.message };
    }
  }, []);

  // Sign in with email/password
  const signIn = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Update last signed in
      await supabase
        .from('users')
        .update({ lastSignedIn: new Date().toISOString() })
        .eq('email', email);

      return { success: true, error: null };
    } catch (err: any) {
      setState(prev => ({ ...prev, loading: false, error: err.message }));
      return { success: false, error: err.message };
    }
  }, []);

  // Sign out
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setState({
      session: null,
      user: null,
      loading: false,
      error: null,
      isAuthenticated: false,
      isAdmin: false,
    });
  }, []);

  // Refresh user data
  const refresh = useCallback(async () => {
    if (state.session?.user?.email) {
      const userData = await fetchUserData(state.session.user.email);
      setState(prev => ({
        ...prev,
        user: userData,
        isAuthenticated: !!userData,
        isAdmin: userData?.role === 'admin',
      }));
    }
  }, [state.session, fetchUserData]);

  return {
    ...state,
    signUp,
    signIn,
    logout,
    refresh,
  };
}
