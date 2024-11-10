"use client";

import { Dispatch, useCallback, useEffect } from "react";
import ReactFlow, { useNodesState, useEdgesState, Node } from "reactflow";

import "reactflow/dist/style.css";
import { Pipeline } from "../utils/types";
import { PipelineToNodes } from "../utils/pipeline2nodes";

const [initialNodes, initialEdges] = new PipelineToNodes({}).getNodes();

export default function Chart({
  pipeline,
  dispatch
}: {
  pipeline: Pipeline | undefined;
  dispatch: Dispatch<any>
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback((e: any, nodeContext: any) => {
    debugger;
    dispatch({ type: "NODE_CLICK", payload: nodeContext.data });
  }, [dispatch])

  useEffect(() => {
    const handleEsc = (event: any) => {
      if (event.key === 'Escape' || event.code === 'Escape') {
        dispatch({ type: "ESC" });
      }
    };

    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

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
        onNodeClick={onNodeClick}
      />
    </div>
  );
}
