const API_BASE_URL = "https://si.pearlit.in/api/v1";
const LLM_API_BASE_URL = "https://llmdemoapi.in";

// Mock data for when the API is not available
const mockChatResponse = {
  answer: "The author of the article is Ashkan Eslaminejad.\n\nAs for summarizing the topics, I analyzed the text and identified several key points:\n\n* The article discusses the analysis of structural performance under harmonic excitation, with a focus on conservative insights into equation (1) and its implications.\n* It also touches on the topic of exposure to irradiation and thermal effects, highlighting the importance of considering multiple potential aging mechanisms.\n* The article mentions the development of traditional SASSI and its limitations, as well as the introduction of algorithms that leverage commercial code SC-SASSI.\n* Additionally, it discusses the root causes of accelerated damage in structures, emphasizing the complex interaction between heat chemistry, cold or warm work, and thermal history.\n* Finally, the article provides a conservative method for assessing stress levels and ensuring continued operation can be justified through analytical methods with appropriate confidence and risk tolerance.\n\nIf data is missing, I would respond: \"According to the provided context, I could not find that information.\"",
  sources: [
    {
      source_id: "fc67e564-883c-4f10-94a0-5fb97189ca0d",
      summary: "conservative insights into the  Equation (1) \t [Kc ]{qc } = {Fc }\t\t \t \t \t Equation (2) \t (-Ω2 [M]+iΩ...",
      file: "54-News-and-Views-54-2024.pdf",
      page: 5
    },
    {
      source_id: "684036c7-29d4-4909-9a61-68b606716761",
      summary: "exposure to irradiation and thermal effects.  The analysis introduced  reasonable inputs in place of...",
      file: "54-News-and-Views-54-2024.pdf",
      page: 15
    },
    {
      source_id: "b0be045d-2318-479f-8a2b-b7ceda423f42",
      summary: "traditional SASSI.  The rapid analysis  now allows more rigorous treatment  of considerations that p...",
      file: "54-News-and-Views-54-2024.pdf",
      page: 12
    }
  ]
};

// Document API service
export const documentApi = {
  getAll: async (wsId: number): Promise<Document[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/ws-docs?ws_id=${wsId}`);
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        return data.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching documents:", error);
      return [];
    }
  },
  create: async (
    ws_doc_path: string,
    ws_doc_name: string,
    ws_doc_extn: string,
    ws_doc_for: string,
    ws_id: number,
    user_id: number
  ): Promise<Document | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/ws-docs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ws_doc_path,
          ws_doc_name,
          ws_doc_extn,
          ws_doc_for,
          ws_id,
          user_id,
          is_active: true,
        }),
      });
      const data = await response.json();
      if (data.success && data.data) {
        return data.data;
      }
      return null;
    } catch (error) {
      console.error("Error creating document:", error);
      return null;
    }
  },
  update: async (document: Document): Promise<Document | null> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/ws-docs/${document.ws_doc_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(document),
        }
      );
      const data = await response.json();
      if (data.success && data.data) {
        return data.data;
      }
      return null;
    } catch (error) {
      console.error("Error updating document:", error);
      return null;
    }
  },
  delete: async (ws_doc_id: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/ws-docs/${ws_doc_id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error("Error deleting document:", error);
      return false;
    }
  },
};

// Workspace API service
export const workspaceApi = {
  getAll: async (user_id: number): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/workspaces?user_id=${user_id}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      return [];
    }
  },
  create: async (ws_name: string, user_id: number): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/workspaces`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ws_name, user_id, is_active: true }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error creating workspace:", error);
      return null;
    }
  },
  update: async (workspace: any): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/workspaces/${workspace.ws_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(workspace),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating workspace:", error);
      return null;
    }
  },
  delete: async (ws_id: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/workspaces/${ws_id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error("Error deleting workspace:", error);
      return false;
    }
  },
};

// User API service
export const userApi = {
  getAll: async (): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  },
  get: async (user_id: number): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${user_id}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  },
  create: async (user_name: string, user_email: string): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_name, user_email, is_active: true }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error creating user:", error);
      return null;
    }
  },
  update: async (user: any): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${user.user_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating user:", error);
      return null;
    }
  },
  delete: async (user_id: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${user_id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  },
};

// LLM API service
export const llmApi = {
  uploadDocuments: async (files: File[]): Promise<boolean> => {
    try {
      console.log("Uploading files to LLM API:", files.map(f => f.name).join(", "));
      
      // In a real implementation, upload the files to the LLM API
      // For now, simulate a successful upload
      // const formData = new FormData();
      // files.forEach(file => formData.append('files', file));
      // const response = await fetch(`${LLM_API_BASE_URL}/upload`, {
      //   method: 'POST',
      //   body: formData
      // });
      // const data = await response.json();
      // return data.success;
      
      return true;
    } catch (error) {
      console.error("Error uploading documents to LLM API:", error);
      return false;
    }
  },

  queryLLM: async (query: string): Promise<ChatResponse> => {
    try {
      console.log("Querying LLM API:", query);
      
      // In a real implementation, query the LLM API
      // const response = await fetch(`${LLM_API_BASE_URL}/query`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ query })
      // });
      // const data = await response.json();
      // return data;
      
      // Return mock data for now
      return mockChatResponse;
    } catch (error) {
      console.error("Error querying LLM API:", error);
      throw error;
    }
  }
};
