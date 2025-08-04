import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, fallback }) => {
  const { isAuthenticated, isAppValid, expiryDate, isLoading, checkSubscription } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <Alert className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              Please sign in to access this application.
            </AlertDescription>
          </Alert>
        </div>
      )
    );
  }

  if (!isAppValid) {
    const isExpired = expiryDate ? new Date(expiryDate) <= new Date() : true;
    
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>
            {isExpired ? 'Subscription Expired' : 'Invalid Subscription'}
          </AlertTitle>
          <AlertDescription className="mb-4">
            {isExpired 
              ? `Your subscription expired on ${new Date(expiryDate || '').toLocaleDateString()}. Please renew to continue using the application.`
              : 'Your subscription is not valid. Please contact support or renew your subscription.'
            }
          </AlertDescription>
          <div className="flex gap-2">
            <Button onClick={checkSubscription} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Again
            </Button>
            <Button size="sm">
              Renew Subscription
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;