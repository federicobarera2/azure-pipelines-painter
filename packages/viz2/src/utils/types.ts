export type Pipeline = {
  stages?: Stage[];
  jobs?: Job[];
  steps?: Step[];
}

export type Stage = {
  stage?: string;
  displayName?: string;
  jobs?: Job[];
  dependsOn?: string[];
}

export type Job = {
  job?: string;
  displayName?: string;
  steps: Step[];
}

export type Step = Record<string, any> & {
  step?: string;
  displayName?: string;
}

export type TemplateParameter = {
  name: string;
  default?: any;
  type?: any;

  //TODO: others
};