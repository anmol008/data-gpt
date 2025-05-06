
import React, { useState, useRef } from 'react';
import { Upload, X, File, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MultiFileUploadProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  onUploadSubmit?: () => void;
  selectedFiles: File[];
}

const MultiFileUpload = ({ 
  onFilesSelected, 
  disabled = false, 
  onUploadSubmit,
  selectedFiles
}: MultiFileUploadProps) => {
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
    
    const newFiles: File[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check if the file is a PDF
      if (!file.type.includes('pdf')) {
        continue;
      }
      
      newFiles.push(file);
    }
    
    if (newFiles.length > 0) {
      onFilesSelected(newFiles);
    }
    
    // Clear the input to allow the same file to be uploaded again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleRemoveFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    onFilesSelected(updatedFiles);
  };
  
  return (
    <div className="w-full">
      {selectedFiles.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Selected Documents</h3>
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <div 
                key={`${file.name}-${index}`}
                className="flex items-center bg-gray-50 border border-gray-200 rounded-md p-1.5 pl-2"
              >
                <File className="h-3.5 w-3.5 text-[#0A66C2] mr-1.5" />
                <span className="text-xs text-[#2C2C2E] truncate max-w-[150px]">
                  {file.name}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-1 p-0 h-5 w-5 rounded-full hover:bg-gray-200"
                  onClick={() => handleRemoveFile(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex items-center gap-3">
        <Button
          type="button"
          onClick={handleUploadClick}
          disabled={disabled}
          className="bg-[#A259FF] hover:bg-[#A259FF]/90 text-white"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload PDF{selectedFiles.length !== 1 ? "s" : ""}
        </Button>
        
        {selectedFiles.length > 0 && onUploadSubmit && (
          <Button
            onClick={onUploadSubmit}
            className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white"
            disabled={disabled}
          >
            <File className="h-4 w-4 mr-2" />
            Upload {selectedFiles.length} Document{selectedFiles.length !== 1 ? "s" : ""}
          </Button>
        )}
        
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="application/pdf"
          onChange={handleFileChange}
          multiple
        />
      </div>
    </div>
  );
};

export default MultiFileUpload;
