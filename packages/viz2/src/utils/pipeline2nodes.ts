import { Pipeline } from "./types";
import {
  Edge,
  Node,
} from "reactflow";
export class PipelineToNodes {
  constructor(private pipeline: Pipeline) {

  }

  private baseX = 50;
  private currentY = 0;

  public getNodes(): [Node[], Edge[]] {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    const stages = this.pipeline.stages || [{
      name: "Single Computed Stage",
    }];
    
    
    stages.forEach((stage, stageIndex) => {
      const stageName = stage.name || `Stage ${stageIndex}`;
      const stageId = `${stageIndex}`;
      
      nodes.push({
        id: stageId,
        data: {
          label: stageName
        },
        type: "stage",
        position: {
          x: this.baseX,
          y: (this.currentY += 100),
        },
      });

      const jobs = stage.jobs || [];
      
      jobs.forEach((job, jobIndex) => {
        const jobName = job.name || `Job ${jobIndex}`;
        const jobId = `${stageId}-${jobIndex}`;
        
        nodes.push({
          id: jobId,
          data: {
            label: jobName,
          },
          type: "job",
          position: {
            x: (this.baseX * 2),
            y: (this.currentY += 100),
          },
        });

        edges.push({
          id: `${stageId}-${jobId}`,
          source: stageId,
          target: jobId,
          type: "smoothstep",
          animated: true,
        });
        
        const steps = job.steps || [];
        
        let currentStepId: string | undefined = undefined;
        
        steps.forEach((step, stepIndex) => {
          const stepName = step.name || `Step ${stepIndex}`;
          const stepId = `${stageId}-${jobId}-${stepIndex}`;

          nodes.push({
            id: stepId,
            data: {
              label: stepName,
            },
            type: "step",
            position: {
              x: (this.baseX * 3),
              y: (this.currentY += 100),
            },
          });

          edges.push({
            id: `${jobId}-${stepId}`,
            source: currentStepId ?? jobId,
            target: stepId,
            type: "smoothstep",
            animated: true,
          });

          currentStepId = stepId;
        });
      });
    });
    return [nodes, edges];
  }
}