"use server"
import { PipelineParser } from "azpp-common/parsers/templates/pipeline";
import { LocalFileTemplateResolver } from "azpp-common/parsers/templates/resolver";

export async function openPipeline(path: string) {
  const pp = new PipelineParser((baseDir: string[]) => new LocalFileTemplateResolver(baseDir), ['./']);
  const r = pp.parseFile({}, path);
  
  
  return r;
}