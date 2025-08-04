import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '@/types/auth';
import { authApi } from '@/services/authApi';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAppValid: boolean;
  expiryDate: string | null;
  isLoading: boolean;
  token: string | null;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SIGN_IN_SUCCESS'; payload: { user: User; token: string; isAppValid: boolean; expiryDate: string } }
  | { type: 'SIGN_OUT' }
  | { type: 'UPDATE_SUBSCRIPTION'; payload: { isAppValid: boolean; expiryDate: string } };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isAppValid: false,
  expiryDate: null,
  isLoading: true,
  token: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SIGN_IN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isAppValid: action.payload.isAppValid,
        expiryDate: action.payload.expiryDate,
        isLoading: false,
      };
    case 'SIGN_OUT':
      return {
        ...initialState,
        isLoading: false,
      };
    case 'UPDATE_SUBSCRIPTION':
      return {
        ...state,
        isAppValid: action.payload.isAppValid,
        expiryDate: action.payload.expiryDate,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const isSubscriptionExpired = (expiryDate: string | null): boolean => {
    if (!expiryDate) return true;
    return new Date(expiryDate) <= new Date();
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await authApi.signin(email, password);
      
      if (response.success && response.user && response.token) {
        // Validate subscription status - check both flag and expiry date
        const isValidSubscription = response.is_app_valid && !isSubscriptionExpired(response.expiry_date);
        
        dispatch({
          type: 'SIGN_IN_SUCCESS',
          payload: {
            user: response.user,
            token: response.token,
            isAppValid: isValidSubscription,
            expiryDate: response.expiry_date,
          },
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Sign in failed:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      return false;
    }
  };

  const signOut = () => {
    dispatch({ type: 'SIGN_OUT' });
  };

  const checkSubscription = async (): Promise<void> => {
    if (!state.token) return;
    
    try {
      const subscriptionData = await authApi.checkSubscription(state.token);
      const isValidSubscription = subscriptionData.is_app_valid && !isSubscriptionExpired(subscriptionData.expiry_date);
      
      dispatch({
        type: 'UPDATE_SUBSCRIPTION',
        payload: {
          isAppValid: isValidSubscription,
          expiryDate: subscriptionData.expiry_date,
        },
      });
    } catch (error) {
      console.error('Failed to check subscription:', error);
      // On error, assume subscription is invalid for security
      dispatch({
        type: 'UPDATE_SUBSCRIPTION',
        payload: {
          isAppValid: false,
          expiryDate: null,
        },
      });
    }
  };

  // Initialize auth state and check subscription periodically
  useEffect(() => {
    // Auto sign-in for development (remove in production)
    const initAuth = async () => {
      // This is a mock auto-signin for development
      // Remove this in production and implement proper session management
      const success = await signIn("test@example.com", "password");
      if (!success) {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    
    initAuth();
  }, []);

  // Periodically check subscription status (every 5 minutes)
  useEffect(() => {
    if (state.isAuthenticated && state.token) {
      const interval = setInterval(() => {
        checkSubscription();
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [state.isAuthenticated, state.token]);

  const value: AuthContextType = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isAppValid: state.isAppValid,
    expiryDate: state.expiryDate,
    isLoading: state.isLoading,
    signIn,
    signOut,
    checkSubscription,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};