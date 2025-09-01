import { UserProfile } from "@/components/auth/UserProfile";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Application header component with navigation and user profile
 */
export const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isOnMappingsList = location.pathname === "/" || location.pathname === "/mappings";
  
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center space-x-4">
          {!isOnMappingsList && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/mappings")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Mappings
            </Button>
          )}
          <h1 className="text-lg font-semibold text-foreground">
            ETLP Data Mapping Studio
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <UserProfile />
        </div>
      </div>
    </header>
  );
};