"use client";

import { Dispatch, useCallback, useState } from "react";
import Editor, { OnChange, OnMount } from "@monaco-editor/react";
import { getParamsFromYAMLContent } from "azpp-common/parsers/templates/utils";
import { Action } from "@/store";

export default function YamlEditor({
  dispatch
}: {
  dispatch: Dispatch<Action>
}) {

  const [params, setParams] = useState("");
  
  const handleEditorChange = useCallback<OnChange>((value, event) => {
    if (!value) return;

    const p = getParamsFromYAMLContent(value.toString());
    dispatch({ type: "UPDATE_YAML", payload: { p, yaml: value.toString() } });
  }, []);

  const handleMount = useCallback<OnMount>(() => {
    console.log("mounted");
  }, []);

  const handleOpenClick = useCallback(async () => {
    try {
      const [fileHandle] = await (window as any).showOpenFilePicker({
        types: [
          {
            description: 'YAML files',
            accept: {
              'text/yaml': ['.yml', '.yaml']
            }
          }
        ]
      });
      
      const file = await fileHandle.getFile();
      const content = await file.text();
      
      setParams(content);
      const p = getParamsFromYAMLContent(content);
      
      dispatch({ type: "UPDATE_YAML", payload: { 
        p,
        yaml: content,
      }});
    } catch (err) {
      console.error('Error opening file:', err);
    }
  }, []);

  return (
    <>
      <div style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
        <h2>Editor (DevOps YAML)</h2>
        <a href="#" onClick={handleOpenClick}>Open</a>
      </div>
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
