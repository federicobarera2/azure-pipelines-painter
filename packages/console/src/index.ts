import { PipelineParser } from "azpp-common/parsers/templates/pipeline";
import { LocalFileTemplateResolver } from "azpp-common/parsers/templates/resolver";
import { ExpressionEvaluator } from "azpp-common/parsers/expressions/evaluators";
import { ExpressionLexer } from "azpp-common/parsers/expressions/lexer";
import { resolveTemplateParameters } from "azpp-common/parsers/templates/utils";
import { ExpressionParser } from "azpp-common/parsers/expressions/parser";
import { parse } from "ts-command-line-args";

/**
 * Lexer
 */

const expression = "add(1, parameters.test)";
const expression_result = new ExpressionLexer(expression).tokenize();
console.log(expression_result);


/**
 * Expressions Evaluator
 */ 
const exp_eval_context = {
  parameters: {
    test: 1
  }
}
const expr_evaluator_exp = "add(1, parameters.test)";
const exp_tree = new ExpressionParser(expr_evaluator_exp).parse()
const expr_evaluator = new ExpressionEvaluator(exp_eval_context);
exp_tree?.accept(expr_evaluator);

console.log(expr_evaluator.getResult());

/**
 * Pipeline Parser
 */ 

const args = parse({
  path: { type: String, defaultOption: true },
});

const context: any = {
  variables: {
    "Build.Reason": "Manual",
  },
  parameters: {
    subTemplate: "test2",
    subTemplate2: "test3",
    environment: "staging",
    complex: {
      obj1: "a",
      obj2: 1,
      obj3: ["a", 1],
    },
  },
}

const evaluated = new PipelineParser((basePath) => new LocalFileTemplateResolver(basePath), ["./"]).parseFile(context, args.path);
console.log(JSON.stringify(evaluated, null, 2));