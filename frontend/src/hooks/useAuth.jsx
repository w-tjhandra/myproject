import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("admin_token"));
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem("admin_user");
    return u ? JSON.parse(u) : null;
  });

  const login = (token, username) => {
    localStorage.setItem("admin_token", token);
    localStorage.setItem("admin_user", JSON.stringify({ username }));
    setToken(token);
    setUser({ username });
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
