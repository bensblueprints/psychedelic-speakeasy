import { useCallback } from "react";

/**
 * Placeholder auth hook - returns unauthenticated state
 * Will be connected to Supabase Auth later
 */
export function useAuth() {
  const logout = useCallback(async () => {
    // Will be implemented with Supabase Auth
    console.log("Logout not implemented yet");
  }, []);

  return {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
    refresh: () => Promise.resolve(),
    logout,
  };
}
