export interface Workspace {
  ws_id?: number;
  ws_name: string;
  user_id: number;
  is_active: boolean;
}

export interface Document {
  ws_doc_id?: number;
  ws_doc_path: string;
  ws_doc_name: string;
  ws_doc_extn: string;
  ws_doc_for: string;
  ws_id: number;
  user_id: number;
  is_active: boolean;
  workspaces?: {
    ws_id: number;
    ws_name: string;
  };
  users?: {
    user_id: number;
    user_name: string;
  };
}

export interface WorkspaceWithDocuments extends Workspace {
  documents: Document[];
  messageCount: number;
  fileCount: number;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

// Chat-related types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Source {
  source_id: string;
  summary: string;
  file: string;
  page: number;
}

export interface ChatResponse {
  answer: string;
  sources: Source[];
}
