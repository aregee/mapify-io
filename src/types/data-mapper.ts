
export type Format = "json" | "yaml";
export type TransformMode = "test" | "apply";

export interface SampleDataItem {
  id: string;
  name: string;
  data: string;
  isYaml?: boolean;
  dataTitle?: string;
}

export interface TransformResponse {
  data: any;
  error?: string;
}
