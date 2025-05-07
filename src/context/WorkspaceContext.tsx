
import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { Workspace, Document, WorkspaceWithDocuments } from "@/types/api";
import { workspaceApi, documentApi } from "@/services/api";

interface WorkspaceContextType {
  workspaces: WorkspaceWithDocuments[];
  selectedWorkspace: WorkspaceWithDocuments | null;
  loading: boolean;
  error: string | null;
  createWorkspace: (name: string) => Promise<void>;
  updateWorkspace: (workspace: Workspace) => Promise<void>;
  deleteWorkspace: (wsId: number) => Promise<void>;
  selectWorkspace: (workspace: WorkspaceWithDocuments) => void;
  uploadDocument: (file: File) => Promise<void>;
  deleteDocument: (docId: number) => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const [workspaces, setWorkspaces] = useState<WorkspaceWithDocuments[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceWithDocuments | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load workspaces on mount
  useEffect(() => {
    refreshWorkspaces();
  }, []);

  // Refresh workspaces and their documents
  const refreshWorkspaces = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all workspaces
      const workspaceData = await workspaceApi.getAll();
      
      // Transform into WorkspaceWithDocuments with mock data for now
      // In a real app, you would fetch actual document counts
      const transformedWorkspaces: WorkspaceWithDocuments[] = workspaceData.map(ws => ({
        ...ws,
        documents: [],
        // Mock data - in real app, these would come from the API
        messageCount: Math.floor(Math.random() * 50) + 5,
        fileCount: Math.floor(Math.random() * 15) + 1
      }));
      
      // For each workspace, get its documents
      for (const workspace of transformedWorkspaces) {
        try {
          if (workspace.ws_id) {
            const docs = await documentApi.getAll(workspace.ws_id);
            workspace.documents = docs;
            workspace.fileCount = docs.length; // Update with real count
          }
        } catch (docErr) {
          console.error(`Failed to load documents for workspace ${workspace.ws_id}:`, docErr);
        }
      }
      
      setWorkspaces(transformedWorkspaces);
      
      // If we have a selected workspace, update it
      if (selectedWorkspace && selectedWorkspace.ws_id) {
        const updatedSelected = transformedWorkspaces.find(w => w.ws_id === selectedWorkspace.ws_id);
        if (updatedSelected) {
          setSelectedWorkspace(updatedSelected);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load workspaces';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async (name: string) => {
    try {
      setLoading(true);
      
      // Check for duplicate workspace
      const isDuplicate = workspaces.some(w => 
        w.ws_name.toLowerCase() === name.toLowerCase());
      
      if (isDuplicate) {
        toast.error("A workspace with this name already exists.");
        return;
      }
      
      const newWorkspace: Workspace = {
        ws_name: name,
        user_id: 1, // Default user ID
        is_active: true
      };
      
      const response = await workspaceApi.create(newWorkspace);
      
      if (response.success) {
        toast.success("Workspace created successfully");
        await refreshWorkspaces();
      } else {
        toast.error("Failed to create workspace");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create workspace';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateWorkspace = async (workspace: Workspace) => {
    try {
      setLoading(true);
      
      // Check for duplicate name if changing the name
      const currentWorkspace = workspaces.find(w => w.ws_id === workspace.ws_id);
      
      if (currentWorkspace && currentWorkspace.ws_name !== workspace.ws_name) {
        const isDuplicate = workspaces.some(w => 
          w.ws_id !== workspace.ws_id && 
          w.ws_name.toLowerCase() === workspace.ws_name.toLowerCase());
        
        if (isDuplicate) {
          toast.error("A workspace with this name already exists.");
          return;
        }
      }
      
      const response = await workspaceApi.update(workspace);
      
      if (response.success) {
        toast.success("Workspace updated successfully");
        await refreshWorkspaces();
      } else {
        toast.error("Failed to update workspace");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update workspace';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkspace = async (wsId: number) => {
    try {
      setLoading(true);
      
      const response = await workspaceApi.delete(wsId);
      
      if (response.success) {
        // If the deleted workspace was selected, clear the selection
        if (selectedWorkspace && selectedWorkspace.ws_id === wsId) {
          setSelectedWorkspace(null);
        }
        
        toast.success("Workspace deleted successfully");
        await refreshWorkspaces();
      } else {
        toast.error("Failed to delete workspace");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete workspace';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const selectWorkspace = (workspace: WorkspaceWithDocuments) => {
    setSelectedWorkspace(workspace);
  };

  const uploadDocument = async (file: File) => {
    try {
      if (!selectedWorkspace) {
        toast.error("Please select a workspace first");
        return;
      }
      
      setLoading(true);
      
      // Check if the file is a PDF
      if (!file.type.includes('pdf')) {
        toast.error("Only PDF files are supported");
        return;
      }
      
      const response = await documentApi.upload(file, selectedWorkspace);
      
      if (response.success) {
        toast.success("Document uploaded successfully");
        await refreshWorkspaces();
      } else {
        toast.error("Failed to upload document");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload document';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (docId: number) => {
    try {
      setLoading(true);
      
      const response = await documentApi.delete(docId);
      
      if (response.success) {
        toast.success("Document deleted successfully");
        await refreshWorkspaces();
      } else {
        toast.error("Failed to delete document");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete document';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const contextValue: WorkspaceContextType = {
    workspaces,
    selectedWorkspace,
    loading,
    error,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    selectWorkspace,
    uploadDocument,
    deleteDocument,
    refreshWorkspaces
  };

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
