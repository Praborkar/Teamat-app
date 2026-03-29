import React, { createContext, useEffect, useState } from "react";
import api from "../api/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto-login using stored token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    async function fetchUser() {
      try {
        const { data } = await api.get("/auth/me"); // ✔ token auto-attached
        setUser(data.user);
      } catch (err) {
        console.error("Invalid token");
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
