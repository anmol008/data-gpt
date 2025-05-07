
import { Workspace, Document, ApiResponse, ChatResponse } from "@/types/api";

const API_BASE_URL = "https://si.pearlit.in/api/v1";
const LLM_API_BASE_URL = "https://llmdemoapi.in";
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
    
    console.log(`Fetching documents with URL: ${url}`);
    const response = await fetch(url);
    const result = await handleResponse<{success: boolean, data: Document[]}>(response);
    
    // Check if the API response has the expected structure
    if (result.success && Array.isArray(result.data)) {
      console.log(`Fetched ${result.data.length} documents for workspace ${wsId}`);
      return result.data;
    } else {
      console.log("API response structure doesn't match expected format:", result);
      // If we didn't get the expected structure, return an empty array
      return [];
    }
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

    // First, upload to the regular API
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

// LLM API endpoints for chat functionality
export const llmApi = {
  // Upload documents to LLM API for processing
  uploadDocuments: async (files: File[]): Promise<boolean> => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(`${LLM_API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload documents to LLM API');
      }

      return true;
    } catch (error) {
      console.error('Error uploading to LLM:', error);
      return false;
    }
  },

  // Query the LLM with a question
  queryLLM: async (question: string): Promise<ChatResponse> => {
    try {
      // In a real implementation, this would be a POST request
      // For now, using GET for simplicity as per the example
      const response = await fetch(`${LLM_API_BASE_URL}/query?question=${encodeURIComponent(question)}`);
      
      if (!response.ok) {
        throw new Error('Failed to query LLM API');
      }

      return await response.json();
    } catch (error) {
      console.error('Error querying LLM:', error);
      // Return dummy data if the API fails
      return getDummyChatResponse(question);
    }
  }
};

// Dummy data for testing when API is not available
const getDummyChatResponse = (question: string): ChatResponse => {
  return {
    answer: "The author of the article is Ashkan Eslaminejad.\n\nAs for summarizing the topics, I analyzed the text and identified several key points:\n\n* The article discusses the analysis of structural performance under harmonic excitation, with a focus on conservative insights into equation (1) and its implications.\n* It also touches on the topic of exposure to irradiation and thermal effects, highlighting the importance of considering multiple potential aging mechanisms.\n* The article mentions the development of traditional SASSI and its limitations, as well as the introduction of algorithms that leverage commercial code SC-SASSI.\n* Additionally, it discusses the root causes of accelerated damage in structures, emphasizing the complex interaction between heat chemistry, cold or warm work, and thermal history.\n* Finally, the article provides a conservative method for assessing stress levels and ensuring continued operation can be justified through analytical methods with appropriate confidence and risk tolerance.\n\nIf data is missing, I would respond: \"According to the provided context, I could not find that information.\"",
    sources: [
      {
        source_id: "fc67e564-883c-4f10-94a0-5fb97189ca0d",
        summary: "conservative insights into the Equation (1) [Kc ]{qc } = {Fc } Equation (2) (-Ω2 [M]+iΩ...",
        file: "54-News-and-Views-54-2024.pdf",
        page: 5
      },
      {
        source_id: "684036c7-29d4-4909-9a61-68b606716761",
        summary: "exposure to irradiation and thermal effects. The analysis introduced reasonable inputs in place of...",
        file: "54-News-and-Views-54-2024.pdf",
        page: 15
      },
      {
        source_id: "b0be045d-2318-479f-8a2b-b7ceda423f42",
        summary: "traditional SASSI. The rapid analysis now allows more rigorous treatment of considerations that p...",
        file: "54-News-and-Views-54-2024.pdf",
        page: 12
      },
      {
        source_id: "d8837195-99a7-428c-a3ca-619f06801045",
        summary: "root causes are understood, the complex interaction between heat chemistry, the quantity of cold o...",
        file: "dpdp_act.pdf",
        page: 6
      }
    ]
  };
};
