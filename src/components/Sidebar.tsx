import React, { useState } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { WorkspaceWithDocuments } from "@/types/api";
import { Dialog } from "@/components/ui/dialog";
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
} from "lucide-react";
import WorkspaceDialog from "./WorkspaceDialog";
import logo from "./../../public/icons/logo-light.png";

const Sidebar = () => {
  const { workspaces, selectedWorkspace, selectWorkspace, deleteWorkspace } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [editWorkspace, setEditWorkspace] = useState<WorkspaceWithDocuments | null>(null);

  const filteredWorkspaces = searchQuery
    ? workspaces.filter((ws) =>
        ws.ws_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : workspaces;

  const handleWorkspaceClick = (workspace: WorkspaceWithDocuments) => {
    selectWorkspace(workspace);
  };

  const handleEditClick = (workspace: WorkspaceWithDocuments, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditWorkspace(workspace);
  };

  const handleDeleteClick = async (workspace: WorkspaceWithDocuments, e: React.MouseEvent) => {
    e.stopPropagation();
    if (workspace.ws_id) {
      await deleteWorkspace(workspace.ws_id);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white border-r border-gray-200 w-72 overflow-hidden">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <img src={logo} alt="logo"/>
      </div>

      {/* New Workspace Button */}
      <div className="px-3 py-3">
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-md h-9 shadow-sm flex items-center justify-center"
        >
          <Plus className="h-4 w-4 mr-2" /> New Workspace
        </Button>
      </div>

      {/* Search Box */}
      <div className="px-3 mb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search workspaces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-gray-50 border-gray-200 focus-visible:ring-blue-500 h-9 text-sm"
          />
        </div>
      </div>

      {/* Scrollable Workspace List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 min-h-0">
        <div className="flex items-center text-sm font-medium text-gray-500 mb-2">
          <Folder className="h-4 w-4 mr-2" /> WORKSPACES
        </div>

        <div className="space-y-1 mt-2">
          {filteredWorkspaces.map((workspace) => (
            <div
              key={workspace.ws_id}
              onClick={() => handleWorkspaceClick(workspace)}
              className={`flex items-start justify-between p-2 rounded-md cursor-pointer group transition-colors duration-200 ${
                selectedWorkspace?.ws_id === workspace.ws_id
                  ? "bg-blue-50 border-l-4 border-blue-500"
                  : "hover:bg-gray-50 border-l-4 border-transparent"
              }`}
            >
              <div className="flex items-start space-x-2">
                <FileText
                  className={`h-4 w-4 mt-0.5 ${
                    selectedWorkspace?.ws_id === workspace.ws_id
                      ? "text-blue-500"
                      : "text-gray-400"
                  }`}
                />
                <div>
                  <p className="text-sm font-medium">{workspace.ws_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {workspace.messageCount || 0} messages • {workspace.documents?.length || 0} files
                  </p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={(e) => handleEditClick(workspace, e)}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-700 focus:bg-red-50"
                    onClick={(e) => handleDeleteClick(workspace, e)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="mt-auto border-t border-gray-200 p-3 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600 py-1.5">
          <div className="flex items-center">
            <FileText className="h-4 w-4 mr-2 text-blue-500" />
            <span>Documents</span>
          </div>
          <span className="font-semibold">
            {workspaces.reduce((sum, ws) => sum + (ws.documents?.length || 0), 0)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600 py-1.5">
          <span>Storage</span>
          <span className="font-semibold">12.4MB</span>
        </div>
      </div>

      {/* Create/Edit Workspace Dialog */}
      <WorkspaceDialog
        isOpen={isCreateDialogOpen || !!editWorkspace}
        onClose={() => {
          setCreateDialogOpen(false);
          setEditWorkspace(null);
        }}
        workspace={editWorkspace}
      />
    </div>
  );
};

export default Sidebar;
