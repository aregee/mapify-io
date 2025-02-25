
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

interface SampleDataEditorProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  isYaml?: boolean;
}

export const SampleDataEditor = ({
  isOpen,
  onOpenChange,
  value,
  onChange,
  onSave,
  isYaml = false
}: SampleDataEditorProps) => {
  const [editorLanguage, setEditorLanguage] = useState<Format>(isYaml ? "yaml" : "json");
  
  useEffect(() => {
    setEditorLanguage(isYaml ? "yaml" : "json");
  }, [isYaml]);

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
