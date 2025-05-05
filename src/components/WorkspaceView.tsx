
import React, { useState, useRef } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, FileText } from 'lucide-react';
import { Document } from '@/types/api';
import { toast } from 'sonner';
import DocumentList from './DocumentList';

const WorkspaceView = () => {
  const { selectedWorkspace, uploadDocument } = useWorkspace();
  const [query, setQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    
    try {
      await uploadDocument(file);
      // Clear the input to allow the same file to be uploaded again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error("Failed to upload PDF:", error);
    }
  };
  
  if (!selectedWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-semibold text-gray-600">Welcome to DataGPT</h2>
        <p className="text-gray-500 mt-2">Select a workspace to get started</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Workspace Header */}
      <header className="border-b border-gray-200 p-4">
        <h1 className="text-2xl font-semibold text-datagpt-blue">DataGPT</h1>
      </header>
      
      {/* Workspace Content */}
      <div className="flex flex-col items-center justify-center flex-grow p-6">
        <h2 className="text-2xl font-semibold text-datagpt-blue mb-2">
          Welcome to {selectedWorkspace.ws_name}
        </h2>
        <p className="text-gray-600 text-center mb-8 max-w-md">
          Start querying your documents or upload PDFs to get insights from your data.
        </p>
        
        {/* Upload Button */}
        <Button
          onClick={handleUploadClick}
          className="bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 flex items-center gap-2 mb-10"
        >
          <Upload className="h-5 w-5" />
          <span>Upload PDF Documents</span>
        </Button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="application/pdf"
          onChange={handleFileChange}
        />
        
        {/* Document List */}
        {selectedWorkspace.documents.length > 0 && (
          <DocumentList documents={selectedWorkspace.documents} />
        )}
      </div>
      
      {/* Query Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <FileText className="h-5 w-5 text-datagpt-blue" />
          <Input 
            type="text" 
            placeholder="Ask about your documents..." 
            className="flex-1"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button className="bg-datagpt-blue hover:bg-datagpt-dark-blue">
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceView;
