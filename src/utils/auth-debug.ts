/**
 * Authentication debugging utilities
 */

export const AuthDebug = {
  /**
   * Enable OIDC client debug logging
   */
  enableOidcDebug: () => {
    if (typeof window !== 'undefined' && import.meta.env.DEV) {
      (window as any).localStorage.debug = 'oidc-client-ts:*';
      console.log('[Auth Debug] OIDC debug logging enabled');
    }
  },

  /**
   * Disable OIDC client debug logging
   */
  disableOidcDebug: () => {
    if (typeof window !== 'undefined') {
      (window as any).localStorage.removeItem('debug');
      console.log('[Auth Debug] OIDC debug logging disabled');
    }
  },

  /**
   * Check Keycloak server connectivity
   */
  checkKeycloakHealth: async (authority: string) => {
    try {
      const wellKnownUrl = `${authority}/.well-known/openid_configuration`;
      const response = await fetch(wellKnownUrl);
      
      if (response.ok) {
        const config = await response.json();
        console.log('[Auth Debug] Keycloak server is reachable', { 
          issuer: config.issuer,
          authorizationEndpoint: config.authorization_endpoint,
          tokenEndpoint: config.token_endpoint 
        });
        return true;
      } else {
        console.error('[Auth Debug] Keycloak server returned error:', response.status);
        return false;
      }
    } catch (error) {
      console.error('[Auth Debug] Failed to reach Keycloak server:', error);
      return false;
    }
  },

  /**
   * Log current authentication state
   */
  logAuthState: (auth: any) => {
    if (import.meta.env.DEV) {
      console.log('[Auth Debug] Current auth state:', {
        isAuthenticated: auth.isAuthenticated,
        isLoading: auth.isLoading,
        hasError: !!auth.error,
        error: auth.error?.message,
        user: auth.user ? {
          sub: auth.user.profile?.sub,
          name: auth.user.profile?.name,
          email: auth.user.profile?.email,
          tokenExpiry: new Date(auth.user.expires_at * 1000).toISOString()
        } : null
      });
    }
  },

  /**
   * Test network connectivity to Keycloak
   */
  testConnectivity: async () => {
    const authority = import.meta.env.VITE_OIDC_ISSUER || "http://localhost:8080/realms/mapify";
    console.log('[Auth Debug] Testing connectivity to:', authority);
    
    const isReachable = await AuthDebug.checkKeycloakHealth(authority);
    
    if (!isReachable) {
      console.error(`
[Auth Debug] Keycloak Connection Failed!

Possible solutions:
1. Ensure Keycloak is running at: ${authority}
2. Check if the realm 'mapify' exists
3. Verify CORS settings in Keycloak
4. Check firewall/network connectivity

To start Keycloak locally:
docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:latest start-dev
      `);
    }
    
    return isReachable;
  }
};

// Auto-enable debug logging in development
if (import.meta.env.DEV) {
  AuthDebug.enableOidcDebug();
}