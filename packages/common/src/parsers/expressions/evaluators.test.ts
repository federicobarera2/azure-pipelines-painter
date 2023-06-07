import { ExpressionParser } from "./parser";
import { ExpressionEvaluator } from "./evaluators";

describe("Visitor", () => {
  it("should visit", () => {
    const exp = "1";
    const result = new ExpressionParser(exp).parse();

    const visitor = new ExpressionEvaluator({});
    result?.accept(visitor);

    expect(visitor.getResult()).not.toBe(null);
  });

  it("should put the result of if/else/elseif into the stack during evaluation", () => {
    const tokens = ["if", "elseif", "else"];

    for (const token of tokens) {
      const exp = `${token} add(1,1)`;
      const result = new ExpressionParser(exp).parse();
      const visitor = new ExpressionEvaluator({});
      result?.accept(visitor);

      expect(visitor.getResult()).toBe(2);
    }
  });

  it("should access property from context", () => {
    const context = {
      variables: {
        "Build.Reason": "mock",
        simple: "mock",
      },
    };

    const exps = ["variables['Build.Reason']", "variables.simple"];

    for (const exp of exps) {
      const result = new ExpressionParser(exp).parse();
      const visitor = new ExpressionEvaluator(context);
      result?.accept(visitor);

      expect(visitor.getResult()).toBe("mock");
    }
  });

  it("should keep function processing order", () => {
    const exps = [
      ["mul(2, sub(2,1))", 2],
      ["sub(mul(2,2),1)", 3],
    ] as [string, number][];

    for (const [exp, res] of exps) {
      const result = new ExpressionParser(exp).parse();
      const visitor = new ExpressionEvaluator({});
      result?.accept(visitor);

      expect(visitor.getResult()).toBe(res);
    }
  });
});
