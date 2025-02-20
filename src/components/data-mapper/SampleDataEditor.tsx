
import React from "react";
import { Button } from "@/components/ui/button";
import Editor from "@/components/Editor";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface SampleDataEditorProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
}

export const SampleDataEditor = ({
  isOpen,
  onOpenChange,
  value,
  onChange,
  onSave,
}: SampleDataEditorProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-[90vw] sm:max-w-[600px]">
        <SheetHeader>
          <SheetTitle>Edit Sample Data</SheetTitle>
          <SheetDescription>
            Make changes to your sample data below.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <Editor
            value={value}
            onChange={onChange}
            language="json"
            className="h-[60vh]"
          />
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
