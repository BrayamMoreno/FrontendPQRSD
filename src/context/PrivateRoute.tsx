import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import type { Permiso } from "../models/Permiso";

interface PrivateRouteProps {
    required?: { tabla: string; accion: string }[]; // permisos necesarios
}

const PrivateRoute = ({ required }: PrivateRouteProps) => {
    const { isAuthenticated, permisos } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!required) {
        return <Outlet />;
    }

    const hasPermission = required.some((req) =>
        permisos.some(
            (p: Permiso) => p.tabla === req.tabla && p.accion === req.accion
        )
    );

    if (!hasPermission) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;
