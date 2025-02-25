
export interface MappingTag {
  id: string;
  label: string;
}

export interface MappingContent {
  tags: string[];
  yaml: string;
  test_data: any[];
}

export interface Mapping {
  id: number;
  title: string;
  content: MappingContent;
  created_at: string;
  updated_at: string;
  href: string;
}

export interface CreateMappingRequest {
  title: string;
  content: {
    tags: string[];
    yaml: string;
    test_data?: any[];
  }
}
