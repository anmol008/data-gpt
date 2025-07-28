
import React from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { FileText, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SessionInfo = () => {
  const { selectedWorkspace, chatMessages } = useWorkspace();

  if (!selectedWorkspace) return null;

  const workspaceMessages = chatMessages[selectedWorkspace.ws_id || 0] || [];
  const messageCount = workspaceMessages.length;

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg">Session Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Session Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-300">
            <MessageCircle className="h-4 w-4 mr-2" />
            <span>{messageCount} messages</span>
          </div>
          <div className="flex items-center text-gray-300">
            <FileText className="h-4 w-4 mr-2" />
            <span>{selectedWorkspace.documents.length} documents</span>
          </div>
        </div>

        {/* Documents List */}
        {selectedWorkspace.documents.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Documents</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {selectedWorkspace.documents.map((doc) => (
                <div
                  key={doc.ws_doc_id}
                  className="flex items-center p-2 bg-gray-700 rounded text-sm"
                >
                  <FileText className="h-4 w-4 text-blue-400 mr-2 flex-shrink-0" />
                  <span className="text-gray-200 truncate" title={doc.ws_doc_name}>
                    {doc.ws_doc_name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {selectedWorkspace.documents.length === 0 && (
          <div className="text-center py-4">
            <FileText className="h-8 w-8 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No documents uploaded yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SessionInfo;
