
export interface MappingHistoryVersion {
  title: string;
  content: {
    tags: string[];
    yaml: string;
  };
  created_at: string;
  updated_at: string;
  txnid: string;
  href: string;
}

export interface MappingHistoryResponse {
  versions: MappingHistoryVersion[];
}
