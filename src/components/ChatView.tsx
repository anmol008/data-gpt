
import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, Source, WorkspaceWithDocuments } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, FileText, Copy, Paperclip, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { llmApi } from "@/services/api";
import { v4 as uuidv4 } from 'uuid';
import { useWorkspace } from "@/context/WorkspaceContext";
import UploadDocumentsModal from "./UploadDocumentsModal";

interface ChatViewProps {
  workspaceId?: number;
  workspaceName?: string;
  workspace?: WorkspaceWithDocuments;
}

const ChatView: React.FC<ChatViewProps> = ({ workspaceId, workspaceName, workspace }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSources, setShowSources] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { selectedWorkspace } = useWorkspace();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await llmApi.queryLLM(input);
      
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: response.answer,
        timestamp: new Date(),
      };

      // Store the sources in the assistant message
      (assistantMessage as any).sources = response.sources;
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error querying LLM:", error);
      toast.error("Failed to get a response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleSourcesVisibility = (messageId: string) => {
    setShowSources(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Chat messages area */}
      <div className="flex-grow overflow-auto p-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div 
                className={`rounded-lg p-4 max-w-[80%] ${
                  message.role === "user"
                    ? "bg-[#A259FF] text-white"
                    : "bg-white border border-gray-200 shadow-sm"
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-grow">
                    <p className={`text-sm whitespace-pre-wrap ${message.role === "user" ? "text-white" : "text-gray-700"}`}>
                      {message.content}
                    </p>
                  </div>
                  <div className="ml-2 flex flex-col items-center">
                    <button
                      onClick={() => copyToClipboard(message.content)}
                      className={`p-1 rounded-full ${
                        message.role === "user" 
                          ? "text-white/70 hover:text-white hover:bg-[#9152e0]" 
                          : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                      }`}
                      title="Copy message"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Sources section for assistant messages */}
                {message.role === "assistant" && (message as any).sources && (
                  <div className="mt-3 pt-2 border-t border-gray-200">
                    <button
                      onClick={() => toggleSourcesVisibility(message.id)}
                      className="flex items-center text-xs text-gray-500 hover:text-gray-700"
                    >
                      {showSources[message.id] ? (
                        <>
                          <ChevronUp className="h-3 w-3 mr-1" /> Hide Citations
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3 mr-1" /> Show Citations
                        </>
                      )}
                    </button>
                    
                    {showSources[message.id] && (
                      <div className="mt-2 space-y-2">
                        {(message as any).sources.map((source: Source) => (
                          <div 
                            key={source.source_id}
                            className="flex items-center text-xs bg-blue-50 p-2 rounded"
                          >
                            <FileText className="h-3 w-3 text-blue-500 mr-2" />
                            <span className="text-blue-600">{source.file}</span>
                            <span className="ml-2 text-gray-500">Page {source.page}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-lg p-4 max-w-[80%] bg-white border border-gray-200 shadow-sm">
                <div className="flex space-x-2 items-center">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex items-center gap-3 max-w-3xl mx-auto">
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:bg-gray-100"
            title="Upload documents"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <div className="w-full relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about your documents..."
              className="pr-10 focus-visible:ring-[#0A66C2]"
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-[#A259FF] hover:bg-[#A259FF]/90 text-white"
          >
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </div>

      {/* Upload Documents Modal */}
      {selectedWorkspace && (
        <UploadDocumentsModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          workspace={selectedWorkspace}
        />
      )}
    </div>
  );
};

export default ChatView;
