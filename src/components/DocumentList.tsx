
import React from 'react';
import { Document } from '@/types/api';
import { FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkspace } from '@/context/WorkspaceContext';

interface DocumentListProps {
  documents: Document[];
}

const DocumentList = ({ documents }: DocumentListProps) => {
  const { deleteDocument } = useWorkspace();

  const handleDeleteDocument = async (docId?: number) => {
    if (docId) {
      try {
        await deleteDocument(docId);
      } catch (error) {
        console.error("Failed to delete document:", error);
      }
    }
  };

  if (documents.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mt-4">
      <h3 className="text-lg font-medium mb-4">Uploaded Documents</h3>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="divide-y divide-gray-200">
          {documents.map((doc) => (
            <div key={doc.ws_doc_id} className="flex items-center justify-between p-4 hover:bg-gray-50">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-datagpt-blue mr-3" />
                <div>
                  <p className="font-medium">{doc.ws_doc_name}</p>
                  <p className="text-sm text-gray-500">{doc.ws_doc_extn.toUpperCase()}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-red-500"
                onClick={() => handleDeleteDocument(doc.ws_doc_id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentList;
