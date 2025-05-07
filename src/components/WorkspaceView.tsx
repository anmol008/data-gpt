
import React, { useEffect } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import ChatView from "./ChatView";
import { documentApi } from "@/services/api";

const WorkspaceView = () => {
  const { selectedWorkspace, refreshWorkspaces } = useWorkspace();

  // Fetch workspace documents when workspace changes
  useEffect(() => {
    if (selectedWorkspace?.ws_id) {
      fetchWorkspaceDocuments(selectedWorkspace.ws_id);
    }
  }, [selectedWorkspace?.ws_id]);

  // Fetch documents for the current workspace
  const fetchWorkspaceDocuments = async (wsId: number) => {
    try {
      await documentApi.getAll(wsId);
      // Update workspace document list in context
      refreshWorkspaces();
    } catch (error) {
      console.error("Failed to fetch workspace documents:", error);
    }
  };

  if (!selectedWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-white to-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-sm border border-gray-100 max-w-md text-center">
          <FileText className="h-12 w-12 text-[#0A66C2] mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-[#2C2C2E] mb-2">
            Welcome to DataGPT
          </h2>
          <p className="text-gray-600 mb-6">
            Select a workspace or create a new one to get started with your
            documents.
          </p>
          <Button
            onClick={() =>
              document
                .querySelector('[data-sidebar="trigger"]')
                ?.dispatchEvent(new MouseEvent("click"))
            }
            className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white"
          >
            View Workspaces
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Workspace Header */}
      <header className="border-b border-gray-200 p-4 bg-white shadow-sm">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-[#2C2C2E]">
            <span className="text-[#0A66C2]">DataGPT</span> /{" "}
            {selectedWorkspace.ws_name}
          </h1>
          <div className="text-sm text-gray-500">
            {selectedWorkspace.documents?.length || 0} documents uploaded
          </div>
        </div>
      </header>

      {/* Main Content Area - Always show ChatView when a workspace is selected */}
      <div className="flex flex-col flex-grow overflow-auto">
        <ChatView 
          workspaceId={selectedWorkspace.ws_id} 
          workspaceName={selectedWorkspace.ws_name}
          workspace={selectedWorkspace}
        />
      </div>
    </div>
  );
};

export default WorkspaceView;
