
import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, FileText, Send, File } from 'lucide-react';
import { toast } from 'sonner';
import DocumentList from './DocumentList';
import MultiFileUpload from './MultiFileUpload';

const WorkspaceView = () => {
  const { selectedWorkspace, uploadDocument, deleteDocument } = useWorkspace();
  const [query, setQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  
  // Clear selected files when workspace changes or when files are uploaded successfully
  useEffect(() => {
    setSelectedFiles([]);
  }, [selectedWorkspace?.ws_id]);
  
  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleUploadSubmit = async () => {
    if (selectedFiles.length === 0) return;
    
    try {
      setUploading(true);
      
      // Upload each file one by one
      for (const file of selectedFiles) {
        await uploadDocument(file);
      }
      
      toast.success(`${selectedFiles.length} document${selectedFiles.length > 1 ? 's' : ''} uploaded successfully!`);
      setSelectedFiles([]); // Clear selected files after successful upload
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
          <h2 className="text-2xl font-semibold text-[#2C2C2E] mb-2">Welcome to DataGPT</h2>
          <p className="text-gray-600 mb-6">Select a workspace or create a new one to get started with your documents.</p>
          <Button 
            onClick={() => document.querySelector('[data-sidebar="trigger"]')?.dispatchEvent(new MouseEvent('click'))}
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
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-[#2C2C2E]">
            <span className="text-[#0A66C2]">DataGPT</span> / {selectedWorkspace.ws_name}
          </h1>
          <div className="flex space-x-2">
            {selectedFiles.length > 0 ? (
              <Button
                onClick={handleUploadSubmit}
                className="bg-[#A259FF] hover:bg-[#A259FF]/90 text-white"
                disabled={uploading}
              >
                {uploading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload {selectedFiles.length} Document{selectedFiles.length > 1 ? "s" : ""}
                  </span>
                )}
              </Button>
            ) : null}
          </div>
        </div>
      </header>
      
      {/* Workspace Content */}
      <div className="flex flex-col flex-grow p-6 bg-gray-50 overflow-auto">
        <div className="max-w-7xl mx-auto w-full">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
            <h2 className="text-xl font-semibold text-[#2C2C2E] mb-4">Upload Documents</h2>
            <MultiFileUpload 
              onFilesSelected={handleFilesSelected}
              disabled={uploading} 
            />
            
            {selectedFiles.length > 0 && (
              <div className="mt-4 text-sm text-gray-600">
                {selectedFiles.length} document{selectedFiles.length > 1 ? "s" : ""} selected. 
                Click "Upload {selectedFiles.length} Document{selectedFiles.length > 1 ? "s" : ""}" 
                to complete the upload.
              </div>
            )}
          </div>
          
          {/* Document List */}
          {selectedWorkspace.documents && (
            <DocumentList 
              documents={selectedWorkspace.documents} 
              onDelete={deleteDocument}
            />
          )}
          
          {/* Empty state */}
          {(!selectedWorkspace.documents || selectedWorkspace.documents.length === 0) && selectedFiles.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow-sm border border-gray-100 text-center mt-6">
              <File className="h-16 w-16 text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold text-[#2C2C2E] mb-2">No documents yet</h2>
              <p className="text-gray-500 mb-6 max-w-md">
                Upload PDF documents to start getting insights from your data.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Query Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
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
