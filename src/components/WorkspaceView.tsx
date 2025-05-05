
import React, { useState, useRef } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, FileText, X, Send, File } from 'lucide-react';
import { toast } from 'sonner';
import DocumentList from './DocumentList';
import PDFViewer from './PDFViewer';

const WorkspaceView = () => {
  const { selectedWorkspace, uploadDocument, deleteDocument } = useWorkspace();
  const [query, setQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    if (!files || files.length === 0) {
      return;
    }
    
    const file = files[0];
    
    // Check if the file is a PDF
    if (!file.type.includes('pdf')) {
      toast.error("Only PDF files are supported");
      return;
    }
    
    setSelectedFile(file);
    
    // Clear the input to allow the same file to be uploaded again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;
    
    try {
      setUploading(true);
      await uploadDocument(selectedFile);
      toast.success("PDF uploaded successfully!");
      setSelectedFile(null);
    } catch (error) {
      console.error("Failed to upload PDF:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleCancelUpload = () => {
    setSelectedFile(null);
  };
  
  if (!selectedWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-white to-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-sm border border-gray-100 max-w-md text-center">
          <FileText className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome to DataGPT</h2>
          <p className="text-gray-600 mb-6">Select a workspace or create a new one to get started with your documents.</p>
          <Button 
            onClick={() => document.querySelector('[data-sidebar="trigger"]')?.dispatchEvent(new MouseEvent('click'))}
            className="bg-blue-500 hover:bg-blue-600 text-white"
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
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">
            <span className="text-blue-500">DataGPT</span> / {selectedWorkspace.ws_name}
          </h1>
          <div className="flex space-x-2">
            <Button
              onClick={handleUploadClick}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Upload className="h-4 w-4 mr-2" />
              <span>Upload PDF</span>
            </Button>
          </div>
        </div>
      </header>
      
      {/* Workspace Content */}
      <div className="flex flex-col flex-grow p-6 bg-gray-50 overflow-auto">
        <div className="max-w-7xl mx-auto w-full">
          {selectedFile ? (
            <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Preview Document</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelUpload}
                  className="text-gray-500 hover:text-red-500"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 min-h-[400px] md:max-w-[50%]">
                  <PDFViewer file={selectedFile} />
                </div>
                
                <div className="flex-1 flex flex-col">
                  <div className="bg-gray-50 p-4 rounded-md mb-4">
                    <h3 className="font-medium text-gray-700 mb-2">File Information</h3>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Name:</span> {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Size:</span> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Type:</span> {selectedFile.type}
                    </p>
                  </div>
                  
                  <div className="mt-auto">
                    <Button
                      onClick={handleUploadSubmit}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white"
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
                          Upload Document
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          
          {/* Document List */}
          {selectedWorkspace.documents && selectedWorkspace.documents.length > 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Documents</h2>
              <DocumentList 
                documents={selectedWorkspace.documents} 
                onDelete={deleteDocument}
              />
            </div>
          ) : (
            !selectedFile && (
              <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow-sm border border-gray-100 text-center">
                <File className="h-16 w-16 text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">No documents yet</h2>
                <p className="text-gray-500 mb-6 max-w-md">
                  Upload PDF documents to start getting insights from your data.
                </p>
                <Button
                  onClick={handleUploadClick}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  <span>Upload your first PDF</span>
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="application/pdf"
                  onChange={handleFileChange}
                />
              </div>
            )
          )}
        </div>
      </div>
      
      {/* Query Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <FileText className="h-5 w-5 text-blue-500" />
          <Input 
            type="text" 
            placeholder="Ask about your documents..." 
            className="flex-1 focus-visible:ring-blue-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceView;
