import { IVisitable, IVisitor } from "../common/visitor";
import { FlowType } from "./types";


export interface IOperatorNode extends IVisitable {
  operator: string;
  first: IVisitable;
  second: IVisitable;
}

type Switch = "and" | "or";
export interface ILogicalNode extends IOperatorNode {
  operator: Switch;
}

export interface IFlowTokenNode extends IVisitable {
  flow: FlowType;
  condition?: IVisitable;
}

export function isFlowNode(node: IVisitable): node is IFlowTokenNode {
  return "flow" in node && "condition" in node;
}

export interface IFunctionNode extends IVisitable {
  operator: string;
  arguments: IVisitable[];
}

export function isFunctionNode(node: IVisitable): node is IFunctionNode {
  return "operator" in node && "arguments" in node;
}

export interface IValueNode {
  value: any;
}

export function isValueNode(node: any): node is IValueNode {
  return Object.keys(node).includes("value");
}

export interface IPropertyNode {
  name: string;
}

export function isPropertyNode(node: any): node is IPropertyNode {
  return Object.keys(node).includes("name");
}

export class PropertyNode implements IVisitable, IPropertyNode {
  public name: string;

  constructor(name: string) {
    this.name = name;
  }

  accept(visitor: IVisitor) {
    visitor.start_visit(this);
    visitor.visit(this);
    visitor.end_visit();
  }
}

export class FunctionNode implements IVisitable, IFunctionNode {
  operator: string;
  arguments: IVisitable[] = [];

  constructor(operator: string) {
    this.operator = operator;
  }

  accept(visitor: IVisitor): void {
    visitor.start_visit(this);
    for (const argument of this.arguments) {
      argument.accept(visitor);
    }

    visitor.visit(this);
    visitor.end_visit();
  }
}

export class ValueNode implements IVisitable, IValueNode {
  value: any;

  constructor(value: any) {
    this.value = value;
  }

  accept(visitor: IVisitor): void {
    visitor.start_visit(this);
    visitor.visit(this);
    visitor.end_visit();
  }
}

export class FlowTokenNode implements IVisitable, IFlowTokenNode {
  flow: FlowType;
  condition: IVisitable | undefined;

  constructor(flow: FlowType, condition?: IVisitable) {
    this.flow = flow;
    this.condition = condition;
  }

  accept(visitor: IVisitor): void {
    visitor.start_visit(this);
    this.condition?.accept(visitor);
    visitor.visit(this);
    visitor.end_visit();
  }
}

/**
 * This interface will be useful in case we will need to evaluate control flow in the expression itself.
 * At the moment the if/else statements are only used to determine if the node should be evaluated or not in the context of the pipeline.
 * Pending `each` statement for consideration.
 * Eg.
 *  We don't find expressions like this:
 *    ${{ if eq(1,1) ... else ... }}
 *
 *  Rather:
 *    ${{ if eq(1,1) }}
 *      - stage: build
 */
export interface IRealFlowNode {
  condition: IVisitable;
  trueBranch: IVisitable;
  falseBranch: IVisitable;
}

export class FlowNode implements IVisitable, IRealFlowNode {
  constructor(
    public condition: IVisitable,
    public trueBranch: IVisitable,
    public falseBranch: IVisitable
  ) {}

  accept(visitor: IVisitor): void {
    visitor.start_visit(this);

    this.condition.accept(visitor);
    this.trueBranch.accept(visitor);
    this.falseBranch?.accept(visitor);

    visitor.visit(this);
    visitor.end_visit();
  }
}

/**
 * Not used for now and not supported by current visitors
 * Similar to IRealFlowNode, these supports logical and comparison operators at the expression level
 * Eg
 *  1 eq 1
 *  1 lte 2
 *  1 or 2
  
 * Both logical and comparison operators are implemented as functions, hence using the IFunctionNode interface
 */

abstract class LogicalNode implements IVisitable, ILogicalNode {
  operator: Switch;
  first: IVisitable;
  second: IVisitable;

  constructor(operator: Switch, first: IVisitable, second: IVisitable) {
    this.operator = operator;
    this.first = first;
    this.second = second;
  }

  accept(visitor: IVisitor): void {
    visitor.start_visit(this);
    this.first.accept(visitor);
    this.second.accept(visitor);
    visitor.visit(this);
    visitor.end_visit();
  }
}

export class AndNode extends LogicalNode {
  constructor(first: IVisitable, second: IVisitable) {
    super("and", first, second);
  }
}

export class OrNode extends LogicalNode {
  constructor(first: IVisitable, second: IVisitable) {
    super("or", first, second);
  }
}

export class ComparisonNode implements IVisitable, IOperatorNode {
  operator: string;
  first: IVisitable;
  second: IVisitable;

  constructor(operator: string, first: IVisitable, second: IVisitable) {
    this.operator = operator;
    this.first = first;
    this.second = second;
  }

  accept(visitor: IVisitor): void {
    visitor.start_visit(this);
    this.first.accept(visitor);
    this.second.accept(visitor);
    visitor.end_visit();
  }
}
