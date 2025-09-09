export interface ApiUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface ApiResponse {
  response: string;
  usage?: ApiUsage;
  sources?: string[];
}

export interface QueryHistory {
  id: string;
  query: string;
  response: string;
  timestamp: Date;
  usage?: ApiUsage;
  sources?: string[];
}


