
import React from 'react';
import { Document } from '@/types/api';
import { FileText, Trash2, FolderOpen, FolderClosed } from 'lucide-react';
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
  
  const getFileIcon = (extension: string) => {
    return <FileText className="h-5 w-5 text-[#0A66C2]" />;
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
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full border border-gray-200 rounded-lg overflow-hidden bg-white"
    >
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between p-4 bg-white cursor-pointer hover:bg-gray-50">
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
        <div className="divide-y divide-gray-100">
          {documentArray.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No documents available
            </div>
          ) : (
            documentArray.map((doc) => (
              <div 
                key={doc.ws_doc_id} 
                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(doc.ws_doc_extn)}
                  <div>
                    <p className="font-medium text-[#2C2C2E]">{doc.ws_doc_name}</p>
                    <p className="text-xs text-gray-500">
                      {doc.ws_doc_extn.toUpperCase()} • Added {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {onDelete && doc.ws_doc_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDelete(e, doc.ws_doc_id!)}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default DocumentList;
