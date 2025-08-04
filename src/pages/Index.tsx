
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import SignIn from '@/components/SignIn';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAppValid, isLoading } = useAuth();
  
  useEffect(() => {
    // Only redirect if user is authenticated and has valid subscription
    if (isAuthenticated && isAppValid) {
      navigate('/dashboard');
    }
  }, [navigate, isAuthenticated, isAppValid]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Loading DataGPT...</h1>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAppValid) {
    return <SignIn />;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Redirecting to Dashboard...</h1>
      </div>
    </div>
  );
};

export default Index;
