import { isObject, isString } from "lodash";
import { TemplateNode, TemplateParameter } from "./types";
import { ExpressionParser } from "../expressions/parser";
import { ExpressionEvaluator } from "../expressions/evaluators";

const containsExpression = (v?: string) =>
  !!v ? /\${{((.|\n)*?)}}/gim.test(v) : false;
const isSingleExpression = (v?: string) =>
  !!v ? /^\${{((.|\n)*?)}}$/gim.test(v) : false;

export const getExpressionsFromString = (node: string): string[] =>
  node.match(/\${{((.|\n)*?)}}/gim)?.filter(isString) ?? [];

export const getExpressionContent = (node: string): string =>
  /\${{((.|\n)*?)}}/gim.exec(node)![1].trim();

export const isExpressionNode = (node: unknown): node is object =>
  isObject(node) && containsExpression(getFirstProperty(node));

export const isSingleExpressionString = (node: unknown): node is string =>
  isString(node) && isSingleExpression(node);

export const isExpressionInterpolationString = (
  node: unknown
): node is string => isString(node) && containsExpression(node);

const getFirstProperty = (node: object): string | undefined =>
  Object.keys(node)[0];

export const getExpressionContentFromNode = (node: object): string => {
  return getExpressionContent(
    getExpressionsFromString(getFirstProperty(node)!)![0]
  );
};

export const getExpressionChildrenFromNode = (node: object): any =>
  Object.values(node)[0];

export const getExpressionOperatorFromNode = (node: object): string =>
  getExpressionContentFromNode(node).trim().split(" ")[0];

export const isTemplateNode = (node: unknown): node is TemplateNode => {
  if (!isObject(node)) return false;
  const keys = Object.keys(node);
  return keys.includes("template") && keys.includes("parameters");
};

export const resolveTemplateParameters = (
  context: any,
  params: TemplateParameter[]
) => {
  const o: Record<string, any> = {};
  for (const param of params) {
    o[param.name] = context[param.name] ?? param.default;
  }

  return {
    isParametersFullyResolved: Object.values(o).every((v) => v !== undefined),
    params: o,
  };
};

export const evaluateExpression = (context: any, expression: string) => {
  const exp_node = new ExpressionParser(expression).parse();
  const evaluator = new ExpressionEvaluator(context);
  exp_node?.accept(evaluator);

  return evaluator.getResult();
};
