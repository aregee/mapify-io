import { AuthProvider as OidcAuthProvider } from "react-oidc-context";
import { OIDC_CONFIG } from "@/config/constants";

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Authentication provider component that wraps the OIDC provider
 * Provides authentication context to the entire application
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  return (
    <OidcAuthProvider {...OIDC_CONFIG}>
      {children}
    </OidcAuthProvider>
  );
};