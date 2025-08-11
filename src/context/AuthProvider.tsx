import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";
import config from "../config";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  isAuthenticated: boolean;
  user: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {

  const apiBaseUrl: string = config.apiBaseUrl;
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => sessionStorage.getItem("isAuthenticated") === "true"
  );
  const [user, setUser] = useState<"" | null>(
    () => JSON.parse(sessionStorage.getItem("user") || "null")
  );

  const login = async (correo: string, contrasena: string) => {
    try {
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contrasena }),
      });

      if (!response.ok) {
        throw new Error("Error en el login");
      }



      const data = await response.json();

      sessionStorage.setItem("isAuthenticated", data.logged.toString());
      sessionStorage.setItem("jwt", data.jwt);
      sessionStorage.setItem("username", data.username);
      saveToSessionStorage("usuario", data.usuario);
      saveToSessionStorage("persona", data.persona);
      setIsAuthenticated(true);
      setUser(data.usuario);

      if(data.usuario.rol.nombre === "Admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/usuario/dashboard");
      }
    } catch (error) {
      console.error("Error en el login:", error);
      throw error;
    }
  };

  const saveToSessionStorage = (prefix: string, obj: any) => {
    for (const key in obj) {
      if (!obj.hasOwnProperty(key)) continue;

      const value = obj[key];
      const storageKey = `${prefix}_${key}`;

      if (value === null) {
        sessionStorage.setItem(storageKey, "null");
      } else if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        sessionStorage.setItem(storageKey, value.toString());
      } else if (typeof value === "object" && !Array.isArray(value)) {
        saveToSessionStorage(storageKey, value);
      }
    }
  };


  const logout = async () => {
    try {
      const tokenjwt = sessionStorage.getItem("jwt");
      const response = await fetch(`${apiBaseUrl}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenjwt }),
      });

      if (!response.ok) {
        throw new Error("Error al cerrar sesión");
      }

      if(response.status === 200){
        sessionStorage.clear();
        navigate("/login");
      }

    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
    

    sessionStorage.removeItem("isAuthenticated");
    sessionStorage.removeItem("usuario");
    sessionStorage.removeItem("persona");
    sessionStorage.removeItem("jwt");

    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};
