
import React from "react";
import { cn } from "@/lib/utils";

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
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full p-4 bg-transparent resize-none focus:outline-none selection:bg-muted/30"
        spellCheck="false"
        readOnly={readOnly}
        placeholder={`Enter your ${language.toUpperCase()} here...`}
      />
    </div>
  );
};

export default Editor;
