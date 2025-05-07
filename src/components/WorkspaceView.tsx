import React, { useState, useEffect } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileText, Send } from "lucide-react";
import { toast } from "sonner";
import DocumentList from "./DocumentList";
import MultiFileUpload from "./MultiFileUpload";
import { documentApi } from "@/services/api";
import { Document } from "@/types/api";

const WorkspaceView = () => {
  const {
    selectedWorkspace,
    uploadDocument,
    deleteDocument,
    refreshWorkspaces,
  } = useWorkspace();
  const [query, setQuery] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [workspaceDocuments, setWorkspaceDocuments] = useState<Document[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(false);

  // Clear selected files when workspace changes and fetch workspace documents
  useEffect(() => {
    setSelectedFiles([]); // Clear selected files when workspace changes

    if (selectedWorkspace?.ws_id) {
      fetchWorkspaceDocuments(selectedWorkspace.ws_id);
    } else {
      setWorkspaceDocuments([]);
    }
  }, [selectedWorkspace?.ws_id]);

  // Fetch documents for the current workspace
  const fetchWorkspaceDocuments = async (wsId: number) => {
    try {
      setIsLoadingDocs(true);
      const docs = await documentApi.getAll(wsId);
      console.log(
        `Fetched ${docs.length} documents for workspace ${wsId}:`,
        docs
      );
      setWorkspaceDocuments(docs);
    } catch (error) {
      console.error("Failed to fetch workspace documents:", error);
      toast.error("Failed to load documents");
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles((prevFiles) => {
      // Create a new array with both previous and new files
      const combinedFiles = [...prevFiles, ...files];

      // Remove any duplicates based on file name
      const uniqueFiles = combinedFiles.filter(
        (file, index, self) =>
          index === self.findIndex((f) => f.name === file.name)
      );

      return uniqueFiles;
    });
  };

  const handleRemoveSelectedFile = (indexToRemove: number) => {
    setSelectedFiles((files) =>
      files.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleUploadSubmit = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setUploading(true);

      // Upload each file one by one
      for (const file of selectedFiles) {
        await uploadDocument(file);
      }

      toast.success(
        `${selectedFiles.length} document${
          selectedFiles.length > 1 ? "s" : ""
        } uploaded successfully!`
      );
      setSelectedFiles([]); // Clear selected files after successful upload

      // Refresh documents for this workspace
      if (selectedWorkspace?.ws_id) {
        fetchWorkspaceDocuments(selectedWorkspace.ws_id);
      }
    } catch (error) {
      console.error("Failed to upload PDFs:", error);
      toast.error("Failed to upload documents");
    } finally {
      setUploading(false);
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
        </div>
      </header>

      {/* Workspace Content */}
      <div className="flex flex-col flex-grow p-4 md:p-6 bg-gray-50 overflow-auto">
        <div className="max-w-5xl mx-auto w-full">
          <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200 space-y-4">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-[#2C2C2E]">
                Upload Documents
              </h2>
              <MultiFileUpload
                onFilesSelected={handleFilesSelected}
                onRemoveFile={handleRemoveSelectedFile}
                disabled={uploading}
                onUploadSubmit={handleUploadSubmit}
                selectedFiles={selectedFiles}
              />
            </div>

            {workspaceDocuments.length > 0 && (
              <div className="pt-3 border-t border-gray-100">
                <h2 className="text-lg font-semibold text-[#2C2C2E] mb-2">
                  Uploaded Documents
                </h2>
                <DocumentList
                  documents={workspaceDocuments}
                  onDelete={deleteDocument}
                />
              </div>
            )}
          </div>

          {/* Document List - This will show documents from the API */}

          {/* Loading state */}
          {isLoadingDocs && (
            <div className="flex justify-center py-8 mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0A66C2]"></div>
            </div>
          )}

          {/* Empty state */}
          {!isLoadingDocs && workspaceDocuments.length === 0 && !uploading && (
            <div className="flex flex-col items-center justify-center py-8 bg-white rounded-lg shadow-sm border border-gray-100 text-center mt-6">
              <FileText className="h-12 w-12 text-gray-300 mb-3" />
              <h2 className="text-lg font-medium text-[#2C2C2E] mb-1">
                No documents yet
              </h2>
              <p className="text-gray-500 max-w-md">
                Upload PDF documents to start getting insights from your data.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Query Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex items-center gap-3 max-w-5xl mx-auto">
          <FileText className="h-5 w-5 text-[#0A66C2]" />
          <Input
            type="text"
            placeholder="Ask about your documents..."
            className="flex-1 focus-visible:ring-[#0A66C2]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button className="bg-[#A259FF] hover:bg-[#A259FF]/90 text-white">
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceView;
