export interface User {
  id: number;
  email: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
  is_app_valid: boolean;
  expiry_date: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAppValid: boolean;
  expiryDate: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => void;
  checkSubscription: () => Promise<void>;
}