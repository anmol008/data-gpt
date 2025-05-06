
import React from 'react';
import { Document } from '@/types/api';
import { FileText, CheckCircle, X } from 'lucide-react';

interface DocumentListProps {
  documents: Document[];
  onDelete?: (docId: number) => Promise<void>;
}

const DocumentList = ({ documents = [], onDelete }: DocumentListProps) => {
  // Ensure that documents is always an array
  const documentArray = Array.isArray(documents) ? documents : [];
  
  const handleDelete = async (e: React.MouseEvent, docId: number) => {
    e.stopPropagation();
    if (onDelete) {
      try {
        await onDelete(docId);
      } catch (error) {
        console.error("Failed to delete document:", error);
      }
    }
  };

  if (documentArray.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {documentArray.map((doc) => (
        <div
          key={doc.ws_doc_id}
          className="flex items-center bg-[#F8F9FA] border border-[#E9ECEF] rounded-md p-3 hover:bg-[#F1F3F5] transition-colors"
        >
          <CheckCircle className="h-5 w-5 text-[#1ABC9C] mr-3 flex-shrink-0" />
          <div className="flex items-center flex-grow overflow-hidden">
            <FileText className="h-5 w-5 text-[#0A66C2] mr-2 flex-shrink-0" />
            <span className="text-[#2C2C2E] truncate" title={doc.ws_doc_name}>
              {doc.ws_doc_name}
            </span>
          </div>
          {onDelete && doc.ws_doc_id && (
            <button 
              onClick={(e) => handleDelete(e, doc.ws_doc_id!)}
              className="ml-2 p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default DocumentList;
