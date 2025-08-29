import React, { useState, useRef, useEffect } from "react";
import {
    FaBars,
    FaUser,
    FaSignOutAlt,
    FaFileAlt,
    FaQuestion,
    FaUserShield,
    FaIdCard,
    FaUsers,
    FaChevronDown,
    FaArchive,
    FaUsersCog,
    FaAddressCard
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { Building, VenusAndMarsIcon } from "lucide-react";

const SlidebarAdmin: React.FC = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeItem, setActiveItem] = useState<string | null>("Dashboard");
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
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
    }, [menuOpen]);

    const menuItems = [
    { label: "Dashboard", icon: <FaFileAlt />, action: () => navigate("/admin/dashboard") },
    {
        label: "Gestión de Usuarios",
        icon: <FaUsers />,
        children: [
            { label: "Personas", icon: <FaUser />, action: () => navigate("/admin/dashboard/gestion_personas") },
            { label: "Usuarios", icon: <FaAddressCard />, action: () => navigate("/admin/dashboard/gestion_usuarios") }
        ],
    },
    {
        label: "Administración",
        icon: <FaUsersCog />,
        children: [
            { label: "Roles", icon: <FaUserShield />, action: () => navigate("/admin/dashboard/roles") },
            { label: "Tipos de Documentos", icon: <FaIdCard />, action: () => navigate("/admin/dashboard/tipos_documentos") },
            { label: "Tipos de Personas", icon: <FaUsers />, action: () => navigate("/admin/dashboard/tipos_personas") },
            { label: "Generos", icon: <VenusAndMarsIcon />, action: () => navigate("/admin/dashboard/generos") },
            { label: "Tipos de Solicitudes", icon: <FaArchive />, action: () => navigate("/admin/dashboard/tipos_solicitudes") },
            { label: "Áreas Responsables", icon: <Building />, action: () => navigate("/admin/dashboard/areas_responsables") },
        ],
    },
    { label: "FAQs", icon: <FaQuestion />, action: () => navigate("/faqs") },
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
            className={`${menuOpen ? "w-64" : "w-20"} bg-blue-100 h-screen fixed top-0 left-0 p-4 transition-all duration-300 ease-in-out flex flex-col justify-between border-r border-gray-300 z-50`}
        >
            <div>
                <div className="flex items-center justify-between mb-6">
                    {menuOpen && (
                        <div className="text-lg font-bold text-blue-900 transition-opacity duration-200 delay-150">
                            Menú
                        </div>
                    )}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="p-2 rounded-md bg-white border border-gray-300 hover:bg-blue-50 flex items-center justify-center"
                    >
                        <span className="flex items-center justify-center w-6 h-6">
                            <FaBars size={18} className="block text-blue-700" />
                        </span>
                    </button>
                </div>

                <nav className="flex flex-col gap-1">
                    {menuItems.map(({ label, icon, action, children }) => (
                        <div key={label}>
                            <div
                                onClick={() => {
                                    if (children) {
                                        setOpenSubmenu(openSubmenu === label ? null : label);
                                    } else {
                                        setActiveItem(label);
                                        action?.();
                                        setMenuOpen(false);
                                    }
                                }}
                                className={`flex items-center justify-between cursor-pointer px-3 py-2 rounded-md transition-colors duration-200 ${activeItem === label ? "bg-blue-600 text-white" : "text-blue-900 hover:bg-blue-200"
                                    }`}
                            >
                                <div className="flex items-center">
                                    <span className="flex items-center justify-center w-6 h-6">
                                        {React.cloneElement(icon, { size: 18, className: "block" })}
                                    </span>
                                    <span
                                        className={`ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? "w-full opacity-100" : "w-0 opacity-0"
                                            }`}
                                    >
                                        {label}
                                    </span>
                                </div>
                                {children && menuOpen && (
                                    <FaChevronDown
                                        className={`transition-transform duration-300 ${openSubmenu === label ? "rotate-180" : ""
                                            }`}
                                    />
                                )}
                            </div>

                            {/* Submenú con animación y scroll si hay muchos items */}
                            <div
                                className={`transition-all duration-300 ease-in-out overflow-hidden ${openSubmenu === label ? "max-h-[300px] opacity-100 mt-1" : "max-h-0 opacity-0"
                                    }`}
                            >
                                {children && (
                                    <div className="flex flex-col gap-1 overflow-y-auto max-h-[280px] pr-1">
                                        {children.map((child) => (
                                            <div
                                                key={child.label}
                                                onClick={() => {
                                                    setActiveItem(child.label);
                                                    child.action();
                                                    setMenuOpen(false);
                                                }}
                                                className={`flex items-center cursor-pointer px-3 py-2 rounded-md transition-colors duration-200 ${activeItem === child.label
                                                    ? "bg-blue-500 text-white"
                                                    : "text-blue-900 hover:bg-blue-200"
                                                    }`}
                                            >
                                                <span className="flex items-center justify-center w-6 h-6">
                                                    {React.cloneElement(child.icon, { size: 18, className: "block" })}
                                                </span>
                                                <span
                                                    className={`ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? "w-full opacity-100" : "w-0 opacity-0"
                                                        }`}
                                                >
                                                    {child.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>


                        </div>
                    ))}
                </nav>
            </div>

            <div className="flex items-center gap-3 p-2 mt-4">
                <div className="bg-gray-700 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold">
                    {userInfo.iniciales}
                </div>
                {menuOpen && (
                    <div className={`flex items-center ${menuOpen ? "w-40" : "w-0"} overflow-hidden`}>
                        <span
                            className={`whitespace-nowrap transition-opacity duration-300 ${menuOpen ? "opacity-100" : "opacity-0"
                                }`}
                        >
                            {userInfo.nombre}
                        </span>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default SlidebarAdmin;
