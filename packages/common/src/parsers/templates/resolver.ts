import path from "path";
import fs from "fs";
import YAML from "yaml";

export interface ITemplateResolver {
  basePath: string;
  canResolve(template: string): boolean;
  resolve: (template: string) => any;
}

export type TemplateResolverFunc = (basePath: string[]) => ITemplateResolver;

export class LocalFileTemplateResolver implements ITemplateResolver {
  basePath: string;
  constructor(base: string[]) {
    this.basePath = path.resolve(...base);
    if (!!path.extname(this.basePath)) {
      this.basePath = this.basePath.replace(path.basename(this.basePath), "");
    }
  }

  

  canResolve(template_path: string): boolean {
    const end_path = path.join(this.basePath, template_path);
    return fs.existsSync(end_path);
  }

  public resolve(template_path: string) {
    const end_path = path.join(this.basePath, template_path);
    const file = fs.readFileSync(end_path);
    const yaml = YAML.parse(file.toString());
    return yaml;
  }
}
