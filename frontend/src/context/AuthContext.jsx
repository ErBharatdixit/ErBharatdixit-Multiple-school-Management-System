import { createContext, useContext, useState, useEffect } from "react";
import api from "../api";

const AuthContext = createContext(null);

export const useAuth = () => {
      const context = useContext(AuthContext);
      if (!context) {
            throw new Error("useAuth must be used within AuthProvider");
      }
      return context;
};

export const AuthProvider = ({ children }) => {
      const [user, setUser] = useState(null);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
            // Check if user is logged in on mount
            const token = localStorage.getItem("token");
            const savedUser = localStorage.getItem("user");

            if (token && savedUser) {
                  setUser(JSON.parse(savedUser));
            }
            setLoading(false);
      }, []);

      const login = async (email, password) => {
            try {
                  const { data } = await api.post("/auth/login", { email, password });
                  localStorage.setItem("token", data.token);
                  localStorage.setItem("user", JSON.stringify(data));
                  setUser(data);
                  return { success: true, data };
            } catch (error) {
                  return {
                        success: false,
                        error: error.response?.data?.message || "Login failed"
                  };
            }
      };

      const register = async (userData) => {
            try {
                  const { data } = await api.post("/auth/register", userData);
                  localStorage.setItem("token", data.token);
                  localStorage.setItem("user", JSON.stringify(data));
                  setUser(data);
                  return { success: true, data };
            } catch (error) {
                  return {
                        success: false,
                        error: error.response?.data?.message || "Registration failed"
                  };
            }
      };

      const logout = () => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
      };

      const value = {
            user,
            loading,
            login,
            register,
            logout,
            isAuthenticated: !!user,
      };

      return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
