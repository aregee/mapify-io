
import React, { useState, useEffect, useCallback } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { yaml } from "@codemirror/lang-yaml";
import { githubDark } from "@uiw/codemirror-theme-github";
import { EditorView } from "@codemirror/view";

interface CodeEditorProps {
  initialValue?: string;
  language?: "json" | "yaml";
  onChange?: (value: string) => void;
  readOnly?: boolean;
  height?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  initialValue = "",
  language = "yaml",
  onChange,
  readOnly = false,
  height = "100%",
}) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleChange = useCallback((val: string) => {
    setValue(val);
    onChange?.(val);
  }, [onChange]);

  return (
    <div className="w-full h-full">
      <CodeMirror
        value={value}
        height={height}
        width="100%"
        extensions={[
          language === "json" ? json() : yaml(),
          EditorView.lineWrapping,
        ]}
        theme={githubDark}
        onChange={handleChange}
        readOnly={readOnly}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          foldGutter: true,
        }}
        style={{
          fontSize: "14px",
          width: "100%",
          height: "100%",
          overflow: "auto",
        }}
      />
    </div>
  );
};

export default CodeEditor;
