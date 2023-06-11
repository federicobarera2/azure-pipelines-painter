"use server"
import { PipelineParser } from "azpp-common/parsers/templates/pipeline";
import { LocalFileTemplateResolver } from "azpp-common/parsers/templates/resolver";

export async function parsePipeline(context: any, content: string) {
  debugger;
  console.log("parsePipeline", context.__root);
  const pp = new PipelineParser((baseDir: string[]) => new LocalFileTemplateResolver(baseDir), [context.__root ?? './']);
  const r = pp.parseFileContent(context, content);
  
  return r;
}