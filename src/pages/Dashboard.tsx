
import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import WorkspaceView from '@/components/WorkspaceView';
import SubscriptionStatus from '@/components/SubscriptionStatus';
import { WorkspaceProvider } from '@/context/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

const Dashboard = () => {
  const [showSubscriptionStatus, setShowSubscriptionStatus] = useState(false);

  return (
    <WorkspaceProvider>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b">
            <h1 className="text-2xl font-bold">DataGPT Dashboard</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSubscriptionStatus(!showSubscriptionStatus)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Account
            </Button>
          </div>
          
          {showSubscriptionStatus && (
            <div className="p-4 border-b bg-white">
              <SubscriptionStatus />
            </div>
          )}
          
          <WorkspaceView />
        </div>
      </div>
    </WorkspaceProvider>
  );
};

export default Dashboard;
