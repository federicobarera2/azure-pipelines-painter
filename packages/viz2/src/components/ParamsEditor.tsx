"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pipeline } from "../utils/types";
import Editor, { OnChange, OnMount } from "@monaco-editor/react";
import YAML from "yaml";

export default function ParamsEditor({
  p,
  yaml,
  onChange,
}: {
  p: any;
  yaml?: string;
  onChange: (p: any[]) => void;
}) {
  const initalState = useMemo(() => YAML.stringify(p), []);
  const [params, setParams] = useState(initalState);

  useEffect(() => {
    console.log(p);
    setParams(YAML.stringify(p));
  }, [yaml]);

  const handleEditorChange = useCallback<OnChange>((value) => {
    if (!value) return;

    const parsedContext = YAML.parse(value.toString());
    if (!parsedContext) {
      console.error("invalid yaml");
      return;
    }

    onChange(parsedContext);
  }, []);

  const handleMount = useCallback<OnMount>(() => {
    console.log("params editor mounted");
  }, []);

  return (
    <>
      <h2>Params</h2>
      <Editor
        value={params}
        defaultLanguage="yaml"
        height="100%"
        theme="vs-dark"
        onChange={handleEditorChange}
        onMount={handleMount}
      />
    </>
    
  );
}
