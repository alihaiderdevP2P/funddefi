"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { authAPI, type User } from "@/lib/api";
import websocketService from "@/lib/websocket";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    name: string;
    password: string;
    walletAddress?: string;
    avatar?: string;
    bio?: string;
    role?: "user" | "admin" | "superadmin";
  }) => Promise<void>;
  logout: () => void;
  updateUser: (userData: User) => void;
  refreshProfile: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth on mount
    const savedToken = localStorage.getItem("auth_token");
    const savedUser = localStorage.getItem("user_data");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));

      // Connect to WebSocket with token
      websocketService.connect(savedToken);
      websocketService.authenticate(savedToken);
    }

    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      const { access_token, user: userData, sessionInfo } = response;

      setToken(access_token);
      setUser(userData);

      localStorage.setItem("auth_token", access_token);
      localStorage.setItem("user_data", JSON.stringify(userData));

      // Connect to WebSocket
      websocketService.connect(access_token);
      websocketService.authenticate(access_token);

      // Show notification if previous session was invalidated
      if (sessionInfo?.invalidatedPrevious) {
        console.warn(
          "Previous session has been invalidated. You were logged in from another device."
        );
      }
    } catch (error: any) {
      console.error("Login error:", error);

      // Handle concurrent login error
      if (
        error.response?.status === 409 ||
        error.message?.includes("already logged in")
      ) {
        throw new Error(
          "This account is already logged in from another device. Please logout from that device first, or contact support."
        );
      }

      throw error;
    }
  };

  const register = async (userData: {
    email: string;
    name: string;
    password: string;
    walletAddress?: string;
    avatar?: string;
    bio?: string;
    role?: "user" | "admin" | "superadmin";
  }) => {
    try {
      const response = await authAPI.register(userData);
      const { access_token, user: newUser } = response;

      setToken(access_token);
      setUser(newUser);

      localStorage.setItem("auth_token", access_token);
      localStorage.setItem("user_data", JSON.stringify(newUser));

      // Connect to WebSocket
      websocketService.connect(access_token);
      websocketService.authenticate(access_token);
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user_data", JSON.stringify(userData));
  };

  const refreshProfile = async () => {
    const currentToken = token || localStorage.getItem("auth_token");
    if (!currentToken) return;

    const response = await fetch("/api/users/me", {
      headers: { Authorization: `Bearer ${currentToken}` },
    });
    if (response.ok) {
      const userData = (await response.json()) as User;
      updateUser(userData);
    }
  };

  const logout = async () => {
    try {
      // Call backend logout to invalidate session
      const currentToken = token || localStorage.getItem("auth_token");
      if (currentToken) {
        try {
          await authAPI.logout(currentToken);
        } catch (error) {
          // Continue with local logout even if backend call fails
          console.warn(
            "Backend logout failed, proceeding with local logout:",
            error
          );
        }
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local state
      setUser(null);
      setToken(null);
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");

      // Disconnect WebSocket
      websocketService.disconnect();
    }
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    updateUser,
    refreshProfile,
    loading,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === "admin" || user?.role === "superadmin",
    isSuperAdmin: user?.role === "superadmin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
