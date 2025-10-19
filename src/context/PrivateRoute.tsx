import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import type { ReactNode } from "react";
import type { Permiso } from "../models/Permiso";

interface PrivateRouteProps {
  children?: ReactNode;
  required?: { tabla: string; accion: string }[];
}

const PrivateRoute = ({ children, required }: PrivateRouteProps) => {
  const { isAuthenticated, permisos } = useAuth();

  // 1️⃣ No autenticado → redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2️⃣ Si no hay permisos requeridos → acceso total
  if (!required || required.length === 0) {
    return children ? <>{children}</> : <Outlet />;
  }

  // 3️⃣ Verificar permisos
  const hasPermission = required.some((req) =>
    permisos.some(
      (p: Permiso) => p.tabla === req.tabla && p.accion === req.accion
    )
  );

  // 4️⃣ Sin permisos → redirigir a "no autorizado"
  if (!hasPermission) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 5️⃣ Si tiene hijos → renderiza hijos, si no → usa Outlet
  return children ? <>{children}</> : <Outlet />;
};

export default PrivateRoute;
