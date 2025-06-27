import React, { useState, useRef, useEffect } from "react";
import { FaBars, FaUser, FaSignOutAlt } from "react-icons/fa";
import { Button } from "../components/ui/button";

const Slidebar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("Radicar PQRSDF");
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Manejar clics fuera del sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
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

  return (
    <aside
      ref={sidebarRef}
      className={`${menuOpen ? "w-80" : "w-20"}
        fixed left-0 top-0 h-screen bg-blue-900 text-white p-4 flex flex-col justify-between transition-all duration-300 z-50`}
    >
      {/* Botón de menú */}
      <div
        className={`flex ${
          menuOpen ? "justify-between w-full" : "justify-center"
        } mb-4`}
      >
        {menuOpen && <h2 className="text-lg font-bold">Menú</h2>}
        <Button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center bg-blue-700 hover:bg-blue-800 p-2 rounded-lg transition-all duration-300"
        >
          <FaBars size={24} />
        </Button>
      </div>

      {/* Navegación */}
      <nav className="flex flex-col gap-4 w-full">
        {[
          { label: "Perfil", icon: <FaUser size={24} /> },
          {
            label: "Cerrar Sesión",
            icon: <FaSignOutAlt size={24} />,
            textColor: "text-red-500",
          },
        ].map(({ label, icon, textColor = "text-white" }) => (
          <Button
            key={label}
            className={`flex items-center gap-2 ${textColor} ${
              activeItem === label
                ? "bg-blue-700"
                : "bg-blue-600 hover:bg-blue-700"
            } p-2 rounded-lg transition-all duration-300`}
            onClick={() => setActiveItem(label)}
          >
            <span className="flex items-center gap-2">
              {icon}
              {menuOpen && <span className="text-white">{label}</span>}
            </span>
          </Button>
        ))}
      </nav>
    </aside>
  );
};

export default Slidebar;
