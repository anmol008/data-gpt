
import React, { useState } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { WorkspaceWithDocuments } from '@/types/api';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { Folder, FileText, Plus, Search, MoreVertical, Edit, Trash2 } from 'lucide-react';
import WorkspaceDialog from './WorkspaceDialog';

const Sidebar = () => {
  const { workspaces, selectedWorkspace, selectWorkspace } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [editWorkspace, setEditWorkspace] = useState<WorkspaceWithDocuments | null>(null);

  // Filter workspaces based on search query
  const filteredWorkspaces = searchQuery
    ? workspaces.filter(ws => 
        ws.ws_name.toLowerCase().includes(searchQuery.toLowerCase()))
    : workspaces;

  const handleWorkspaceClick = (workspace: WorkspaceWithDocuments) => {
    selectWorkspace(workspace);
  };

  const handleEditClick = (workspace: WorkspaceWithDocuments, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditWorkspace(workspace);
  };

  return (
    <div className="h-screen flex flex-col bg-white border-r border-gray-200 w-72 overflow-hidden">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-datagpt-blue">DataGPT</h1>
      </div>
      
      {/* New Workspace Button */}
      <div className="px-3 py-3">
        <Button 
          onClick={() => setCreateDialogOpen(true)}
          className="w-full bg-datagpt-blue hover:bg-datagpt-dark-blue text-white rounded-md h-10"
        >
          <Plus className="h-5 w-5 mr-2" /> New Workspace
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
            className="pl-9 bg-gray-50 border-gray-200"
          />
        </div>
      </div>
      
      {/* Workspaces Section */}
      <div className="px-3 py-2">
        <div className="flex items-center text-sm font-medium text-gray-500 mb-2">
          <Folder className="h-4 w-4 mr-2" /> WORKSPACES
        </div>
        
        {/* Workspace List */}
        <div className="space-y-1 mt-2">
          {filteredWorkspaces.map((workspace) => (
            <div 
              key={workspace.ws_id} 
              onClick={() => handleWorkspaceClick(workspace)}
              className={`flex items-start justify-between p-2 rounded-md cursor-pointer group ${
                selectedWorkspace?.ws_id === workspace.ws_id 
                  ? 'bg-datagpt-gray' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start space-x-2">
                <FileText className="h-5 w-5 mt-0.5 text-datagpt-blue" />
                <div>
                  <p className="text-sm font-medium">{workspace.ws_name}</p>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {workspace.messageCount} messages • {workspace.fileCount} files
                  </div>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenu.Trigger asChild>
                  <Button 
                    variant="ghost" 
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content align="end">
                  <DropdownMenu.Item onClick={(e) => handleEditClick(workspace, e as React.MouseEvent)}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Item className="text-red-600" onClick={(e) => {
                    e.stopPropagation();
                    if (workspace.ws_id) {
                      const { deleteWorkspace } = useWorkspace();
                      deleteWorkspace(workspace.ws_id);
                    }
                  }}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer Stats */}
      <div className="mt-auto border-t border-gray-200 p-3">
        <div className="flex items-center justify-between text-sm text-gray-600 py-1.5">
          <div className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-datagpt-blue" />
            <span>Documents</span>
          </div>
          <span className="font-semibold">
            {workspaces.reduce((sum, ws) => sum + ws.fileCount, 0)}
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
