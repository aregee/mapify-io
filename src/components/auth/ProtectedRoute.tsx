import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, LogIn, AlertCircle, RefreshCw } from "lucide-react";
import { OIDC_DEBUG } from "@/config/constants";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Component that protects routes requiring authentication
 * Shows loading state or login prompt when user is not authenticated
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, signIn, hasError, error } = useAuth();

  const handleSignIn = () => {
    OIDC_DEBUG.log("Manual sign-in triggered");
    signIn();
  };

  const handleRetry = () => {
    OIDC_DEBUG.log("Retrying authentication");
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Checking authentication...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state if authentication failed
  if (hasError && error) {
    OIDC_DEBUG.error("Authentication error", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Authentication Error
            </h2>
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error.message || "Failed to connect to authentication server. Please check if Keycloak is running."}
              </AlertDescription>
            </Alert>
            <div className="flex gap-2 w-full">
              <Button onClick={handleRetry} variant="outline" className="flex-1">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
              <Button onClick={handleSignIn} className="flex-1">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </div>
            {OIDC_DEBUG.isEnabled && (
              <details className="mt-4 w-full">
                <summary className="text-sm text-muted-foreground cursor-pointer">Debug Info</summary>
                <pre className="text-xs mt-2 p-2 bg-muted rounded overflow-auto">
                  {JSON.stringify({ error: error.message, stack: error.stack }, null, 2)}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <LogIn className="h-12 w-12 text-primary mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Authentication Required
            </h2>
            <p className="text-muted-foreground text-center mb-6">
              Please sign in to access the ETLP Data Mapping Studio
            </p>
            <Button onClick={handleSignIn} className="w-full">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In with Keycloak
            </Button>
            {OIDC_DEBUG.isEnabled && (
              <details className="mt-4 w-full">
                <summary className="text-sm text-muted-foreground cursor-pointer">Debug Info</summary>
                <div className="text-xs mt-2 p-2 bg-muted rounded">
                  <p>Authority: {import.meta.env.VITE_OIDC_ISSUER || "http://localhost:8080/realms/mapify"}</p>
                  <p>Client: {import.meta.env.VITE_OIDC_CLIENT_ID || "mapify-studio"}</p>
                  <p>Redirect: {window.location.origin}/</p>
                </div>
              </details>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};