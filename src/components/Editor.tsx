
import React from "react";
import { cn } from "@/lib/utils";
import CodeEditor from "./CodeEditor";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  className?: string;
  readOnly?: boolean;
}

const Editor: React.FC<EditorProps> = ({ 
  value, 
  onChange, 
  language, 
  className,
  readOnly = false
}) => {
  return (
    <div className={cn(
      "relative font-mono bg-editor-bg text-editor-text rounded-b-md overflow-hidden",
      className
    )}>
      <CodeEditor initialValue={value} onChange={onChange} />
    </div>
  );
};

export default Editor;
