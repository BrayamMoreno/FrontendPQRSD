import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import type { Permiso } from "../models/Permiso";
import { FaChartBar, FaUserShield, FaQuestionCircle } from "react-icons/fa";

interface DashboardRoute {
  ruta: string;
  nombre: string;
  icon: any;
}

export default function SelectorDashboard() {
  const { permisos } = useAuth();
  const navigate = useNavigate();

  const dashboards =
    permisos?.filter(
      (p) => p?.tabla?.startsWith("dashboard") && p?.accion === "acceder"
    ) ?? [];

  const getDashboardRoute = (permiso: Permiso): DashboardRoute | null => {
    const clave = `${permiso.tabla}:${permiso.accion}`;
    switch (clave) {
      case "dashboard_pqs:acceder":
        return {
          ruta: "/usuario/dashboard",
          nombre: "Dashboard de PQRs",
          icon: <FaQuestionCircle />,
        };
      case "dashboard_estadisticas:acceder":
        return {
          ruta: "/dashboard/estadisticas",
          nombre: "Dashboard de Estadísticas",
          icon: <FaChartBar />,
        };
      case "dashboard_admin:acceder":
        return {
          ruta: "/admin/dashboard",
          nombre: "Dashboard de Administración",
          icon: <FaUserShield />,
        };
      default:
        return null;
    }
  };

  const dashboardOptions = dashboards
    .map(getDashboardRoute)
    .filter((d): d is DashboardRoute => d !== null);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-12 rounded-3xl shadow-xl w-full max-w-md mx-auto">
        <h2 className="text-3xl font-extrabold text-center mb-8 text-gray-800">
          Selecciona tu Dashboard
        </h2>
        <div className="flex flex-col gap-4">
          {dashboardOptions.map(({ ruta, nombre, icon }) => (
            <button
              key={ruta} // Usar la ruta como clave única
              onClick={() => navigate(ruta)}
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105"
            >
              {icon}
              <span>{nombre}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
