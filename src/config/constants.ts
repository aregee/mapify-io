
/**
 * Application-wide configuration constants
 */

// API and server configuration
export const API_CONFIG = {
  // Base URL for API requests
  BASE_URL: "http://localhost:3031",
  
  // API endpoints
  ENDPOINTS: {
    MAPPINGS: "/mappings",
    MAPPING_HISTORY: (id: string | number) => `/mappings/${id}/_history`,
  },
  
  // Request timeout in milliseconds
  TIMEOUT: 30000,
};

// Application routes
export const ROUTES = {
  HOME: "/",
  MAPPINGS: "/mappings",
  MAPPING_DETAIL: (id: string | number) => `/mappings/${id}`,
  MAPPING_HISTORY: (id: string | number) => `/mappings/${id}/history`,
};

// UI Configuration
export const UI_CONFIG = {
  // Default pagination limits
  DEFAULT_PAGE_SIZE: 10,
  
  // Date format for display
  DATE_FORMAT: "MMM d, yyyy",
  // Date time format for display
  DATE_TIME_FORMAT: "MMM d, yyyy HH:mm",
};
