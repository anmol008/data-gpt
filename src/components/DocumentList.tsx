
import React from 'react';
import { Document } from '@/types/api';
import { FileText, Trash2, FolderOpen, FolderClosed, File, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface DocumentListProps {
  documents: Document[];
  onDelete?: (docId: number) => Promise<void>;
}

const DocumentList = ({ documents = [], onDelete }: DocumentListProps) => {
  const [isOpen, setIsOpen] = React.useState(true);
  
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
      <h2 className="text-lg font-medium text-[#2C2C2E] mb-2">Uploaded Documents</h2>
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full border border-gray-200 rounded-lg overflow-hidden bg-white"
      >
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-3 bg-white cursor-pointer hover:bg-gray-50 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              {isOpen ? (
                <FolderOpen className="h-5 w-5 text-[#0A66C2]" />
              ) : (
                <FolderClosed className="h-5 w-5 text-[#0A66C2]" />
              )}
              <h3 className="font-medium text-[#2C2C2E]">
                Documents ({documentArray.length})
              </h3>
            </div>
            <span className="text-sm text-gray-500">
              {isOpen ? 'Hide' : 'Show'}
            </span>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {documentArray.map((doc) => (
              <div
                key={doc.ws_doc_id}
                className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-md p-2 pl-3 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center overflow-hidden">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mr-2" />
                  <span className="text-sm text-[#2C2C2E] truncate" title={doc.ws_doc_name}>
                    {doc.ws_doc_name}
                  </span>
                </div>
                
                {doc.ws_doc_id && onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDelete(e, doc.ws_doc_id!)}
                    className="p-0 h-6 w-6 ml-1 text-gray-400 hover:text-red-500 hover:bg-transparent"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default DocumentList;
