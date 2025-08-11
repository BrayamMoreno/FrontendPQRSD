// Slidebar.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  FaBars,
  FaUser,
  FaSignOutAlt,
  FaFileAlt,
  FaQuestion
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider"; // 👈 Importa el hook

const SlidebarAdmin: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth(); // 👈 Obtén el método logout
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("Pagos");
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  // En vez de usar path con {auth}, aquí definimos qué hacer
  const menuItems = [
    { label: "Dashboard", icon: <FaFileAlt />, action: () => navigate("/admin/dashboard") },
    { label: "Administrar Usuarios", icon: <FaUser />, action: () => navigate("/admin/dashboard/gestion_usuarios") },
    { label: "Faqs", icon: <FaQuestion />, action: () => navigate("/faqs") },
    { label: "Perfil", icon: <FaUser />, action: () => navigate("/dashboard/mostrar_perfil") },
    { label: "Salir", icon: <FaSignOutAlt />, action: logout },
  ];

  const userInfo = {
    nombre:
      sessionStorage.getItem("persona_nombre")?.split(" ")[0] +
        " " +
        sessionStorage.getItem("persona_apellido")?.split(" ")[0] || "Usuario",
    iniciales:
      sessionStorage.getItem("persona_nombre") && sessionStorage.getItem("persona_apellido")
        ? sessionStorage.getItem("persona_nombre")![0] +
          sessionStorage.getItem("persona_apellido")![0]
        : "U",
  };

  return (
    <aside
      ref={sidebarRef}
      className={`${
        menuOpen ? "w-64" : "w-20"
      } bg-green-100 h-screen fixed top-0 left-0 p-4 transition-[width] duration-300 ease-in-out flex flex-col justify-between border-r border-gray-300 z-50`}
    >
      <div>
        <div className="flex items-center justify-between mb-6">
          {menuOpen && (
            <div className="text-lg font-bold text-green-900 transition-opacity duration-200 delay-150">
              Menu
            </div>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-md bg-white border border-gray-300 hover:bg-green-50"
          >
            <FaBars size={18} className="text-green-700" />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {menuItems.map(({ label, icon, action }, index) => (
            <div
              key={label}
              onClick={() => {
                setActiveItem(label);
                action(); // 👈 Ejecuta la acción definida
                setMenuOpen(false);
              }}
              className={`flex items-center gap-3 cursor-pointer px-3 py-2 rounded-md transition-colors duration-200 ${
                activeItem === label
                  ? "bg-green-600 text-white"
                  : "text-green-900 hover:bg-green-200"
              }`}
            >
              <span className="flex-shrink-0">{icon}</span>
              <span
                className={`whitespace-nowrap transition-opacity duration-200 ${
                  menuOpen ? "opacity-100 delay-100" : "opacity-0 w-0 overflow-hidden"
                }`}
                style={{
                  transitionDelay: menuOpen ? `${index * 50}ms` : "0ms",
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3 p-2 mt-4">
        <div className="bg-gray-700 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold">
          {userInfo.iniciales}
        </div>
        {menuOpen && (
          <div className="flex flex-col transition-opacity duration-200 delay-150">
            <span className="text-sm font-medium text-green-900">
              {userInfo.nombre}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};

export default SlidebarAdmin;
