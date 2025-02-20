
import React, { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "./ui/use-toast";
import Editor from "./Editor";
import { json as jsonFormat, yaml as yamlFormat } from 'js-beautify';
import { json2yaml, yaml2json } from 'yaml-js';

type Format = "json" | "yaml";

const DataMapper = () => {
  const [mappingRules, setMappingRules] = useState("");
  const [sampleData, setSampleData] = useState("");
  const [output, setOutput] = useState("");
  const [format, setFormat] = useState<Format>("yaml");

  const handleFormatChange = (newFormat: Format) => {
    try {
      if (format === "yaml" && newFormat === "json") {
        const jsonData = yaml2json(mappingRules);
        setMappingRules(jsonFormat(jsonData));
      } else if (format === "json" && newFormat === "yaml") {
        const jsonData = JSON.parse(mappingRules);
        setMappingRules(json2yaml(jsonData));
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

  const handleTransform = () => {
    try {
      // TODO: Implement actual transformation logic
      const formattedOutput = format === "json" 
        ? jsonFormat(sampleData)
        : json2yaml(JSON.parse(sampleData));
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
            </div>
            <Editor
              value={sampleData}
              onChange={setSampleData}
              language="json"
              className="h-[250px]"
            />
          </Card>

          <Card className="rounded-md border shadow-md">
            <div className="flex items-center justify-between p-2 border-b">
              <div className="text-sm font-medium">Output</div>
              <Button 
                onClick={handleTransform}
                size="sm"
                className="h-7 px-3 text-xs"
              >
                Transform
              </Button>
            </div>
            <Editor
              value={output}
              onChange={setOutput}
              language={format}
              className="h-[250px]"
              readOnly
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DataMapper;
