import React, { createContext, useContext } from "react";
import { ApiService, createApiService } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

interface ApiContextType {
  apiService: ApiService;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

interface ApiProviderProps {
  children: React.ReactNode;
}

/**
 * API context provider that creates an authenticated API service
 */
export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const { getAccessToken } = useAuth();
  
  const apiService = createApiService(getAccessToken);

  return (
    <ApiContext.Provider value={{ apiService }}>
      {children}
    </ApiContext.Provider>
  );
};

/**
 * Hook to use the API service
 */
export const useApi = (): ApiContextType => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error("useApi must be used within an ApiProvider");
  }
  return context;
};