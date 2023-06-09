import { isFlowNode } from "../expressions/nodes";
import { ExpressionParser } from "../expressions/parser";
import { ITemplateResolver, TemplateResolverFunc } from "./resolver";
import { TemplateParameter } from "./types";
import {
  evaluateExpression,
  getExpressionContent,
  getExpressionsFromString,
  isExpressionInterpolationString,
  isExpressionNode,
  isSingleExpressionString,
  isTemplateNode,
  resolveTemplateParameters,
} from "./utils";
import { isArray, isObject, cloneDeep } from "lodash";
import YAML from "yaml";

export class PipelineParser {
  private resolverFunc: TemplateResolverFunc;
  private resolver: ITemplateResolver;

  constructor(_resolver: TemplateResolverFunc, baseDir: string[]) {
    this.resolverFunc = _resolver;
    this.resolver = this.resolverFunc(baseDir);
  }

  public canResolve(path: string): boolean {
    return this.resolver.canResolve(path);
  }

  public getParams(path: string): TemplateParameter[] {
    const doc = this.resolver.resolve(path);
    const parameters = doc?.parameters ?? [];

    return parameters;
  }

  public parseFile(context: object, path: string) {
    const doc = this.resolver.resolve(path);
    const doc2 = this.evaluateNodes(cloneDeep(doc), context, path);

    return doc2;
  }

  public parseFileContent(context: object, content: string) {
    const doc = YAML.parse(content.toString());
    const doc2 = this.evaluateNodes(cloneDeep(doc), context, content);

    return doc2;
  }

  private evaluateNodes(node: any, context: any, currentPath: string): any {
    //console.debug("evaluateNodes", node, context, currentPath);

    if (isArray(node)) {
      const new_A = [];
      for (var i in node) {
        if (isExpressionNode(node[i])) {
          const r = this.evaluateNodes(node[i], context, currentPath);
          Array.isArray(r) ? new_A.push(...r) : new_A.push(r);
        } else new_A.push(this.evaluateNodes(node[i], context, currentPath));
      }

      return new_A;
    } else if (isObject(node)) {
      let newO = {};
      for (const key of Object.keys(node)) {
        if (isSingleExpressionString(key)) {
          const exp_content = getExpressionContent(key);
          const exp_node = new ExpressionParser(exp_content).parse()!;

          if (isFlowNode(exp_node)) {
            switch (exp_node.flow) {
              case "if":
                const condition = evaluateExpression(context, exp_content);
                if (!condition) continue;

                const if_right = this.evaluateNodes(
                  node[key as keyof typeof node],
                  context,
                  currentPath
                );

                if (Array.isArray(if_right)) return if_right;
                newO = { ...newO, ...if_right };
                break;
              case "insert":
                const insert_right = this.evaluateNodes(
                  node[key as keyof typeof node],
                  context,
                  currentPath
                );
                newO = { ...newO, ...insert_right };
                break;
              default:
                throw new Error("Not implemented");
            }
          } else {
            const left = this.evaluateNodes(key, context, currentPath);
            const right = this.evaluateNodes(
              node[key as keyof typeof node],
              context,
              currentPath
            );
            (newO as any)[left] = right;
          }
        } else {
          (newO[key] as any) = this.evaluateNodes(
            node[key as keyof typeof node],
            context,
            currentPath
          );
        }
      }

      if (isTemplateNode(newO)) {
        debugger;
        const path = newO.template;
        const parameters = newO.parameters;
        let subContext = { ...cloneDeep(context), parameters: undefined };

        const templateResolver = new PipelineParser(this.resolverFunc, [
          this.resolver.basePath,
          currentPath,
        ]);

        let value = null;
        if (templateResolver.canResolve(path.toString())) {
          const templateParams = templateResolver.getParams(path);

          const paramsResolveResult = resolveTemplateParameters(
            parameters,
            templateParams
          );

          if (paramsResolveResult.isParametersFullyResolved) {
            value = templateResolver.parseFile(
              { ...subContext, parameters: paramsResolveResult.params },
              path
            );
          }
        }

        return !!value
          ? {
              ...newO,
              value: value,
              resolvable: true,
            }
          : {
              ...newO,
              resolvable: false,
            };
      }

      return newO;
    } else if (isSingleExpressionString(node)) {
      return evaluateExpression(context, getExpressionContent(node));
    } else if (isExpressionInterpolationString(node)) {
      const expressions = getExpressionsFromString(node);
      let result = node;
      for (const exp of expressions) {
        result = result.replace(
          exp,
          evaluateExpression(context, getExpressionContent(exp))
        );
      }

      return result;
    }

    return node;
  }
}
