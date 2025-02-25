
import React, { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import Editor from "./Editor";
import { X, Play, Save, History } from "lucide-react";
import { Format, SampleDataItem, TransformResponse, TransformMode } from "@/types/data-mapper";
import { convertFormat, transformData } from "@/utils/format-converter";
import { SampleDataDropdown } from "./data-mapper/SampleDataDropdown";
import { SampleDataEditor } from "./data-mapper/SampleDataEditor";
import { toast } from "./ui/use-toast";
import { parse as yamlParse, stringify as yamlStringify } from 'yaml';
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/config/constants";

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
  const navigate = useNavigate();
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
    if (newFormat === format) {
      return; // No need to convert if format is the same
    }

    try {
      // Convert the mapping rules
      const convertedRules = convertFormat(mappingRules, format, newFormat);
      setMappingRules(convertedRules);
      
      // Also convert the output if it exists
      if (output) {
        const convertedOutput = convertFormat(output, format, newFormat);
        setOutput(convertedOutput);
      }
      
      // Set the new format
      setFormat(newFormat);
      
      // Show success toast
      toast({
        title: `Format changed to ${newFormat.toUpperCase()}`,
        description: "Content successfully converted to the new format."
      });
    } catch (error) {
      console.error("Format conversion error:", error);
      toast({
        title: "Format conversion failed",
        description: "Failed to convert between formats. Keeping original format.",
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
      // Prepare the mapping data for saving
      const updatedMapping = {
        content: {
          yaml: mappingRules,
          tags: mappingData.content.tags || [],
          test_data: mappingData.content.test_data || []
        }
      };

      const response = await fetch(`${baseUrl}/mappings/${mappingData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedMapping),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText}`);
      }

      const result = await response.json();
      
      // Update the mapping data state with the new data
      setMappingData({
        ...mappingData,
        content: {
          ...mappingData.content,
          yaml: mappingRules
        },
        updated_at: new Date().toISOString()
      });

      toast({
        title: "Save successful",
        description: "Mapping configuration has been saved.",
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

  const viewMappingHistory = () => {
    if (mappingData?.id) {
      navigate(ROUTES.MAPPING_HISTORY(mappingData.id));
    }
  };

  const handleEditSampleData = (id: string, data: string, isYaml: boolean) => {
    setEditingId(id);
    setEditingData(data);
    setIsEditingYaml(isYaml);
  };

  const handleSaveSampleData = (data: string, isYaml: boolean, name?: string) => {
    if (!editingId) return;
    
    setSampleDataList(prevList => 
      prevList.map(item => 
        item.id === editingId 
          ? { ...item, data, isYaml, name: name || item.name } 
          : item
      )
    );
    setEditingId(null);
    setEditingData("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingData("");
  };
  
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          {mappingData ? mappingData.title : "Data Mapper"}
        </h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={viewMappingHistory}
            disabled={!mappingData?.id}
          >
            <History className="mr-2 h-4 w-4" />
            History
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={saveMapping}
            disabled={saveLoading || !mappingData}
          >
            {saveLoading ? "Saving..." : "Save"}
            <Save className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card className="rounded-md border shadow-md flex flex-col h-96">
          <div className="flex items-center justify-between p-2 border-b">
            <div className="text-sm font-medium">Mapping Rules</div>
            <Tabs value={format} onValueChange={(v) => handleFormatChange(v as Format)}>
              <TabsList className="h-8">
                <TabsTrigger value="yaml" className="text-xs">YAML</TabsTrigger>
                <TabsTrigger value="json" className="text-xs">JSON</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex-1 w-full overflow-auto">
            <Editor
              value={mappingRules}
              onChange={setMappingRules}
              language={format}
            />
          </div>
        </Card>

        <Card className="rounded-md border shadow-md flex flex-col h-96">
          <div className="flex items-center justify-between p-2 border-b">
            <div className="flex items-center">
              <div className="text-sm font-medium">Input Data</div>
              <div className="ml-2">
                <SampleDataDropdown 
                  samples={sampleDataList} 
                  onEdit={handleEditSampleData}
                  onSelect={(sample) => {
                    handleTransform(sample.data, sample.isYaml);
                  }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Tabs value={transformMode} onValueChange={(v) => setTransformMode(v as TransformMode)}>
                <TabsList className="h-8">
                  <TabsTrigger value="test" className="text-xs">Test</TabsTrigger>
                  <TabsTrigger value="apply" className="text-xs" disabled={!mappingData?.id}>Apply</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          <div className="flex-1 w-full overflow-auto">
            {editingId ? (
              <SampleDataEditor
                data={editingData}
                isYaml={isEditingYaml}
                onSave={handleSaveSampleData}
                onCancel={handleCancelEdit}
                allowRename
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 italic p-4">
                <p>Select a sample from the dropdown or click Transform to test the mapping rules.</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card className={`rounded-md border shadow-md transition-all duration-300 ease-in-out overflow-hidden ${showOutput ? 'h-96' : 'h-12'}`}>
        <div className="flex items-center justify-between p-2 border-b">
          <div className="text-sm font-medium">Output</div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setShowOutput(!showOutput)}
          >
            {showOutput ? <X className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        </div>
        {showOutput && (
          <div className="flex-1 w-full h-[calc(100%-36px)] overflow-auto">
            <Editor
              value={output}
              onChange={setOutput}
              language={format}
              readOnly
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default DataMapper;
