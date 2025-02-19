
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
      // For now, we'll just format the output
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
    <div className="container mx-auto p-4 min-h-screen animate-fade-in">
      <div className="space-y-4">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-semibold mb-2">Data Mapper</h1>
          <p className="text-muted-foreground">Transform your data with ease</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Mapping Rules</h2>
              <Tabs value={format} onValueChange={handleFormatChange as any}>
                <TabsList>
                  <TabsTrigger value="yaml">YAML</TabsTrigger>
                  <TabsTrigger value="json">JSON</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <Editor
              value={mappingRules}
              onChange={setMappingRules}
              language={format}
              className="h-[400px]"
            />
          </Card>

          <div className="space-y-4">
            <Card className="p-4">
              <h2 className="text-xl font-semibold mb-4">Sample Data</h2>
              <Editor
                value={sampleData}
                onChange={setSampleData}
                language="json"
                className="h-[180px]"
              />
            </Card>

            <Card className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Output</h2>
                <Button onClick={handleTransform}>Transform</Button>
              </div>
              <Editor
                value={output}
                onChange={setOutput}
                language={format}
                className="h-[180px]"
                readOnly
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataMapper;
