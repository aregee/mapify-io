
export type Format = "json" | "yaml";

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
