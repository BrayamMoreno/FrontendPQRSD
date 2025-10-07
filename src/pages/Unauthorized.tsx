import { ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center bg-gradient-to-br from-red-50 to-red-100 text-red-900 px-6">
      <div className="text-center">
        <ShieldAlert className="w-16 h-16 text-red-600 mx-auto mb-6 animate-pulse" />

        <h1 className="text-5xl font-extrabold">Acceso denegado</h1>
        <p className="mt-4 text-lg font-medium text-red-700">
          No tienes permisos para acceder a esta página 🚫
        </p>

        <button
          onClick={() => navigate(-1)}
          className="inline-block mt-8 px-6 py-3 bg-red-600 text-white rounded-2xl shadow-md hover:bg-red-700 transition-all"
        >
          Volver atrás
        </button>
      </div>
    </div>
  );
}
