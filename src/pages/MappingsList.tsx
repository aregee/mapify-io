import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Plus, Search, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Mapping } from "@/types/mapping";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import CreateMapping from "@/components/CreateMapping";
import { API_CONFIG, ROUTES, UI_CONFIG } from "@/config/constants";
import { useApi } from "@/context/ApiContext";

const MappingsList = () => {
  const { apiService } = useApi();
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreatingMapping, setIsCreatingMapping] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMappings();
  }, []);

  const fetchMappings = async () => {
    setLoading(true);
    try {
      const data = await apiService.get(API_CONFIG.ENDPOINTS.MAPPINGS);
      
      // Process the data to ensure tags is always an array and yaml is a string
      const processedData = data.map((mapping: any) => ({
        ...mapping,
        content: {
          ...mapping.content,
          // Ensure tags is always an array, even if it comes as null, undefined, or a non-array value
          tags: Array.isArray(mapping.content.tags) ? mapping.content.tags : [],
          // Ensure yaml is always a string
          yaml: typeof mapping.content.yaml === 'string' ? mapping.content.yaml : ''
        }
      }));
      
      setMappings(processedData);
    } catch (error) {
      console.error("Error fetching mappings:", error);
      toast({
        title: "Error",
        description: "Failed to load mappings. Please try again.",
        variant: "destructive",
      });
      setMappings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMappingClick = (mappingId: number) => {
    navigate(ROUTES.MAPPING_DETAIL(mappingId));
  };

  const filteredMappings = mappings.filter(mapping => 
    mapping.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (Array.isArray(mapping.content.tags) && 
     mapping.content.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), UI_CONFIG.DATE_FORMAT);
    } catch (e) {
      return dateString;
    }
  };

  const handleCreateMapping = () => {
    setIsCreatingMapping(true);
  };

  const handleCreationSuccess = (newMappingId?: number) => {
    setIsCreatingMapping(false);
    
    toast({
      title: "Success",
      description: "New mapping created successfully",
    });
    
    if (newMappingId) {
      // Navigate to the new mapping if we have an ID
      navigate(ROUTES.MAPPING_DETAIL(newMappingId));
    } else {
      // Otherwise just refresh the list
      fetchMappings();
    }
  };

  const handleDeleteMapping = async (mappingId: number, title: string) => {
    try {
      await apiService.delete(`/mappings/${mappingId}`);
      
      toast({
        title: "Success",
        description: `Mapping "${title}" deleted successfully`,
      });
      
      // Refresh the list
      fetchMappings();
    } catch (error) {
      console.error("Error deleting mapping:", error);
      toast({
        title: "Error",
        description: "Failed to delete mapping. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Helper function to safely render tags
  const renderTags = (mapping: Mapping) => {
    if (!Array.isArray(mapping.content.tags)) {
      return null;
    }
    
    return (
      <div className="flex flex-wrap gap-2 mb-3">
        {mapping.content.tags.map((tag, index) => (
          <Badge key={index} variant="secondary">{tag}</Badge>
        ))}
      </div>
    );
  };

  // Helper function to safely render YAML preview
  const renderYamlPreview = (mapping: Mapping) => {
    if (!mapping.content.yaml || typeof mapping.content.yaml !== 'string') {
      return 'No YAML content available';
    }
    
    try {
      return mapping.content.yaml.substring(0, 150) + 
             (mapping.content.yaml.length > 150 ? '...' : '');
    } catch (error) {
      console.error("Error rendering YAML preview:", error);
      return 'Error displaying YAML content';
    }
  };

  return (
    <div className="container max-w-5xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Data Mappings</h1>
        <Button onClick={handleCreateMapping}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Mapping
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by title or tags..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredMappings.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-lg text-muted-foreground mb-4">No mappings found</p>
          <Button variant="outline" onClick={handleCreateMapping}>
            <Plus className="mr-2 h-4 w-4" />
            Create your first mapping
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredMappings.map((mapping) => (
            <Card key={mapping.id} className="overflow-hidden transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{mapping.title}</CardTitle>
                  <div className="flex gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Mapping</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{mapping.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteMapping(mapping.id, mapping.title)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleMappingClick(mapping.id)}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Created {formatDate(mapping.created_at)}
                  {mapping.updated_at !== mapping.created_at && 
                    ` • Updated ${formatDate(mapping.updated_at)}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderTags(mapping)}
                <Separator className="my-3" />
                <div className="text-sm text-muted-foreground">
                  <p className="line-clamp-2 font-mono text-xs bg-muted p-2 rounded">
                    {renderYamlPreview(mapping)}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleMappingClick(mapping.id)}
                >
                  Open Mapper
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <CreateMapping 
        open={isCreatingMapping} 
        onOpenChange={setIsCreatingMapping} 
        onSuccess={handleCreationSuccess}
        baseUrl={API_CONFIG.BASE_URL}
      />
    </div>
  );
};

export default MappingsList;
