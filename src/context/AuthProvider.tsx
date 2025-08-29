import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";
import config from "../config";
import { useNavigate } from "react-router-dom";
import type { Usuario } from "../models/Usuario";
import type { Permiso } from "../models/Permiso";

interface AuthContextType {
  isAuthenticated: boolean;
  user: Usuario | null; // 🔹 aquí puede ir un tipo "Usuario"
  permisos: Permiso[];
  login: (correo: string, contrasena: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const apiBaseUrl: string = config.apiBaseUrl;
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => sessionStorage.getItem("isAuthenticated") === "true"
  );
  const [user, setUser] = useState<any | null>(
    () => JSON.parse(sessionStorage.getItem("user") || "null")
  );
  const [permisos, setPermisos] = useState<any[]>(
    () => JSON.parse(sessionStorage.getItem("permisos") || "[]")
  );

  const login = async (correo: string, contrasena: string) => {
    try {
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contrasena }),
      });

      if (!response.ok) throw new Error("Error en el login");

      const data = await response.json();
      console.log("Datos del usuario:", data);

      // Guardar datos básicos en sessionStorage
      sessionStorage.setItem("isAuthenticated", "true");
      sessionStorage.setItem("jwt", data.jwt || "");
      saveToSessionStorage("usuario", data);
      saveToSessionStorage("persona", data.persona);

      setIsAuthenticated(true);
      setUser(data);

      // 🚀 permisos vienen dentro del rol
      const permisosUsuario = data.usuario.rol?.permisos || [];
      sessionStorage.setItem("permisos", JSON.stringify(permisosUsuario));
      setPermisos(permisosUsuario);

      console.log("Permisos del usuario:", permisosUsuario);

      // Filtrar solo dashboards
      const dashboards = permisosUsuario.filter(
        (p: any) => p.tabla.startsWith("dashboard_") && p.accion === "acceder"
      );

      if (dashboards.length === 1) {
        navigate(getDashboardRoute(dashboards[0].tabla));
      } else if (dashboards.length > 1) {
        navigate("/selector_dashboard");
      } else {
        navigate("/"); // sin dashboards
      }
    } catch (error) {
      console.error("Error en el login:", error);
      throw error;
    }
  };

  const saveToSessionStorage = (prefix: string, obj: any) => {
    for (const key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

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

  const getDashboardRoute = (tabla: string) => {
    switch (tabla) {
      case "dashboard_pqs":
        return "/dashboard/pqs";
      case "dashboard_estadisticas":
        return "/dashboard/estadisticas";
      case "dashboard_admin":
        return "/dashboard/admin";
      default:
        return "/";
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

      if (response.status === 200) {
        sessionStorage.clear();
        navigate("/login");
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }

    sessionStorage.clear();
    setIsAuthenticated(false);
    setUser(null);
    setPermisos([]);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, permisos, login, logout }}
    >
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
