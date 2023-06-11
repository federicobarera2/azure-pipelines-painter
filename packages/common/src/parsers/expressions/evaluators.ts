import { get } from "lodash";

import {
  IFlowTokenNode,
  isFlowNode,
  isFunctionNode,
  isPropertyNode,
  isValueNode,
} from "./nodes";

import { IVisitable, IVisitor } from "../common/visitor";

export class ExpressionEvaluator implements IVisitor {
  private stack: any[];
  private context: any;

  constructor(context: any) {
    this.stack = [];
    this.context = context;
  }

  visit(node: IVisitable): void {
    if (isValueNode(node)) {
      this.stack.push(node.value);
    } else if (isPropertyNode(node)) {
      this.stack.push(this.evaluateProperty(node.name));
    } else if (isFunctionNode(node)) {
      const args = this.stack.splice(-node.arguments.length);
      this.stack.push(this.evaluateFunction(node.operator, args));
    } else if (isFlowNode(node)) {
      this.evaluateFlowNode(node);
    }
  }

  start_visit(node: IVisitable): void {}
  end_visit(): void {}

  private evaluateProperty(prop: string) {
    return get(this.context, prop);
  }

  private evaluateFunction(operator: string, args: any[]): any {
    switch (operator) {
      case "add":
        return args.reduce((a, b) => a + b);
      case "sub":
        return args.reduce((a, b) => a - b);
      case "mul":
        return args.reduce((a, b) => a * b);
      case "div":
        return args.reduce((a, b) => a / b);
      case "eq":
        return args.reduce((a, b) => a === b);
      case "ne":
        return args.reduce((a, b) => a !== b);
      case "not":
        return !args[0];
      case "or":
        return args.reduce((a, b) => a | b);
      case "and":
        return args.reduce((a, b) => a & b);
      case "in":
        const [v, ...rest] = args;
        return rest.includes(v);
      case "notIn":
        const [v2, ...rest2] = args;
        return !rest2.includes(v2);
      case "coalesce":
        return args.find((a) => a !== undefined);
      default:
        throw new Error(`Unknown function operator: ${operator}`);
    }
  }

  /**
   * This method is for flow tokens, not for real flow nodes.
   * It simply pushes the condition to the stack.
   * */
  private evaluateFlowNode(node: IFlowTokenNode) {
    const condition = this.stack.pop();
    this.stack.push(condition);
  }

  // private evaluateFlowNode(node: IRealFlowNode): void {
  //   const falseBranch = this.stack.pop();
  //   const trueBranch = this.stack.pop();
  //   const condition = this.stack.pop();

  //   const result = condition ? trueBranch : falseBranch;
  //   this.stack.push(result);
  // }

  getResult(): any {
    if (this.stack.length !== 1) {
      throw new Error("Invalid expression");
    }
    return this.stack[0];
  }
}

export class FlowchartVisitor implements IVisitor {
  private flowchart: string = "";
  private indentLevel: number = 0;

  visit(node: IVisitable): void {
    if (isValueNode(node)) {
      this.addFlowchartStep(`Value: ${node.value}`);
    } else if (isPropertyNode(node)) {
      this.addFlowchartStep(`Property: ${node.name}`);
    } else if (isFunctionNode(node)) {
      this.addFlowchartStep(`Function: ${node.operator}`);
    } else if (isFlowNode(node)) {
      this.addFlowchartStep(`Flow: ${node.flow} - ${node.body}`);
    }
  }

  start_visit(node: IVisitable): void {
    this.indentLevel++;
  }

  end_visit(): void {
    this.indentLevel--;
  }

  private addFlowchartStep(step: string): void {
    const indentation = "  ".repeat(this.indentLevel);
    this.flowchart = `${indentation}- ${step}\n` + this.flowchart;
  }

  public getResult(): string {
    return this.flowchart;
  }
}
