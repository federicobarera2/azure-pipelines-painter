"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import Chart from "../components/Chart";
import PipelineEditor from "../components/PipelineEditor";
import YamlEditor from "@/components/YamlEditor";
import { initialState, reducer } from "@/store";
import { TemplateParameter } from "../utils/types";
import ParamsEditor from "@/components/ParamsEditor";
import { parsePipeline } from "@/actions/pipelines";

export default function Home() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const onContextChange = useCallback((context: any) => {
    dispatch({ type: "UPDATE_CONTEXT", payload: context });
  }, []);

  useEffect(() => {
    const action = async () => {
      if (state.context === undefined || state.yaml === undefined) return;
      const pipeline = await parsePipeline(state.context, state.yaml);

      dispatch({ type: "UPDATE_PIPELINE", payload: pipeline });
    };
    action();
  }, [state.context, state.yaml]);

  return (
    <>
      <div className="grid grid-cols-2">
        <div className="h-screen">
          <div className="h-4/6 border-2 resize-y overflow-hidden">
            <Chart dispatch={dispatch} pipeline={state.pipeline} />
          </div>
          <div className="h-full border-2">
            <h2>Rendered (Pure YAML - Readonly)</h2>
            <PipelineEditor pipeline={state.renderYaml } />
          </div>
        </div>
        <div className="h-screen">
          <div className="h-4/6 border-2 resize-y overflow-hidden">
            <YamlEditor dispatch={dispatch} />
          </div>
          <div className="h-full border-2 overflow-hidden">
            <ParamsEditor
              p={state.context}
              yaml={state.yaml}
              onChange={onContextChange}
            />
          </div>
          {/* <TemplateOpen /> */}
        </div>
      </div>
    </>
  );
}
