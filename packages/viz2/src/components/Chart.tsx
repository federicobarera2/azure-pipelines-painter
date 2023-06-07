"use client";

import { useEffect } from "react";
import ReactFlow, { useNodesState, useEdgesState } from "reactflow";

import "reactflow/dist/style.css";
import { Pipeline } from "../utils/types";
import { PipelineToNodes } from "../utils/pipeline2nodes";

const [initialNodes, initialEdges] = new PipelineToNodes({}).getNodes();

export default function Chart({
  pipeline,
}: {
  pipeline: Pipeline | undefined;
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    const [initialNodes, initialEdges] = new PipelineToNodes(
      pipeline ?? {}
    ).getNodes();

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [pipeline]);

  return (
    <div style={{ width: "auto", height: "100vh" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
      />
    </div>
  );
}
