
import React, { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "./ui/use-toast";
import Editor from "./Editor";
import { json as jsonFormat } from 'js-beautify';
import { parse as yamlParse, stringify as yamlStringify } from 'yaml';
import { Play, PenLine, Plus, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [showOutput, setShowOutput] = useState(false);

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
      setShowOutput(true);
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Plus className="h-4 w-4 mr-1" />
                  Samples ({sampleDataList.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Sample Data</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {sampleDataList.map(item => (
                  <DropdownMenuItem key={item.id} className="flex justify-between">
                    <span>{item.name}</span>
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => startEditing(item)}
                      >
                        <PenLine className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => handleTransform(item.data)}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        onClick={() => deleteSampleData(item.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={addSampleData}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add New Sample
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Tabs value={format} onValueChange={handleFormatChange as any}>
              <TabsList className="h-8">
                <TabsTrigger value="yaml" className="text-xs">YAML</TabsTrigger>
                <TabsTrigger value="json" className="text-xs">JSON</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 flex-1">
        <div className="grid gap-6" style={{ 
          gridTemplateColumns: showOutput ? "1fr 400px" : "1fr",
          transition: "grid-template-columns 0.3s ease-in-out"
        }}>
          <Card className="rounded-md border shadow-md">
            <div className="flex items-center justify-between p-2 border-b">
              <div className="text-sm font-medium">Mapping Rules</div>
            </div>
            <Editor
              value={mappingRules}
              onChange={setMappingRules}
              language={format}
              className="min-h-[calc(100vh-12rem)]"
            />
          </Card>

          {showOutput && (
            <Card className="rounded-md border shadow-md">
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
              <Editor
                value={output}
                onChange={setOutput}
                language={format}
                className="min-h-[calc(100vh-12rem)]"
                readOnly
              />
            </Card>
          )}
        </div>
      </div>

      {editingId && (
        <Sheet open={!!editingId} onOpenChange={(open) => !open && setEditingId(null)}>
          <SheetContent className="w-[90vw] sm:max-w-[600px]">
            <SheetHeader>
              <SheetTitle>Edit Sample Data</SheetTitle>
              <SheetDescription>
                Make changes to your sample data below.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <Editor
                value={editingData}
                onChange={setEditingData}
                language="json"
                className="h-[60vh]"
              />
              <div className="mt-4 flex justify-end">
                <Button 
                  onClick={saveEditing}
                  size="sm"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};

export default DataMapper;
