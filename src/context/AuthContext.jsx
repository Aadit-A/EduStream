import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getCurrentUser,
  isLoggedIn as checkIsLoggedIn,
  loginUser,
  registerUser,
  logoutUser as rawLogoutUser,
} from "../services/auth.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(getCurrentUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    setLoading(false);

    // Listen for storage changes across tabs or window events
    const handleStorageChange = () => {
      setCurrentUser(getCurrentUser());
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = async (email, password) => {
    const result = await loginUser(email, password);
    if (result.success) {
      setCurrentUser(result.user);
    }
    return result;
  };

  const register = async (userData) => {
    const result = await registerUser(userData);
    return result;
  };

  const logout = () => {
    rawLogoutUser(false);
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    setCurrentUser,
    isLoggedIn: Boolean(currentUser),
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
