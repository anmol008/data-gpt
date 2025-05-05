
import React from 'react';
import { Document } from '@/types/api';
import { FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DocumentListProps {
  documents: Document[];
  onDelete?: (docId: number) => Promise<void>;
}

const DocumentList = ({ documents, onDelete }: DocumentListProps) => {
  const getFileIcon = (extension: string) => {
    return <FileText className="h-5 w-5 text-blue-500" />;
  };
  
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

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <div 
          key={doc.ws_doc_id} 
          className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            {getFileIcon(doc.ws_doc_extn)}
            <div>
              <p className="font-medium text-gray-700">{doc.ws_doc_name}</p>
              <p className="text-xs text-gray-500">
                {doc.ws_doc_extn.toUpperCase()} • Added {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
          
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => doc.ws_doc_id && handleDelete(e, doc.ws_doc_id)}
              className="text-gray-400 hover:text-red-500 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};

export default DocumentList;
