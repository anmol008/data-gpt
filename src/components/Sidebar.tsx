
import React, { useState, useEffect } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { WorkspaceWithDocuments } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Folder,
  FileText,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Upload,
  History,
  Link,
  HelpCircle,
} from "lucide-react";
import WorkspaceDialog from "./WorkspaceDialog";
import UploadModal from "./UploadModal";
import UrlModal from "./UrlModal";
import ChatHistoryDialog from "./ChatHistoryDialog";
import FreeTierModal from "./FreeTierModal";
import ProductTour from "./ProductTour";
import logoWhite from "./../../public/icons/logo-white.png";
import SidebarNav from "./SidebarNav";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "react-router-dom";
import ConfirmDialog from "./DeleteModal";
import * as Tooltip from '@radix-ui/react-tooltip';

interface SidebarProps {
  onWorkspaceSelect?: () => void;
}

const Sidebar = ({ onWorkspaceSelect }: SidebarProps) => {
  const location = useLocation();
  const { userRole, isAppValid } = useAuth();
  const {
    workspaces,
    selectedWorkspace,
    selectWorkspace,
    deleteWorkspace,
    loadPromptHistory,
    currentSessionDocuments,
    chatMessages,
  } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [editWorkspace, setEditWorkspace] =
    useState<WorkspaceWithDocuments | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [historyWorkspaceId, setHistoryWorkspaceId] = useState<number | null>(
    null
  );
  const [isFreeTierModalOpen, setIsFreeTierModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] =
    useState<WorkspaceWithDocuments | null>(null);
  const [runTour, setRunTour] = useState(false);

  // Show workspace content on workspace routes (both /workspace and /workspace/:id)
  const showWorkspaceContent = location.pathname.startsWith("/workspace");

  // Determine if URL or PDF has been used in the current session
  const hasPdfUploaded = currentSessionDocuments.some((doc) =>
    doc.endsWith(".pdf")
  );
  const hasUrlScraped = currentSessionDocuments.some(
    (doc) => !doc.endsWith(".pdf") && doc.startsWith("http")
  );

  console.log(currentSessionDocuments)

  // Helper function to check if a workspace has chat history
  const hasWorkspaceChatHistory = (
    workspaceId: number | undefined
  ): boolean => {
    if (!workspaceId) return false;
    return chatMessages[workspaceId]?.length > 0 || false;
  };

  const checkFreeTierAccess = (): boolean => {
    if (!isAppValid) {
      setIsFreeTierModalOpen(true);
      return false;
    }
    return true;
  };

  const handleWorkspaceClick = (workspace: WorkspaceWithDocuments) => {
    selectWorkspace(workspace);
    // Close mobile sidebar when workspace is selected
    if (onWorkspaceSelect) {
      onWorkspaceSelect();
    }
  };

  const handleEditClick = (
    workspace: WorkspaceWithDocuments,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setEditWorkspace(workspace);
  };

  const handleDeleteClick = (
    workspace: WorkspaceWithDocuments,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setConfirmDelete(workspace);
  };

  const handleUploadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (checkFreeTierAccess()) {
      setIsUploadModalOpen(true);
    }
  };

  const handleUrlClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (checkFreeTierAccess()) {
      setIsUrlModalOpen(true);
    }
  };

  const handleCreateWorkspaceClick = () => {
    if (checkFreeTierAccess()) {
      setCreateDialogOpen(true);
    }
  };

  const handleHistoryClick = (
    workspace: WorkspaceWithDocuments,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (workspace.ws_id) {
      setHistoryWorkspaceId(workspace.ws_id);
      setIsHistoryDialogOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (confirmDelete?.ws_id) {
      await deleteWorkspace(confirmDelete.ws_id);
      
      // After deletion, switch to the most recent workspace if the deleted one was selected
      if (selectedWorkspace?.ws_id === confirmDelete.ws_id) {
        const remainingWorkspaces = workspaces.filter(ws => ws.ws_id !== confirmDelete.ws_id);
        if (remainingWorkspaces.length > 0) {
          // Sort by date and then by ID to get the most recent workspace
          const mostRecentWorkspace = remainingWorkspaces
            .sort((a, b) => {
              const dateDiff = new Date(b.ws_date).getTime() - new Date(a.ws_date).getTime();
              if (dateDiff !== 0) return dateDiff;
              return (b.ws_id || 0) - (a.ws_id || 0);
            })[0];
          selectWorkspace(mostRecentWorkspace);
        }
      }
    }
    setConfirmDelete(null);
  };

  const handleStartTour = () => {
    setRunTour(true);
  };

  const handleTourEnd = () => {
    setRunTour(false);
  };

  return (
    <div className="h-screen flex flex-col bg-sidebar border-r border-sidebar-border w-72 overflow-hidden">
      <div className="flex justify-center">
        <img src={logoWhite} alt="Logo" className="w-64 h-[85px] mx-auto p-1" />
      </div>

      {/* SidebarNav always rendered, regardless of role */}
      <div className="border-b border-sidebar-border pb-2">
        <SidebarNav />
      </div>

      {/* Show workspace content when on any workspace route */}
      {showWorkspaceContent && (
        <>
          <div className="px-3 py-3">
            <Button
              onClick={handleCreateWorkspaceClick}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-md h-9 shadow-sm flex items-center justify-center"
              data-tour="create-workspace"
            >
              <Plus className="h-4 w-4 mr-2" /> New Workspace
            </Button>
          </div>

          <div className="px-3 mb-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search workspaces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-input border-border text-foreground focus-visible:ring-ring h-9 text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-2 min-h-0">
            <div className="flex items-center text-sm font-medium text-muted-foreground mb-2">
              <Folder className="h-4 w-4 mr-2" /> WORKSPACES
            </div>

            <div className="space-y-1 mt-2">
              {Object.entries(
                workspaces
                  .filter((ws) =>
                    ws.ws_name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .sort((a, b) => {
                    // Sort by date descending, then by ws_id descending
                    const dateDiff = new Date(b.ws_date).getTime() - new Date(a.ws_date).getTime();
                    if (dateDiff !== 0) return dateDiff;
                    return (b.ws_id || 0) - (a.ws_id || 0);
                  })
                  .reduce((acc: Record<string, WorkspaceWithDocuments[]>, ws) => {
                    const dateKey = ws.ws_date;
                    if (!acc[dateKey]) acc[dateKey] = [];
                    acc[dateKey].push(ws);
                    return acc;
                  }, {})
              )
                .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
                .map(([date, workspaceList]) => (
                  <div key={date} className="space-y-1 mb-2">
                    <div className="text-sm font-medium pl-1 py-1">
                      <span className="text-primary font-semibold">
                        {new Date(date).toLocaleDateString("en-GB")}
                      </span>
                    </div>

                    {workspaceList
                      .sort((a, b) => (b.ws_id || 0) - (a.ws_id || 0))
                      .map((workspace) => {
                        const wsId = workspace.ws_id || 0;
                        const hasHistory = hasWorkspaceChatHistory(wsId);
                        const isSelected = selectedWorkspace?.ws_id === wsId;
                        console.log(workspace)
                        // Determine if workspace has URL or PDF content based on chat history or current session
                        const workspaceHasPdf = isSelected
                          ? hasPdfUploaded
                          : workspace.documents?.length > 0;

                        return (
                          <div
                            key={wsId}
                            onClick={() => handleWorkspaceClick(workspace)}
                            className={`flex items-center justify-between p-1 rounded-md cursor-pointer group transition-colors duration-200 ${isSelected
                              ? "bg-sidebar-accent border-l-4 border-primary"
                              : "hover:bg-sidebar-accent border-l-4 border-transparent"
                              }`}
                          >
                            {/* Left Side: Workspace info */}
                            <div className="flex items-start space-x-2">
                              <FileText
                                className={`h-4 w-4 mt-0.5 ${isSelected ? "text-primary" : "text-muted-foreground"
                                  }`}
                              />
                              <div>
                                <p className="flex text-sm font-medium text-sidebar-foreground">
                                  <p className="text-sm font-medium text-sidebar-foreground">
                                    {workspace.ws_name.length > 20
                                      ? `${workspace.ws_name.slice(0, 25)}...`
                                      : workspace.ws_name}
                                  </p>
                                </p>
                                <div className="flex items-center space-x-2 mt-0.5">
                                  {/* Buttons*/}
                                  <div className="flex items-center space-x-2 mt-0.5">
                                    <p className="text-xs text-muted-foreground">
                                      {workspace.fileCount} {workspace.fileCount === 1 ? 'file' : 'files'}
                                    </p>
                                    <Tooltip.Provider delayDuration={0}>
                                      <div className="flex gap-2">
                                        <Tooltip.Root>
                                          <Tooltip.Trigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                              className={`h-4 w-6 p-0 ${isSelected ? "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent" : "text-muted-foreground cursor-not-allowed"}`}
                                              onClick={(e) => {
                                                if (isSelected) handleHistoryClick(workspace, e);
                                                e.stopPropagation();
                                              }}
                                              disabled={!isSelected}
                                              data-tour="history-info"
                                            >
                                              <History className="h-4 w-6" />
                                            </Button>
                                          </Tooltip.Trigger>
                                          <Tooltip.Content
                                            side="top"
                                            className="rounded bg-black px-2 py-1 text-xs text-white"
                                            sideOffset={5}
                                          >
                                            View History
                                          </Tooltip.Content>
                                        </Tooltip.Root>

                                        <Tooltip.Root>
                                          <Tooltip.Trigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                              className={`h-4 w-6 p-0 ${isSelected ? "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent" : "text-muted-foreground cursor-not-allowed"}`}
                                              onClick={(e) => {
                                                if (isSelected) handleUrlClick(e);
                                                e.stopPropagation();
                                              }}
                                              disabled={!isSelected}
                                              data-tour="scrape-website"
                                            >
                                              <Link className="h-4 w-6" />
                                            </Button>
                                          </Tooltip.Trigger>
                                          <Tooltip.Content
                                            side="top"
                                            className="rounded bg-black px-2 py-1 text-xs text-white"
                                            sideOffset={5}
                                          >
                                            Scrape Website
                                          </Tooltip.Content>
                                        </Tooltip.Root>

                                        <Tooltip.Root>
                                          <Tooltip.Trigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className={`h-4 w-6 p-0 ${isSelected ? "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent" : "text-muted-foreground cursor-not-allowed"}`}
                                              onClick={(e) => {
                                                if (isSelected) handleUploadClick(e);
                                                e.stopPropagation();
                                              }}
                                              disabled={!isSelected}
                                              data-tour="upload-document"
                                            >
                                              <Upload className="h-4 w-6" />
                                            </Button>
                                          </Tooltip.Trigger>
                                          <Tooltip.Content
                                            side="top"
                                            className="rounded bg-black px-2 py-1 text-xs text-white"
                                            sideOffset={5}
                                          >
                                            Upload Document
                                          </Tooltip.Content>
                                        </Tooltip.Root>
                                      </div>
                                    </Tooltip.Provider>
                                    {/* Dropdown */}
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-4 w-6 p-0 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
                                          data-tour="edit-workspace"
                                        >
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent
                                        align="end"
                                        className="w-40"
                                      >
                                        <DropdownMenuItem
                                          onClick={(e) => handleEditClick(workspace, e)}
                                          className="focus:bg-accent focus:text-accent-foreground"
                                        >
                                          <Edit className="mr-2 h-4 w-4" />
                                          <span>Edit</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          className="text-destructive focus:text-destructive focus:bg-accent"
                                          onClick={(e) => handleDeleteClick(workspace, e)}
                                        >
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          <span>Delete</span>
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ))}
            </div>
          </div>

          {/* Footer Stats */}
          <div className="mt-auto border-t border-sidebar-border p-3 bg-sidebar">
            <div className="flex items-center justify-between text-sm text-muted-foreground py-1.5">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2 text-primary" />
                <span>Documents</span>
              </div>
              <span className="font-semibold">
                {workspaces.reduce(
                  (sum, ws) => sum + (ws.documents?.length || 0),
                  0
                )}
              </span>
            </div>
            
            {/* Take a Tour Button */}
            <div className="mt-3 pt-3 border-t border-sidebar-border">
              <Button
                onClick={handleStartTour}
                variant="outline"
                className="w-full h-8 text-sm"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Take a Tour
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Dialogs */}
      <WorkspaceDialog
        isOpen={isCreateDialogOpen || !!editWorkspace}
        onClose={() => {
          setCreateDialogOpen(false);
          setEditWorkspace(null);
        }}
        workspace={editWorkspace}
      />

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      <UrlModal
        isOpen={isUrlModalOpen}
        onClose={() => setIsUrlModalOpen(false)}
      />

      {historyWorkspaceId && (
        <ChatHistoryDialog
          isOpen={isHistoryDialogOpen}
          onClose={() => setIsHistoryDialogOpen(false)}
          workspaceId={historyWorkspaceId}
          onSelectPrompt={(prompt) => {
            loadPromptHistory(prompt);
          }}
        />
      )}

      <FreeTierModal
        isOpen={isFreeTierModalOpen}
        onClose={() => setIsFreeTierModalOpen(false)}
      />

      {confirmDelete && (
        <ConfirmDialog
          isOpen={!!confirmDelete}
          onClose={() => setConfirmDelete(null)}
          onConfirm={handleConfirmDelete}
          title={`Delete "${confirmDelete.ws_name}"?`}
          description="Are you sure you want to delete this workspace? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}

      {/* Product Tour */}
      <ProductTour runTour={runTour} onTourEnd={handleTourEnd} />
    </div>
  );
};

export default Sidebar;
