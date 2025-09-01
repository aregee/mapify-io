
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

// OIDC/Keycloak configuration
export const OIDC_CONFIG = {
  AUTHORITY: import.meta.env.VITE_OIDC_ISSUER || "http://localhost:8080/realms/mapify",
  CLIENT_ID: import.meta.env.VITE_OIDC_CLIENT_ID || "mapify-studio",
  REDIRECT_URI: `${window.location.origin}/`,
  POST_LOGOUT_REDIRECT_URI: `${window.location.origin}/`,
  RESPONSE_TYPE: "code",
  SCOPE: "openid profile email",
  AUTOMATICSILENTRENEW: true,
  LOADUSERINFO: true,
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
