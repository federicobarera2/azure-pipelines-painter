export type TemplateNode = {
  template: string;
  parameters: Record<string, any>;
};

export type ExtendedTemplateNode = TemplateNode & {
  value?: any;
  resolved: boolean;
};

export type TemplateParameter = {
  name: string;
  default?: any;
  type?: any;

  //TODO: others
};

export const templateKeywords = [
  "template",
  "stage",
  "stages",
  "jobs",
  "job",
  "steps",
  "step",
  "parameters",
  //TODO: others
] as const;

export type TemplateKeywordsType = (typeof templateKeywords)[number];
