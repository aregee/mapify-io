
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, RotateCcw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Editor from '@/components/Editor';
import { API_CONFIG, ROUTES } from '@/config/constants';
import { MappingHistoryVersion } from '@/types/mapping-history';
import { Format } from '@/types/data-mapper';
import { convertFormat } from '@/utils/format-converter';
import { Mapping } from '@/types/mapping';
import MappingHistorySidebar from '@/components/MappingHistorySidebar';

const MappingHistory = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [historyVersions, setHistoryVersions] = useState<MappingHistoryVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<MappingHistoryVersion | null>(null);
  const [currentMapping, setCurrentMapping] = useState<Mapping | null>(null);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(false);
  const [format, setFormat] = useState<Format>('yaml');

  useEffect(() => {
    if (id) {
      fetchHistoryData();
      fetchCurrentMapping();
    }
  }, [id]);

  const fetchHistoryData = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MAPPING_HISTORY(id!)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch history data: ${response.status}`);
      }
      
      const data = await response.json();
      
      // The API might return an object with a versions array or directly an array
      const versions = Array.isArray(data) ? data : data.versions || [];
      
      // Sort versions by date (newest first)
      const sortedVersions = versions.sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
      
      setHistoryVersions(sortedVersions);
      
      // Select the first version if available
      if (sortedVersions.length > 0) {
        setSelectedVersion(sortedVersions[0]);
      }
    } catch (error) {
      console.error('Error fetching history data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load mapping history. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentMapping = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MAPPINGS}/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch current mapping: ${response.status}`);
      }
      
      const data = await response.json();
      setCurrentMapping(data);
    } catch (error) {
      console.error('Error fetching current mapping:', error);
    }
  };

  const handleFormatChange = (newFormat: Format) => {
    if (!selectedVersion || newFormat === format) return;

    try {
      // Convert the yaml
      const convertedYaml = convertFormat(selectedVersion.content.yaml, format, newFormat);
      
      // Update the selected version with the converted yaml
      setSelectedVersion({
        ...selectedVersion,
        content: {
          ...selectedVersion.content,
          yaml: convertedYaml,
        },
      });
      
      // Set the new format
      setFormat(newFormat);
      
      toast({
        title: `Format changed to ${newFormat.toUpperCase()}`,
        description: 'Content successfully converted to the new format.',
      });
    } catch (error) {
      console.error('Format conversion error:', error);
      toast({
        title: 'Format conversion failed',
        description: 'Failed to convert between formats. Keeping original format.',
        variant: 'destructive',
      });
    }
  };

  const handleRestoreVersion = async () => {
    if (!selectedVersion || !id) return;
    
    setRestoring(true);
    try {
      // Prepare the data for the PUT request
      const data = {
        content: {
          yaml: selectedVersion.content.yaml,
          tags: selectedVersion.content.tags || [],
          // Preserve test_data from current mapping if available
          test_data: currentMapping?.content.test_data || [],
        }
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MAPPINGS}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText}`);
      }

      toast({
        title: 'Version Restored',
        description: 'The selected version has been successfully restored.',
      });

      // Navigate back to the mapping detail view
      navigate(ROUTES.MAPPING_DETAIL(id));
    } catch (error) {
      console.error('Error restoring version:', error);
      toast({
        title: 'Restore Failed',
        description: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setRestoring(false);
    }
  };

  const handleBackToMapping = () => {
    navigate(ROUTES.MAPPING_DETAIL(id!));
  };

  const handleVersionSelect = (version: MappingHistoryVersion) => {
    setSelectedVersion(version);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar with history versions */}
      <MappingHistorySidebar 
        versions={historyVersions}
        selectedVersion={selectedVersion}
        onSelectVersion={handleVersionSelect}
        loading={loading}
        currentMapping={currentMapping}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 max-w-screen-2xl items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBackToMapping}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="mr-4 hidden md:flex">
              <h1 className="text-xl font-semibold">
                {currentMapping ? `${currentMapping.title} - History` : "Mapping History"}
              </h1>
            </div>
            <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={handleRestoreVersion}
                  disabled={!selectedVersion || restoring}
                >
                  {restoring ? "Restoring..." : "Restore This Version"}
                  <RotateCcw className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Tabs value={format} onValueChange={(value) => handleFormatChange(value as Format)}>
                  <TabsList className="h-8">
                    <TabsTrigger value="yaml" className="text-xs">YAML</TabsTrigger>
                    <TabsTrigger value="json" className="text-xs">JSON</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto p-6 flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : !selectedVersion ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Clock className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">
                No version history available
              </p>
            </div>
          ) : (
            <Card className="rounded-md border shadow-md flex flex-col h-full">
              <div className="flex items-center justify-between p-2 border-b">
                <div className="text-sm font-medium">Mapping Rules</div>
              </div>
              <div className="flex-1 w-full overflow-auto">
                <Editor
                  value={selectedVersion.content.yaml}
                  onChange={() => {}} // Read-only in history view
                  language={format}
                  readOnly
                />
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MappingHistory;
