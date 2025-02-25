
import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import CodeEditor from "./CodeEditor";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: "json" | "yaml";
  className?: string;
  readOnly?: boolean;
  height?: string;
}

const Editor: React.FC<EditorProps> = ({ 
  value, 
  onChange, 
  language = "yaml", 
  className,
  readOnly = false,
  height = "calc(100vh - 12rem)"
}) => {
  return (
    <div className={cn(
      "relative font-mono bg-editor-bg text-editor-text rounded-b-md overflow-hidden w-full h-full",
      className
    )}>
      <CodeEditor 
        initialValue={value} 
        onChange={onChange} 
        language={language}
        readOnly={readOnly}
        height={height}
      />
    </div>
  );
};

export default Editor;
