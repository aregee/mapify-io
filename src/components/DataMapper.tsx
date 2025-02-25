
import React, { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import Editor from "./Editor";
import { X, Play, Save } from "lucide-react";
import { Format, SampleDataItem, TransformResponse, TransformMode } from "@/types/data-mapper";
import { convertFormat, transformData } from "@/utils/format-converter";
import { SampleDataDropdown } from "./data-mapper/SampleDataDropdown";
import { SampleDataEditor } from "./data-mapper/SampleDataEditor";
import { toast } from "./ui/use-toast";
import { parse as yamlParse, stringify as yamlStringify } from 'yaml';

interface MappingData {
  id: number;
  title: string;
  content: {
    tags: string[];
    yaml: string;
    test_data: any[];
  };
  created_at: string;
  updated_at: string;
  href: string;
}

interface DataMapperProps {
  apiUrl?: string;
  baseUrl?: string;
}

const DataMapper: React.FC<DataMapperProps> = ({ apiUrl, baseUrl = 'http://localhost:3031' }) => {
  const [mappingRules, setMappingRules] = useState("");
  const [sampleDataList, setSampleDataList] = useState<SampleDataItem[]>([]);
  const [output, setOutput] = useState("");
  const [format, setFormat] = useState<Format>("yaml");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState("");
  const [isEditingYaml, setIsEditingYaml] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transformLoading, setTransformLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [mappingData, setMappingData] = useState<MappingData | null>(null);
  const [transformMode, setTransformMode] = useState<TransformMode>("test");

  useEffect(() => {
    if (apiUrl) {
      fetchMappingData();
    }
  }, [apiUrl]);

  const fetchMappingData = async () => {
    if (!apiUrl) return;
    
    setLoading(true);
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }
      
      const data: MappingData = await response.json();
      setMappingData(data);
      
      // Set the mapping rules from the API data
      setMappingRules(data.content.yaml);
      
      // Convert test_data to our sample data format
      if (data.content.test_data && Array.isArray(data.content.test_data)) {
        const samples = data.content.test_data.map((item, index) => {
          const isYaml = typeof item.data === 'string' && item.data.trim().startsWith('data:');
          return {
            id: item.id || `sample-${index}`,
            name: item.dataTitle || `Sample ${index + 1}`,
            data: item.data || '',
            isYaml: isYaml,
            dataTitle: item.dataTitle
          };
        });
        
        setSampleDataList(samples.length > 0 ? samples : getDefaultSamples());
      } else {
        // Add default samples if none exist
        setSampleDataList(getDefaultSamples());
      }
      
      toast({
        title: "Mapping data loaded",
        description: `Successfully loaded "${data.title}" mapping configuration.`,
      });
    } catch (error) {
      console.error("Error fetching mapping data:", error);
      toast({
        title: "Error loading data",
        description: "Failed to load mapping configuration. Please try again.",
        variant: "destructive",
      });
      setSampleDataList(getDefaultSamples());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultSamples = (): SampleDataItem[] => {
    return [
      {
        id: "1",
        name: "Simple User Data",
        data: JSON.stringify({
          name: "John Doe",
          age: 30,
          email: "john@example.com",
          address: {
            street: "123 Main St",
            city: "New York",
            country: "USA"
          }
        }, null, 2),
        isYaml: false
      },
      {
        id: "2",
        name: "YAML Sample",
        data: `data:
  meta: 
    Key: "somekey"
    Bucket: "somebucket"
  user:
    name: "Jane Smith"
    age: 28
    email: "jane@example.com"
    address:
      street: "456 Oak Ave"
      city: "San Francisco"
      country: "USA"`,
        isYaml: true,
        dataTitle: "yaml_sample"
      }
    ];
  };

  const handleFormatChange = (newFormat: Format) => {
    try {
      const converted = convertFormat(mappingRules, format, newFormat);
      setMappingRules(converted);
      setFormat(newFormat);
    } catch (error) {
      console.error("Format conversion error:", error);
      toast({
        title: "Format conversion failed",
        description: "Failed to convert between formats. Check your syntax.",
        variant: "destructive",
      });
    }
  };

  const handleTransform = async (data: string, isYaml: boolean = false) => {
    setTransformLoading(true);
    try {
      if (transformMode === "apply" && mappingData?.id) {
        await transformWithApplyEndpoint(data, isYaml);
      } else {
        await transformWithTestEndpoint(data, isYaml);
      }
    } catch (error) {
      console.error("Transform error:", error);
      toast({
        title: "Transformation failed",
        description: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
      setOutput("Error during transformation. Check console for details.");
    } finally {
      setTransformLoading(false);
      setShowOutput(true);
    }
  };

  const transformWithApplyEndpoint = async (data: string, isYaml: boolean = false) => {
    if (!mappingData?.id) {
      throw new Error("No mapping ID available");
    }

    let parsedData;
    if (isYaml) {
      try {
        parsedData = yamlParse(data);
      } catch (e) {
        throw new Error(`YAML parsing error: ${e instanceof Error ? e.message : "Invalid YAML"}`);
      }
    } else {
      try {
        parsedData = JSON.parse(data);
      } catch (e) {
        throw new Error(`JSON parsing error: ${e instanceof Error ? e.message : "Invalid JSON"}`);
      }
    }

    const response = await fetch(`${baseUrl}/mappings/${mappingData.id}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data: parsedData })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    
    // Format the output based on current format preference
    if (format === "yaml") {
      setOutput(yamlStringify(result));
    } else {
      setOutput(JSON.stringify(result, null, 2));
    }

    toast({
      title: "Transformation successful",
      description: "Data has been transformed using the apply endpoint.",
    });
  };

  const transformWithTestEndpoint = async (data: string, isYaml: boolean = false) => {
    let requestBody;
    
    if (isYaml) {
      // For YAML data, we need to create a specific format with template and scope
      const yamlRequest = `template: \n${mappingRules.split('\n').map(line => `  ${line}`).join('\n')}\nscope: \n${data.split('\n').map(line => `  ${line}`).join('\n')}`;
      requestBody = yamlRequest;
    } else {
      // For JSON data
      try {
        const jsonData = JSON.parse(data);
        requestBody = yamlStringify({
          template: mappingRules,
          scope: jsonData
        });
      } catch (e) {
        throw new Error(`JSON parsing error: ${e instanceof Error ? e.message : "Invalid JSON"}`);
      }
    }

    const response = await fetch(`${baseUrl}/mappings/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-yaml'
      },
      body: requestBody
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    
    // Format the output based on current format preference
    if (format === "yaml") {
      setOutput(yamlStringify(result));
    } else {
      setOutput(JSON.stringify(result, null, 2));
    }

    toast({
      title: "Transformation successful",
      description: "Data has been transformed using the test endpoint.",
    });
  };

  const saveMapping = async () => {
    if (!mappingData?.id) {
      toast({
        title: "Save failed",
        description: "No mapping ID available to save changes.",
        variant: "destructive",
      });
      return;
    }

    setSaveLoading(true);
    try {
      // Prepare the test_data from sampleDataList
      const testData = sampleDataList.map(item => ({
        id: item.id,
        data: item.data,
        dataTitle: item.name || item.dataTitle
      }));

      // Prepare the data for the PUT request
      const data = {
        content: {
          yaml: mappingRules,
          tags: mappingData.content.tags || [],
          test_data: testData
        }
      };

      const response = await fetch(`${baseUrl}/mappings/${mappingData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText}`);
      }

      const result = await response.json();
      setMappingData(result);

      toast({
        title: "Mapping saved",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Save failed",
        description: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const addSampleData = () => {
    const newItem: SampleDataItem = {
      id: Date.now().toString(),
      name: `Sample Data ${sampleDataList.length + 1}`,
      data: "",
      isYaml: false
    };
    setSampleDataList([...sampleDataList, newItem]);
    setEditingId(newItem.id);
    setEditingData("");
    setIsEditingYaml(false);
  };

  const deleteSampleData = (id: string) => {
    setSampleDataList(sampleDataList.filter(item => item.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditingData("");
      setIsEditingYaml(false);
    }
  };

  const startEditing = (item: SampleDataItem) => {
    setEditingId(item.id);
    setEditingData(item.data);
    setIsEditingYaml(!!item.isYaml);
  };

  const saveEditing = () => {
    if (editingId) {
      setSampleDataList(sampleDataList.map(item => 
        item.id === editingId ? { 
          ...item, 
          data: editingData,
          isYaml: isEditingYaml 
        } : item
      ));
      setEditingId(null);
      setEditingData("");
      setIsEditingYaml(false);
    }
  };

  const toggleTransformMode = () => {
    setTransformMode(prev => prev === "test" ? "apply" : "test");
    toast({
      title: `Transform mode: ${transformMode === "test" ? "Apply" : "Test"}`,
      description: `Now using the ${transformMode === "test" ? "apply" : "test"} endpoint for transformations.`,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background animate-fade-in">
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="mr-4 hidden md:flex">
            <h1 className="text-xl font-semibold">
              {mappingData ? mappingData.title : "Data Mapper"}
            </h1>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8"
                onClick={toggleTransformMode}
              >
                Mode: {transformMode === "test" ? "Test" : "Apply"}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8"
                onClick={saveMapping}
                disabled={saveLoading || !mappingData?.id}
              >
                {saveLoading ? "Saving..." : "Save"}
                <Save className="ml-1 h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <SampleDataDropdown
                sampleDataList={sampleDataList}
                onAddSample={addSampleData}
                onEdit={startEditing}
                onTransform={(data, isYaml) => handleTransform(data, isYaml)}
                onDelete={deleteSampleData}
              />
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

      <div className="container mx-auto p-6 flex-1 flex flex-col">
        <div 
          className="grid gap-6 flex-1" 
          style={{ 
            gridTemplateColumns: showOutput ? "1fr 400px" : "1fr",
            transition: "grid-template-columns 0.3s ease-in-out"
          }}
        >
          <Card className="rounded-md border shadow-md flex flex-col">
            <div className="flex items-center justify-between p-2 border-b">
              <div className="text-sm font-medium">Mapping Rules</div>
              {transformLoading && <div className="text-xs text-muted-foreground">Processing...</div>}
            </div>
            <div className="flex-1 w-full">
              <Editor
                value={mappingRules}
                onChange={setMappingRules}
                language={format}
              />
            </div>
          </Card>

          {showOutput && (
            <Card className="rounded-md border shadow-md flex flex-col">
              <div className="flex items-center justify-between p-2 border-b">
                <div className="text-sm font-medium">Output</div>
                <Button 
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() => setShowOutput(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 w-full">
                <Editor
                  value={output}
                  onChange={setOutput}
                  language={format}
                  readOnly
                />
              </div>
            </Card>
          )}
        </div>
      </div>

      <SampleDataEditor
        isOpen={!!editingId}
        onOpenChange={(open) => !open && setEditingId(null)}
        value={editingData}
        onChange={setEditingData}
        onSave={saveEditing}
        isYaml={isEditingYaml}
      />
    </div>
  );
};

export default DataMapper;
