
import { Workspace, Document, ApiResponse } from "@/types/api";

const API_BASE_URL = "https://si.pearlit.in/api/v1";
const DEFAULT_USER_ID = 1;

// Helper function to handle API responses
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "An error occurred");
  }
  return response.json();
};

// Workspace API endpoints
export const workspaceApi = {
  getAll: async (): Promise<Workspace[]> => {
    const response = await fetch(`${API_BASE_URL}/workspaces`);
    const result = await handleResponse<{ data: Workspace[] }>(response);
    return result.data;
  },  

  getById: async (wsId: number): Promise<Workspace> => {
    const response = await fetch(`${API_BASE_URL}/workspaces?ws_id=${wsId}`);
    return handleResponse<Workspace>(response);
  },

  create: async (workspace: Workspace): Promise<ApiResponse<Workspace>> => {
    const response = await fetch(`${API_BASE_URL}/workspaces`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...workspace,
        user_id: workspace.user_id || DEFAULT_USER_ID,
        is_active: true,
      }),
    });
    return handleResponse<ApiResponse<Workspace>>(response);
  },

  update: async (workspace: Workspace): Promise<ApiResponse<Workspace>> => {
    const response = await fetch(`${API_BASE_URL}/workspaces`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(workspace),
    });
    return handleResponse<ApiResponse<Workspace>>(response);
  },

  delete: async (wsId: number): Promise<ApiResponse<null>> => {
    const response = await fetch(`${API_BASE_URL}/workspaces`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ws_id: wsId,
        is_active: false,
      }),
    });
    return handleResponse<ApiResponse<null>>(response);
  },
};

// Document API endpoints
export const documentApi = {
  getAll: async (wsId?: number, userId?: number): Promise<Document[]> => {
    let url = `${API_BASE_URL}/ws-docs`;
    const params = [];
    
    if (wsId) params.push(`ws_id=${wsId}`);
    if (userId) params.push(`user_id=${userId}`);
    
    if (params.length > 0) {
      url += `?${params.join("&")}`;
    }
    
    const response = await fetch(url);
    return handleResponse<Document[]>(response);
  },

  getById: async (docId: number): Promise<Document> => {
    const response = await fetch(`${API_BASE_URL}/ws-docs?ws_doc_id=${docId}`);
    return handleResponse<Document>(response);
  },

  upload: async (file: File, workspace: Workspace): Promise<ApiResponse<Document>> => {
    // Extract file extension
    const nameParts = file.name.split('.');
    const extension = nameParts.length > 1 ? nameParts.pop() || "pdf" : "pdf";
    const fileName = nameParts.join('.');

    // In a real app, we'd upload the file here with FormData
    // For now, we'll just simulate the API call
    
    const documentData: Document = {
      ws_doc_path: "",  // This would come from the server after upload
      ws_doc_name: file.name,
      ws_doc_extn: extension,
      ws_doc_for: "",
      ws_id: workspace.ws_id || 0,
      user_id: workspace.user_id || DEFAULT_USER_ID,
      is_active: true,
    };
    
    const response = await fetch(`${API_BASE_URL}/ws-docs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(documentData),
    });
    
    return handleResponse<ApiResponse<Document>>(response);
  },

  delete: async (docId: number): Promise<ApiResponse<null>> => {
    const response = await fetch(`${API_BASE_URL}/ws-docs`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ws_doc_id: docId,
        is_active: false,
      }),
    });
    return handleResponse<ApiResponse<null>>(response);
  },
};
