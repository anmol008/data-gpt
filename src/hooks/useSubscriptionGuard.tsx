import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

/**
 * Hook to guard features based on subscription status
 * Use this in components that need subscription validation
 */
export const useSubscriptionGuard = () => {
  const { isAppValid, expiryDate } = useAuth();

  const isFeatureAccessible = () => {
    if (!isAppValid) {
      const isExpired = expiryDate ? new Date(expiryDate) <= new Date() : true;
      toast({
        title: "Access Restricted",
        description: isExpired 
          ? "Your subscription has expired. Please renew to access this feature."
          : "This feature requires a valid subscription.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const withSubscriptionCheck = <T extends any[], R>(
    fn: (...args: T) => R
  ): (...args: T) => R => {
    return (...args: T): R => {
      if (!isFeatureAccessible()) {
        // Return a promise that rejects for async functions, or undefined for sync
        if (fn.constructor.name === 'AsyncFunction' || typeof fn === 'function' && fn.toString().includes('async')) {
          return Promise.reject(new Error('Subscription required')) as R;
        }
        return undefined as R;
      }
      return fn(...args);
    };
  };

  return {
    isAppValid,
    expiryDate,
    isFeatureAccessible,
    withSubscriptionCheck,
  };
};