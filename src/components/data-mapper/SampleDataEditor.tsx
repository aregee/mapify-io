
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Editor from "@/components/Editor";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { parse as yamlParse, stringify as yamlStringify } from 'yaml';
import { Format } from "@/types/data-mapper";
import { convertFormat } from "@/utils/format-converter";

interface SampleDataEditorProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  isYaml?: boolean;
  globalFormat?: Format;
}

export const SampleDataEditor = ({
  isOpen,
  onOpenChange,
  value,
  onChange,
  onSave,
  isYaml = false,
  globalFormat = "yaml"
}: SampleDataEditorProps) => {
  // Use the editor language based on whether the sample is YAML or the global format
  const editorLanguage: Format = isYaml ? "yaml" : globalFormat;
  
  // Convert the value to the correct format if needed when opening the editor
  useEffect(() => {
    if (isOpen && value) {
      // If the sample is not YAML but global format is YAML, convert JSON to YAML
      if (!isYaml && globalFormat === "yaml" && value) {
        try {
          const jsonData = JSON.parse(value);
          onChange(yamlStringify(jsonData));
        } catch (error) {
          console.error("Failed to convert JSON to YAML:", error);
        }
      }
      // If the sample is not JSON but global format is JSON, convert YAML to JSON
      else if (isYaml && globalFormat === "json" && value) {
        try {
          const jsonData = yamlParse(value);
          onChange(JSON.stringify(jsonData, null, 2));
        } catch (error) {
          console.error("Failed to convert YAML to JSON:", error);
        }
      }
    }
  }, [isOpen, globalFormat, isYaml, value]);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-[90vw] sm:max-w-[600px]">
        <SheetHeader>
          <SheetTitle>Edit Sample Data</SheetTitle>
          <SheetDescription>
            Make changes to your sample data below.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 flex flex-col h-[70vh]">
          <div className="flex-1 overflow-hidden">
            <Editor
              value={value}
              onChange={onChange}
              language={editorLanguage}
              height="100%"
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={onSave} size="sm">
              Save Changes
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
