import { useAuth as useOidcAuth } from "react-oidc-context";

/**
 * Custom hook that wraps the react-oidc-context useAuth hook
 * Provides authentication state and methods
 */
export const useAuth = () => {
  const auth = useOidcAuth();
  
  return {
    // Authentication state
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    hasError: !!auth.error,
    error: auth.error,
    
    // User information
    user: auth.user,
    
    // Authentication methods
    signIn: () => auth.signinRedirect(),
    signOut: () => auth.signoutRedirect(),
    
    // Token management
    getAccessToken: () => auth.user?.access_token,
  };
};