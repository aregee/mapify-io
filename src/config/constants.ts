
/**
 * Application-wide configuration constants
 */

// API and server configuration
export const API_CONFIG = {
  // Base URL for API requests
  BASE_URL: import.meta.env.VITE_API_BASE || "http://localhost:3031",
  
  // API endpoints
  ENDPOINTS: {
    MAPPINGS: "/mappings",
  },
  
  // Request timeout in milliseconds
  TIMEOUT: 30000,
};

// Environment validation
const validateEnvironment = () => {
  const missing = [];
  
  if (!import.meta.env.VITE_OIDC_ISSUER && !window.location.hostname.includes('localhost')) {
    missing.push('VITE_OIDC_ISSUER');
  }
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
  }
  
  return missing;
};

// Run validation
validateEnvironment();

// OIDC/Keycloak configuration with enhanced settings
export const OIDC_CONFIG = {
  authority: import.meta.env.VITE_OIDC_ISSUER || "http://localhost:8080/realms/mapify",
  clientId: import.meta.env.VITE_OIDC_CLIENT_ID || "mapify-studio",
  redirectUri: `${window.location.origin}/`,
  postLogoutRedirectUri: `${window.location.origin}/`,
  responseType: "code",
  scope: "openid profile email",
  automaticSilentRenew: true,
  loadUserInfo: true,
  // Enhanced Keycloak compatibility settings
  metadataUrl: `${import.meta.env.VITE_OIDC_ISSUER || "http://localhost:8080/realms/mapify"}/.well-known/openid_configuration`,
  includeIdTokenInSilentRenew: true,
  monitorSession: false,
  checkSessionInterval: 2000,
  silentRequestTimeout: 10000,
  // Debug logging for development
  ...(import.meta.env.DEV && {
    extraQueryParams: {},
    extraHeaders: {},
  }),
};

// Debug utilities
export const OIDC_DEBUG = {
  isEnabled: import.meta.env.DEV,
  log: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(`[OIDC Debug] ${message}`, data || '');
    }
  },
  error: (message: string, error?: any) => {
    if (import.meta.env.DEV) {
      console.error(`[OIDC Error] ${message}`, error || '');
    }
  },
};


// Application routes
export const ROUTES = {
  HOME: "/",
  MAPPINGS: "/mappings",
  MAPPING_DETAIL: (id: string | number) => `/mappings/${id}`,
  MAPPING_HISTORY: (id: string | number) => `/mappings/${id}/_history`,
  MAPPING_HISTORY_VERSION: (id: string | number, version: string) => `/mappings/${id}/_history/${version}`,
};

// UI Configuration
export const UI_CONFIG = {
  // Default pagination limits
  DEFAULT_PAGE_SIZE: 10,
  
  // Date format for display
  DATE_FORMAT: "MMM d, yyyy",
  
  // Detailed date format with time
  DATETIME_FORMAT: "MMM d, yyyy h:mm a",
};
