
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WorkspaceWithDocuments } from "@/types/api";
import { useWorkspace } from "@/context/WorkspaceContext";
import { toast } from "sonner";
import { documentApi, llmApi } from "@/services/api";
import MultiFileUpload from "./MultiFileUpload";

interface UploadDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: WorkspaceWithDocuments;
}

const UploadDocumentsModal: React.FC<UploadDocumentsModalProps> = ({ 
  isOpen, 
  onClose,
  workspace 
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const { uploadDocument, refreshWorkspaces } = useWorkspace();

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles((prevFiles) => {
      const combinedFiles = [...prevFiles, ...files];
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

      // Upload each file to the main API
      for (const file of selectedFiles) {
        await uploadDocument(file);
      }

      // Also upload files to the LLM API
      const llmUploadSuccessful = await llmApi.uploadDocuments(selectedFiles);
      
      if (llmUploadSuccessful) {
        toast.success(
          `${selectedFiles.length} document${
            selectedFiles.length > 1 ? "s" : ""
          } uploaded successfully!`
        );
        setSelectedFiles([]);
        refreshWorkspaces();
        onClose();
      } else {
        toast.error("Failed to process documents for chat. Please try again.");
      }
    } catch (error) {
      console.error("Failed to upload PDFs:", error);
      toast.error("Failed to upload documents");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Documents to {workspace.ws_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <MultiFileUpload
            onFilesSelected={handleFilesSelected}
            onRemoveFile={handleRemoveSelectedFile}
            disabled={uploading}
            onUploadSubmit={handleUploadSubmit}
            selectedFiles={selectedFiles}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDocumentsModal;
