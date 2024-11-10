import { Pipeline } from "./types";
import {
  Edge,
  Node,
} from "reactflow";
export class PipelineToNodes {
  private baseX = 50;
  private baseY = 50;
  private xOffset = 200;
  private yOffset = 80;
  private nodeCounter = 0;

  constructor(private pipeline: any) {}

  // Add a helper method to calculate total height of a branch
  private calculateBranchHeight(item: any): number {
    let height = 1; // Count current item
    if (item.jobs) {
      item.jobs.forEach((job: any) => {
        height += job.steps ? job.steps.length : 1;
      });
    }
    if (item.value?.stages) {
      height += item.value.stages.reduce((acc: number, stage: any) => 
        acc + this.calculateBranchHeight(stage), 0);
    }
    return height;
  }

  public getNodes(): [Node[], Edge[]] {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const processSteps = (steps: any[], parentId: string | null, parentX: number, parentY: number) => {
      steps.forEach((step, index) => {
        this.nodeCounter++;
        const nodeId = `node-${this.nodeCounter}`;
        const currentY = this.nodeCounter * this.yOffset;
        
        if (step.template) {
          // Template node for steps
          nodes.push({
            id: nodeId,
            position: {
              x: parentX + this.xOffset,
              y: currentY
            },
            data: {
              label: 'Template',
              ...step
            },
            type: 'templateNode'
          });

          if (step.value?.steps) {
            processSteps(step.value.steps, nodeId, parentX + this.xOffset, currentY);
          }
        } else {
          nodes.push({
            id: nodeId,
            position: {
              x: parentX + this.xOffset,
              y: currentY
            },
            data: { 
              label: step.script || 'Step',
              ...step
            },
            type: 'stepNode'
          });
        }

        if (parentId) {
          edges.push({
            id: `edge-${parentId}-${nodeId}`,
            source: parentId,
            target: nodeId,
            type: 'smoothstep'
          });
        }
      });
    };

    const processJobs = (jobs: any[], parentId: string | null, parentX: number, parentY: number) => {
      jobs.forEach((job, index) => {
        this.nodeCounter++;
        const nodeId = `node-${this.nodeCounter}`;
        const currentY = this.nodeCounter * this.yOffset;
        
        if (job.template) {
          // Template node for jobs
          nodes.push({
            id: nodeId,
            position: {
              x: parentX + this.xOffset,
              y: currentY
            },
            data: {
              label: 'Template',
              ...job
            },
            type: 'templateNode'
          });

          if (job.value?.jobs) {
            processJobs(job.value.jobs, nodeId, parentX + this.xOffset, currentY);
          }
        } else {
          nodes.push({
            id: nodeId,
            position: {
              x: parentX + this.xOffset,
              y: currentY
            },
            data: { 
              label: job.job || 'Job',
              ...job
            },
            type: 'jobNode'
          });
        }

        if (parentId) {
          edges.push({
            id: `edge-${parentId}-${nodeId}`,
            source: parentId,
            target: nodeId,
            type: 'smoothstep'
          });
        }

        if (job.steps) {
          processSteps(job.steps, nodeId, parentX + this.xOffset, currentY);
        }
      });
    };

    const processStages = (stages: any[], parentId: string | null = null, parentX: number = this.baseX, parentY: number = this.baseY) => {
      stages.forEach((stage, index) => {
        this.nodeCounter++;
        const nodeId = `node-${this.nodeCounter}`;
        const currentY = this.nodeCounter * this.yOffset;
        
        if (stage.template) {
          // Template node for stages
          nodes.push({
            id: nodeId,
            position: {
              x: parentX,
              y: currentY
            },
            data: {
              label: 'Template',
              ...stage
            },
            type: 'templateNode'
          });

          if (stage.value?.stages) {
            processStages(stage.value.stages, nodeId, parentX + this.xOffset, currentY);
          }
        } else {
          nodes.push({
            id: nodeId,
            position: {
              x: parentX,
              y: currentY
            },
            data: { 
              label: stage.stage || 'Stage',
              ...stage
            },
            type: 'stageNode'
          });
        }

        if (parentId) {
          edges.push({
            id: `edge-${parentId}-${nodeId}`,
            source: parentId,
            target: nodeId,
            type: 'smoothstep'
          });
        }

        if (stage.jobs) {
          processJobs(stage.jobs, nodeId, parentX, currentY);
        }
      });
    };

    if (this.pipeline.stages) {
      processStages(this.pipeline.stages);
    }

    return [nodes, edges];
  }
}