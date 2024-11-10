import { isFlowNode, isPropertyNode } from "../expressions/nodes";
import { ExpressionParser } from "../expressions/parser";
import { ITemplateResolver, TemplateResolverFunc } from "./resolver";
import {
  evaluateExpression,
  getExpressionContent,
  getExpressionsFromString,
  isExpressionInterpolationString,
  isExpressionNode,
  isSingleExpressionString,
  isTemplateNode,
  resolveTemplateParameters,
  TemplateParameter
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

  public getParamsFromContent(content: string): TemplateParameter[] {
    const doc = YAML.parse(content.toString());
    const parameters = doc?.parameters ?? [];

    return parameters;
  }

  public parseFile(context: object, path: string) {
    const doc = this.resolver.resolve(path);
    const doc2 = this.evaluateNodes(cloneDeep(doc), null, context, path);

    return doc2;
  }

  public parseFileContent(context: object, content: string) {
    const doc = YAML.parse(content.toString());
    const doc2 = this.evaluateNodes(cloneDeep(doc), null, context, './');

    return doc2;
  }

  private evaluateNodes(node: any, prevNode: any, context: any, currentPath: string): any {
    //console.debug("evaluateNodes", prevNode, node, context, currentPath);
    if (isArray(node)) {
      const new_A = [];
      for (var i in node) {
        if (isExpressionNode(node[i]) || isTemplateNode(node[i])) {
          const r = this.evaluateNodes(node[i], node, context, currentPath);
          isArray(r) 
            ? new_A.push(...r) 
            : isObject(r) && Object.keys(r).length > 0 
              ? new_A.push(r)
              : null;
        } else {
          new_A.push(this.evaluateNodes(node[i], node, context, currentPath));
        }
      }

      return new_A;
    } else if (isObject(node)) {
      let newO = {};
      let ifMet = false;
      for (const key of Object.keys(node)) {
        if (isSingleExpressionString(key)) {
          const exp_content = getExpressionContent(key);
          const exp_node = new ExpressionParser(exp_content).parse()!;
          
          if (isFlowNode(exp_node)) {
            switch (exp_node.flow) {
              case "if":
              case "elseif":
                if (ifMet) continue;

                const condition = evaluateExpression(context, exp_content);
                if (!condition) continue;

                ifMet = true;
                const if_right = this.evaluateNodes(
                  node[key as keyof typeof node],
                  node,
                  context,
                  currentPath
                );

                if (isArray(if_right)) 
                  return if_right;
                newO = { ...newO, ...if_right };
                break;
              case "else":
                if (ifMet) continue;
                ifMet = true;
                const else_right = this.evaluateNodes(
                  node[key as keyof typeof node],
                  node,
                  context,
                  currentPath
                );

                if (isArray(else_right)) 
                  return else_right;
                newO = { ...newO, ...else_right };
                break;
              case "insert":
                const insert_right = this.evaluateNodes(
                  node[key as keyof typeof node],
                  node,
                  context,
                  currentPath
                );

                if (isArray(insert_right)) 
                  return insert_right;
                newO = { ...newO, ...insert_right };
                break;
              case "each":
                if (isPropertyNode(exp_node.body)) {
                  const iteratorValue = evaluateExpression(context, exp_node.body.name);
                  const iterator = isArray(iteratorValue) ? iteratorValue : Object.keys(iteratorValue).map(k => ({ key: k, value: iteratorValue[k] }))
                  let tmpArray: any[] = [];
                  for (const each of iterator) {
                    const each_right = this.evaluateNodes(
                      node[key as keyof typeof node],
                      node,
                      { ...context, [exp_node.identifier]: each },
                      currentPath
                    );

                    if (isArray(each_right)) 
                     tmpArray = [...tmpArray, ...each_right]
                    else
                      newO = { ...newO, ...each_right };
                  }
                  if (tmpArray.length > 0) 
                    return tmpArray;
                  break;
                }
                
                throw new Error("Unexpected visitor condition for each");
              default:
                console.error(exp_node.flow);
                throw new Error("FlowNode not implemented");
            }
          } else {
            const left = this.evaluateNodes(key, node, context, currentPath);
            const right = this.evaluateNodes(
              node[key as keyof typeof node],
              node,
              context,
              currentPath
            );
            (newO as any)[left] = right;
          }
        } else {
          (newO[key] as any) = this.evaluateNodes(
            node[key as keyof typeof node],
            node,
            context,
            currentPath
          );
        }
      }

      if (isTemplateNode(newO)) {
        
        const parameters = newO.parameters;
        let subContext = { ...cloneDeep(context), parameters: undefined };

        let path = newO.template.toString();
        let templateBasePath = currentPath;

        if (path.indexOf('@') !== -1) {
          templateBasePath = context[`__${path.split("@")[1]}`] ?? this.resolver.basePath;
          path = path.split("@")[0];
        }

        console.log(templateBasePath, path);
        
        const templateResolver = new PipelineParser(this.resolverFunc, [
          this.resolver.basePath,
          templateBasePath,
        ]);

        let value = null;
        if (templateResolver.canResolve(path.toString())) {
          const templateParams = templateResolver.getParams(path);

          const newTParams = resolveTemplateParameters(
            parameters,
            templateParams
          );

          value = templateResolver.parseFile(
            { ...subContext, parameters: newTParams },
            path
          );
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
