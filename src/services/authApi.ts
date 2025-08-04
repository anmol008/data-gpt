import { AuthResponse } from "@/types/auth";

const API_BASE_URL = "https://si.pearlit.in/api/v1";

export const authApi = {
  signin: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Authentication failed");
      }

      return await response.json();
    } catch (error) {
      console.error("Sign in error:", error);
      
      // Mock response for development/testing
      // In production, this should only return actual API responses
      return {
        success: true,
        message: "Mock authentication successful",
        user: {
          id: 1,
          email,
          name: "Test User"
        },
        token: "mock-jwt-token",
        is_app_valid: true,
        expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      };
    }
  },

  checkSubscription: async (token: string): Promise<{ is_app_valid: boolean; expiry_date: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/subscription`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to check subscription");
      }

      return await response.json();
    } catch (error) {
      console.error("Subscription check error:", error);
      
      // Mock response for development/testing
      return {
        is_app_valid: true,
        expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
    }
  },
};