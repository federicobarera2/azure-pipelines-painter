import { parse } from "ts-command-line-args";
import { LocalFileTemplateResolver } from "./parsers/templates/resolver";
import { PipelineParser } from "./parsers/templates/parser";

export const args = parse({
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
};

const evaluated = new PipelineParser(
  (baseDir) => new LocalFileTemplateResolver(baseDir),
  ["./"]
).parse(context, args.path);

console.log(JSON.stringify(evaluated, null, 2));
