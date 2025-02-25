
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Editor from "@/components/Editor";
import { Format } from "@/types/data-mapper";
import { parse as yamlParse, stringify as yamlStringify } from 'yaml';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SampleDataEditorProps {
  data: string;
  isYaml: boolean;
  onSave: (data: string, isYaml: boolean, name?: string) => void;
  onCancel: () => void;
  allowRename?: boolean;
}

export const SampleDataEditor: React.FC<SampleDataEditorProps> = ({
  data,
  isYaml,
  onSave,
  onCancel,
  allowRename = false
}) => {
  const [editedData, setEditedData] = useState(data);
  const [editedIsYaml, setEditedIsYaml] = useState(isYaml);
  const [name, setName] = useState("");
  
  const handleSave = () => {
    onSave(editedData, editedIsYaml, allowRename ? name : undefined);
  };
  
  return (
    <div className="flex flex-col h-full">
      {allowRename && (
        <div className="p-3 border-b">
          <Label htmlFor="sample-name" className="text-xs mb-1 block">Sample Name</Label>
          <Input 
            id="sample-name"
            placeholder="Enter sample name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
      )}
      <div className="flex-1 overflow-auto">
        <Editor
          value={editedData}
          onChange={setEditedData}
          language={editedIsYaml ? "yaml" : "json"}
          height="100%"
        />
      </div>
      <div className="flex justify-end gap-2 p-2 border-t">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );
};
