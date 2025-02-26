
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { ArrowLeft, RotateCcw, Database } from "lucide-react";
import { API_CONFIG, ROUTES, UI_CONFIG } from "@/config/constants";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Editor from "@/components/Editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HistoryVersion {
  title: string;
  content: {
    tags: string[];
    yaml: string;
    test_data?: Array<{
      id: string;
      data: string;
      dataTitle?: string;
    }>;
  };
  created_at: string;
  updated_at: string;
  txnid: string;
  href: string;
}

const MappingHistory = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [historyVersions, setHistoryVersions] = useState<HistoryVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentVersion, setCurrentVersion] = useState<HistoryVersion | null>(null);
  const [restoringVersion, setRestoringVersion] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("mapping");
  const [selectedSample, setSelectedSample] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchMappingHistory();
    }
  }, [id]);

  useEffect(() => {
    // Reset selected sample when version changes
    if (currentVersion && currentVersion.content.test_data && currentVersion.content.test_data.length > 0) {
      setSelectedSample(currentVersion.content.test_data[0].id);
    } else {
      setSelectedSample(null);
    }
  }, [currentVersion]);

  const fetchMappingHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MAPPINGS}/${id}/_history`);
      if (!response.ok) {
        throw new Error(`Failed to fetch history: ${response.status}`);
      }
      
      const data = await response.json();
      setHistoryVersions(data);
      
      // Set the first version as current if available
      if (data.length > 0) {
        setCurrentVersion(data[0]);
      }
      
      toast({
        title: "History loaded",
        description: `Found ${data.length} versions for this mapping.`,
      });
    } catch (error) {
      console.error("Error fetching mapping history:", error);
      toast({
        title: "Error loading history",
        description: "Failed to load mapping history. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVersionSelect = (version: HistoryVersion) => {
    setCurrentVersion(version);
  };

  const handleReturnToMapping = () => {
    navigate(ROUTES.MAPPING_DETAIL(id as string));
  };

  const handleRestoreVersion = async () => {
    if (!currentVersion) return;
    
    setRestoringVersion(currentVersion.txnid);
    try {
      // Prepare the mapping data for restoration
      const restoreData = {
        content: {
          yaml: currentVersion.content.yaml,
          tags: currentVersion.content.tags || [],
          test_data: currentVersion.content.test_data || []
        }
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MAPPINGS}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(restoreData),
      });

      if (!response.ok) {
        throw new Error(`Failed to restore version: ${response.status}`);
      }
      
      toast({
        title: "Version restored",
        description: `Successfully restored to version from ${format(new Date(currentVersion.updated_at), UI_CONFIG.DATETIME_FORMAT)}.`,
      });
      
      // Navigate back to the mapping detail view
      navigate(ROUTES.MAPPING_DETAIL(id as string));
    } catch (error) {
      console.error("Error restoring version:", error);
      toast({
        title: "Restore failed",
        description: "Failed to restore to this version. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRestoringVersion(null);
    }
  };

  const formatVersionDate = (dateString: string) => {
    try {
      return format(new Date(dateString), UI_CONFIG.DATETIME_FORMAT);
    } catch (e) {
      return dateString;
    }
  };

  const getSelectedSampleData = () => {
    if (!currentVersion || !currentVersion.content.test_data || !selectedSample) return "";
    
    const sample = currentVersion.content.test_data.find(item => item.id === selectedSample);
    return sample ? sample.data : "";
  };

  const isYamlSample = (data: string) => {
    return typeof data === 'string' && data.trim().startsWith('data:');
  };

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Mapping History</h1>
          <p className="text-muted-foreground">
            {currentVersion ? currentVersion.title : "Loading mapping history..."}
          </p>
        </div>
        <Button onClick={handleReturnToMapping} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Mapping
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle>Versions</CardTitle>
              <CardDescription>
                Select a version to preview
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[550px] pr-4">
                <div className="px-4 pb-4">
                  {historyVersions.map((version, index) => (
                    <div
                      key={version.txnid}
                      className={`mb-2 p-3 rounded-md cursor-pointer transition-colors ${
                        currentVersion?.txnid === version.txnid
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => handleVersionSelect(version)}
                    >
                      <div className="font-medium">Version {historyVersions.length - index}</div>
                      <div className="text-sm opacity-90">
                        {formatVersionDate(version.updated_at)}
                      </div>
                      <div className="text-xs opacity-80">
                        ID: {version.txnid}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="md:col-span-3">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{currentVersion?.title || "No version selected"}</CardTitle>
                  <CardDescription>
                    {currentVersion
                      ? `Last updated: ${formatVersionDate(currentVersion.updated_at)}`
                      : "Select a version to view details"}
                  </CardDescription>
                </div>
                <Button
                  onClick={handleRestoreVersion}
                  disabled={!currentVersion || !!restoringVersion}
                  className="ml-auto"
                >
                  {restoringVersion ? (
                    <>Restoring...</>
                  ) : (
                    <>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Restore This Version
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {currentVersion ? (
                <div>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentVersion.content.tags && currentVersion.content.tags.length > 0 ? (
                        currentVersion.content.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground">No tags</div>
                      )}
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="mapping">Mapping Rules</TabsTrigger>
                      <TabsTrigger 
                        value="samples" 
                        disabled={!currentVersion.content.test_data || currentVersion.content.test_data.length === 0}
                      >
                        Sample Data
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="mapping" className="h-[400px]">
                      <Editor
                        value={currentVersion.content.yaml || ""}
                        onChange={() => {}}
                        language="yaml"
                        readOnly={true}
                        height="100%"
                      />
                    </TabsContent>
                    
                    <TabsContent value="samples">
                      {currentVersion.content.test_data && currentVersion.content.test_data.length > 0 ? (
                        <div>
                          <div className="flex mb-2 gap-2 overflow-x-auto pb-2">
                            {currentVersion.content.test_data.map((sample) => (
                              <Button
                                key={sample.id}
                                variant={selectedSample === sample.id ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedSample(sample.id)}
                                className="flex items-center"
                              >
                                <Database className="h-3 w-3 mr-1" />
                                {sample.dataTitle || `Sample ${sample.id}`}
                              </Button>
                            ))}
                          </div>
                          
                          <div className="h-[350px]">
                            <Editor
                              value={getSelectedSampleData()}
                              onChange={() => {}}
                              language={isYamlSample(getSelectedSampleData()) ? "yaml" : "json"}
                              readOnly={true}
                              height="100%"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                          No sample data available for this version
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  Select a version from the list to view details
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MappingHistory;
