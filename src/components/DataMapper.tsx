
import React, { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "./ui/use-toast";
import Editor from "./Editor";
import { json as jsonFormat } from 'js-beautify';
import { parse as yamlParse, stringify as yamlStringify } from 'yaml';
import { Play, PenLine, Plus, X } from "lucide-react";

type Format = "json" | "yaml";

interface SampleDataItem {
  id: string;
  name: string;
  data: string;
}

const DataMapper = () => {
  const [mappingRules, setMappingRules] = useState("");
  const [sampleDataList, setSampleDataList] = useState<SampleDataItem[]>([]);
  const [output, setOutput] = useState("");
  const [format, setFormat] = useState<Format>("yaml");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState("");

  const handleFormatChange = (newFormat: Format) => {
    try {
      if (format === "yaml" && newFormat === "json") {
        const jsonData = yamlParse(mappingRules);
        setMappingRules(jsonFormat(JSON.stringify(jsonData)));
      } else if (format === "json" && newFormat === "yaml") {
        const jsonData = JSON.parse(mappingRules);
        setMappingRules(yamlStringify(jsonData));
      }
      setFormat(newFormat);
    } catch (error) {
      toast({
        title: "Format conversion failed",
        description: "Please ensure your input is valid " + format.toUpperCase(),
        variant: "destructive",
      });
    }
  };

  const handleTransform = (data: string) => {
    try {
      const formattedOutput = format === "json" 
        ? jsonFormat(data)
        : yamlStringify(JSON.parse(data));
      setOutput(formattedOutput);
      toast({
        title: "Transformation successful",
        description: "Your data has been transformed according to the mapping rules.",
      });
    } catch (error) {
      toast({
        title: "Transformation failed",
        description: "Please check your mapping rules and sample data.",
        variant: "destructive",
      });
    }
  };

  const addSampleData = () => {
    const newItem: SampleDataItem = {
      id: Date.now().toString(),
      name: `Sample Data ${sampleDataList.length + 1}`,
      data: ""
    };
    setSampleDataList([...sampleDataList, newItem]);
    setEditingId(newItem.id);
    setEditingData("");
  };

  const deleteSampleData = (id: string) => {
    setSampleDataList(sampleDataList.filter(item => item.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditingData("");
    }
  };

  const startEditing = (item: SampleDataItem) => {
    setEditingId(item.id);
    setEditingData(item.data);
  };

  const saveEditing = () => {
    if (editingId) {
      setSampleDataList(sampleDataList.map(item => 
        item.id === editingId ? { ...item, data: editingData } : item
      ));
      setEditingId(null);
      setEditingData("");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background animate-fade-in">
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="mr-4 hidden md:flex">
            <h1 className="text-xl font-semibold">Data Mapper</h1>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <Tabs value={format} onValueChange={handleFormatChange as any}>
              <TabsList className="h-9">
                <TabsTrigger value="yaml" className="text-xs">YAML</TabsTrigger>
                <TabsTrigger value="json" className="text-xs">JSON</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 flex-1 items-start md:grid md:grid-cols-[1fr_400px] md:gap-6 lg:grid-cols-[1fr_450px]">
        <div className="relative">
          <Card className="rounded-md border shadow-md">
            <div className="flex items-center justify-between p-2 border-b">
              <div className="text-sm font-medium">Mapping Rules</div>
            </div>
            <Editor
              value={mappingRules}
              onChange={setMappingRules}
              language={format}
              className="min-h-[600px]"
            />
          </Card>
        </div>

        <div className="flex flex-col space-y-4">
          <Card className="rounded-md border shadow-md">
            <div className="flex items-center justify-between p-2 border-b">
              <div className="text-sm font-medium">Sample Data</div>
              <Button 
                onClick={addSampleData}
                size="sm"
                variant="ghost"
                className="h-7 px-3 text-xs"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Sample
              </Button>
            </div>
            <div className="p-2 space-y-2">
              {sampleDataList.map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                  <span className="text-sm font-medium">{item.name}</span>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => startEditing(item)}
                    >
                      <PenLine className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => handleTransform(item.data)}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={() => deleteSampleData(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {sampleDataList.length === 0 && (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  No sample data yet. Click "Add Sample" to create one.
                </div>
              )}
            </div>
          </Card>

          {editingId && (
            <Card className="rounded-md border shadow-md">
              <div className="flex items-center justify-between p-2 border-b">
                <div className="text-sm font-medium">Edit Sample Data</div>
                <Button 
                  onClick={saveEditing}
                  size="sm"
                  className="h-7 px-3 text-xs"
                >
                  Save
                </Button>
              </div>
              <Editor
                value={editingData}
                onChange={setEditingData}
                language="json"
                className="h-[200px]"
              />
            </Card>
          )}

          <Card className="rounded-md border shadow-md">
            <div className="flex items-center justify-between p-2 border-b">
              <div className="text-sm font-medium">Output</div>
            </div>
            <Editor
              value={output}
              onChange={setOutput}
              language={format}
              className="h-[200px]"
              readOnly
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DataMapper;
