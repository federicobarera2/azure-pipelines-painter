"use client";

import { useCallback, useMemo } from "react";
import { Pipeline } from "../utils/types";
import Editor, { OnChange, OnMount } from "@monaco-editor/react";

const pipeline: Pipeline = {
  stages: [
    {
      name: "stage1",
      jobs: [
        {
          name: "job1",
          steps: [
            {
              name: "step1",
              displayName: "Step 1",
              type: "shell",
            },
            {
              name: "step2",
              displayName: "Step 1",
              type: "shell",
            },
            {
              name: "step3",
              displayName: "Step 1",
              type: "shell",
            },
          ],
        },
      ],
    },
    {
      name: "stage2",
      jobs: [
        {
          name: "job1",
          steps: [
            {
              name: "step1",
              displayName: "Step 2",
              type: "shell",
            },
          ],
        },
      ],
    },
  ],
};

export default function PipelineEditor({
  onChange,
}: {
  onChange: (value: Pipeline | undefined) => void;
}) {
  const handleEditorChange = useCallback<OnChange>((value, event) => {
    console.log(value, event);

    value && onChange(JSON.parse(value) as Pipeline);
  }, []);

  const handleMount = useCallback<OnMount>(() => {
    onChange(pipeline);
  }, []);

  const initial = useMemo(() => JSON.stringify(pipeline, null, 2), []);

  return (
    <Editor
      defaultLanguage="json"
      defaultValue={initial}
      height="100%"
      theme="vs-dark"
      onChange={handleEditorChange}
      onMount={handleMount}
    />
  );
}
