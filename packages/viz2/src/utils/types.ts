export type Pipeline = {
  stages?: Stage[];
  jobs?: Job[];
  steps?: Step[];
}

export type Stage = {
  name?: string;
  jobs?: Job[];
  dependsOn?: string[];
}

export type Job = {
  name?: string;
  steps: Step[];
}

export type Step = Record<string, any> & {
  name?: string;
  displayName?: string;
}