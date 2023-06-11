"use client";

import { useCallback } from "react";
import Editor, { OnChange, OnMount } from "@monaco-editor/react";
import { getParamsFromYAMLContent } from "azpp-common/parsers/templates/utils";
import { TemplateParameter } from "../utils/types";

export default function YamlEditor({
  onChange,
}: {
  onChange: (p: TemplateParameter[], yaml: string) => void;
}) {
  const handleEditorChange = useCallback<OnChange>((value, event) => {
    if (!value) return;

    const p = getParamsFromYAMLContent(value.toString());
    onChange(p, value.toString());
  }, []);

  const handleMount = useCallback<OnMount>(() => {
    console.log("mounted");
  }, []);

  return (
    <Editor
      defaultLanguage="yaml"
      height="100%"
      theme="vs-dark"
      onChange={handleEditorChange}
      onMount={handleMount}
    />
  );
}
