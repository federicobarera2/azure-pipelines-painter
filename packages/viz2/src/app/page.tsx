"use client";

import { useState } from "react";
import Chart from "../components/Chart";
import PipelineEditor from "../components/PipelineEditor";
import TemplateOpen from "../components/TemplateOpen";

import { Pipeline } from "../utils/types";

export default function Home() {
  const [pipeline, setPipeline] = useState<Pipeline>();

  return (
    <>
      <div className="grid grid-cols-2">
        <div>
          <Chart pipeline={pipeline} />
        </div>
        <div>
          <TemplateOpen />
          <PipelineEditor onChange={setPipeline} />
        </div>
      </div>
    </>
  );
}
