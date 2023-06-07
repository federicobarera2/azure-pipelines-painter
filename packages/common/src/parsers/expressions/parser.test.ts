import { FunctionNode, ValueNode } from "./nodes";
import { ExpressionParser } from "./parser";

describe("Parser", () => {
  it("should parse numeric", () => {
    const exps = [
      ["1", 1],
      ["1.1", 1.1],
      [".1", 0.1],
      ["+.1", 0.1],
      ["-12.67", -12.67],
    ] as [string, number][];

    for (const [exp, res] of exps) {
      const result = new ExpressionParser(exp).parse();
      expect(result instanceof ValueNode).toBe(true);

      expect((result as ValueNode).value).toBe(res);
    }
  });

  it("should parse string", () => {
    const exps = ["'test'", "'1'"];

    for (const exp of exps) {
      const result = new ExpressionParser(exp).parse();
      expect(result instanceof ValueNode).toBe(true);

      expect((result as ValueNode).value).toBe(exp.replace(/'/g, ""));
    }
  });

  it("should parse functions", () => {
    const exp = "add(1, div(2,1))";
    const result = new ExpressionParser(exp).parse();

    expect(result instanceof FunctionNode).toBe(true);
    expect((result as FunctionNode).arguments.length).toBe(2);
    expect((result as FunctionNode).arguments[0] instanceof ValueNode).toBe(
      true
    );
    expect((result as FunctionNode).arguments[1] instanceof FunctionNode).toBe(
      true
    );
  });
});
