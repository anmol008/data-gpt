
import React from 'react';
import { Document } from '@/types/api';
import { FileText, CheckCircle } from 'lucide-react';

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
    <div className="mt-6">
      <h2 className="text-xl font-medium text-[#2C2C2E] mb-4">Uploaded Documents</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentList;
