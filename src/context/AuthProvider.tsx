import type { ReactNode } from "react";
import { createContext, useContext, useState, useEffect } from "react";
import config from "../config";
import { useNavigate, useLocation } from "react-router-dom";
import type { Usuario } from "../models/Usuario";
import type { Permiso } from "../models/Permiso";

interface AuthContextType {
    isAuthenticated: boolean;
    user: Usuario | null;
    permisos: Permiso[];
    login: (correo: string, contrasena: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const apiBaseUrl: string = config.apiBaseUrl;
    const navigate = useNavigate();
    const location = useLocation();

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
        () => sessionStorage.getItem("isAuthenticated") === "true"
    );

    const [user, setUser] = useState<Usuario | null>(
        () => JSON.parse(sessionStorage.getItem("user") || "null")
    );

    const [permisos, setPermisos] = useState<Permiso[]>(
        () => JSON.parse(sessionStorage.getItem("permisos") || "[]")
    );

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        const refreshToken = async () => {
            try {
                const jwt = sessionStorage.getItem("jwt");
                if (!jwt) return;

                const response = await fetch(`${apiBaseUrl}/auth/renew`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${jwt}`,
                    },
                    body: JSON.stringify({ authHeader: `Bearer ${jwt}` }),
                });

                if (!response.ok) {
                    throw new Error("Error al refrescar token");
                }

                const data = await response.json();
                if (data.jwt) {
                    sessionStorage.setItem("jwt", data.jwt);
                }
            } catch (err) {
                console.error("No se pudo refrescar el token:", err);
                logout();
            }
        };

        if (isAuthenticated) {
            interval = setInterval(refreshToken, 13 * 60 * 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isAuthenticated]);

    useEffect(() => {
        if (
            isAuthenticated &&
            (location.pathname === "/" || location.pathname === "/login")
        ) {
            const dashboards = permisos.filter((p) => p.accion === "dashboard");
            if (dashboards.length > 0) {
                navigate(`/${dashboards[0].tabla}/inicio`, { replace: true });
            } else {
                navigate("/home", { replace: true });
            }
        }
    }, [isAuthenticated, permisos, location.pathname, navigate]);

    const login = async (correo: string, contrasena: string) => {
        try {
            const response = await fetch(`${apiBaseUrl}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ correo, contrasena }),
            });
            if (!response.ok) throw new Error("Error en el login");

            const data = await response.json();

            sessionStorage.setItem("isAuthenticated", "true");
            sessionStorage.setItem("jwt", data.jwt || "");
            sessionStorage.setItem("user", JSON.stringify(data.usuario));

            const permisosUsuario: Permiso[] = data.usuario.rol?.permisos || [];
            sessionStorage.setItem("permisos", JSON.stringify(permisosUsuario));

            setUser(data.usuario);
            setPermisos(permisosUsuario);
            setIsAuthenticated(true);

            const dashboards = permisosUsuario.filter(
                (p) => p.accion === "dashboard"
            );

            if (dashboards.length > 0) {
                navigate(`/${dashboards[0].tabla}/inicio`, { replace: true });
            } else {
                navigate("/home", { replace: true });
            }
        } catch (error) {
            console.error(error);
            throw error;
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

            if (!response.ok) throw new Error("Error al cerrar sesión");

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
