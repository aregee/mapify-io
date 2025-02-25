import React, { useState, useEffect, useCallback } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { yaml } from "@codemirror/lang-yaml";
import { githubDark } from "@uiw/codemirror-theme-github";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface CodeEditorProps {
  initialValue?: string;
  language?: "json" | "yaml";
  onChange?: (value: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  initialValue = "",
  language = "yaml",
  onChange,
}) => {
  const [value, setValue] = useState(initialValue);
  const [mode, setMode] = useState<"json" | "yaml">(language);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleChange = useCallback((val: string) => {
    setValue(val);
    onChange?.(val);
  }, [onChange]);

  return (
    <div className="flex flex-col gap-2">
      <CodeMirror
        value={value}
        height="300px"
        extensions={[mode === "json" ? json() : yaml()]}
        theme={githubDark}
        onChange={handleChange}
        basicSetup={{ highlightActiveLine: true, highlightSelectionMatches: true }}
      />
    </div>
  );
};

export default CodeEditor;
