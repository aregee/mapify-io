import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, LogIn } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Component that protects routes requiring authentication
 * Shows loading state or login prompt when user is not authenticated
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, signIn } = useAuth();

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
            <Button onClick={signIn} className="w-full">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In with Keycloak
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};