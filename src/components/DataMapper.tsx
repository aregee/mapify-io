
import React, { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import Editor from "./Editor";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Format, SampleDataItem } from "@/types/data-mapper";
import { convertFormat, transformData } from "@/utils/format-converter";
import { SampleDataDropdown } from "./data-mapper/SampleDataDropdown";
import { SampleDataEditor } from "./data-mapper/SampleDataEditor";

const initialSamples: SampleDataItem[] = [
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
    }, null, 2)
  },
  {
    id: "2",
    name: "Product Catalog",
    data: JSON.stringify({
      products: [
        {
          id: "p1",
          name: "Laptop",
          price: 999.99,
          specs: {
            cpu: "Intel i7",
            ram: "16GB",
            storage: "512GB SSD"
          }
        },
        {
          id: "p2",
          name: "Smartphone",
          price: 699.99,
          specs: {
            screen: "6.5 inch",
            camera: "48MP",
            storage: "256GB"
          }
        }
      ]
    }, null, 2)
  }
];

interface DataMapperProps {
  apiUrl: string; // API URL to fetch data
}

const fetchMapping = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
};


const DataMapper:  React.FC<DataMapperProps>  = ({apiUrl}) => {
  const [mappingRules, setMappingRules] = useState("");
   const { data, isLoading, error } = useQuery({
    queryKey: ["mapping", apiUrl],
    queryFn: () => fetchMapping(apiUrl),
  });
  const [sampleDataList, setSampleDataList] = useState<SampleDataItem[]>(initialSamples);
  const [output, setOutput] = useState("");
  const [format, setFormat] = useState<Format>("yaml");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState(data);
  const [showOutput, setShowOutput] = useState(false);
  

  const handleFormatChange = (newFormat: Format) => {
    const converted = convertFormat(mappingRules, format, newFormat);
    setMappingRules(converted);
    setFormat(newFormat);
  };

  const handleTransform = (data: string) => {
    const transformed = transformData(data, format);
    setOutput(transformed);
    setShowOutput(true);
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
            <SampleDataDropdown
              sampleDataList={sampleDataList}
              onAddSample={addSampleData}
              onEdit={startEditing}
              onTransform={handleTransform}
              onDelete={deleteSampleData}
            />
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

      <SampleDataEditor
        isOpen={!!editingId}
        onOpenChange={(open) => !open && setEditingId(null)}
        value={editingData}
        onChange={setEditingData}
        onSave={saveEditing}
      />
    </div>
  );
};

export default DataMapper;
