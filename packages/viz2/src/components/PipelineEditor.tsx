"use client";

import { useCallback, useEffect, useState } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import YAML from "yaml";

export default function PipelineEditor({ pipeline }: { pipeline?: any }) {
  const [value, setState] = useState<any>();

  const handleMount = useCallback<OnMount>(() => {
    console.log("pipeline editor mounted");
  }, []);

  useEffect(() => {
    if (!pipeline) return;
    setState(YAML.stringify(pipeline));
  }, [pipeline]);

  return (
    <Editor
      value={value}
      defaultLanguage="yaml"
      height="100%"
      theme="vs-dark"
      options={{ readOnly: true }}
      onMount={handleMount}
    />
  );
}
