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
  
  constructor(private pipeline: any) {}

  private grabObjectName(obj: any) {
    return Object.keys(obj)[0]
  }

  public getNodes(): [Node[], Edge[]] {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    let nodeCounter = 0;

    const processNodes = (
      items: any[],
      nodeType: 'stage' | 'job' | 'step',
      parentId: string | null,
      parentX: number
    ) => {
      items.forEach((item) => {
        nodeCounter++;
        const nodeId = `node-${nodeCounter}`;
        const currentY = nodeCounter * this.yOffset;
        
        if (item.template) {
          nodes.push({
            id: nodeId,
            position: { x: parentX + (nodeType === 'stage' ? 0 : this.xOffset), y: currentY },
            data: {
              label: 'Template',
              ...item
            },
            type: 'templateNode',
            style: { border: '1px dashed grey', boxShadow: "5px 5px 5px grey" }
          });

          // Process nested items
          if (item.value?.stages) {
            processNodes(item.value.stages, 'stage', nodeId, parentX);
          } else if (item.value?.jobs) {
            processNodes(item.value.jobs, 'job', nodeId, parentX);
          } else if (item.value?.steps) {
            processNodes(item.value.steps, 'step', nodeId, parentX);
          }
        } else {
          const nodeStyles: Record<string, any> = {
            stage: { border: "1px solid grey", boxShadow: "5px 5px 5px red" },
            job: { border: "1px solid grey", boxShadow: "5px 5px 5px blue" },
            step: {  border: "1px solid grey", boxShadow: "5px 5px 5px grey" }
          };

          nodes.push({
            id: nodeId,
            position: { x: parentX + (nodeType === 'stage' ? 0 : this.xOffset), y: currentY },
            data: { 
              label: item[nodeType] ?? this.grabObjectName(item) ?? "node",
              ...item
            },
            type: `${nodeType}Node`,
            style: nodeStyles[nodeType]
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

        // Process child nodes
        if (item.stages) {
          processNodes(item.stages, 'stage', nodeId, parentX + this.xOffset);
        } else if (item.jobs) {
          processNodes(item.jobs, 'job', nodeId, parentX + this.xOffset);
        } else if (item.steps) {
          processNodes(item.steps, 'step', nodeId, parentX + this.xOffset);
        }
        else
        {
          parentId = nodeId;
        }
      });
    };

    if (this.pipeline.stages) {
      processNodes(this.pipeline.stages, 'stage', null, this.baseX);
    }

    return [nodes, edges];
  }
}