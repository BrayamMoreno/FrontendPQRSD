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
    FaAddressCard,
    FaPaperclip,
    FaTasks,
    FaInbox,
    FaHistory,
    FaFolderOpen,
    FaChartBar
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { Building, VenusAndMarsIcon } from "lucide-react";

const SlidebarAdmin: React.FC = () => {
    const navigate = useNavigate();
    const { logout, permisos, user } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeItem, setActiveItem] = useState<string | null>("Dashboard");
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);

    // 👉 cerrar si hacen clic fuera
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

    // 👉 cerrar submenús al cerrar el menú principal
    useEffect(() => {
        if (!menuOpen) {
            setOpenSubmenu(null);
        }
    }, [menuOpen]);

    // 👉 controlar el scroll global según si el menú está abierto o cerrado
    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = "auto"; // scroll activo
        } else {
            document.body.style.overflow = "hidden"; // scroll bloqueado
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [menuOpen]);

    const dashboards = permisos.filter((p) => p.accion === "dashboard");

    const menuItems = [
        { label: "Pagina Principal", icon: <FaChartBar />, action: () => navigate("/admin") },
        { label: "Gestion Usuarios", icon: <FaAddressCard />, action: () => navigate("/admin/usuarios") },
        {
            label: "Administración",
            icon: <FaUsersCog />,
            children: [
                { label: "Roles", icon: <FaUserShield />, action: () => navigate("/admin/roles") },
                { label: "Tipos de Documentos", icon: <FaIdCard />, action: () => navigate("/admin/tipos_documentos") },
                { label: "Tipos de Personas", icon: <FaUsers />, action: () => navigate("/admin/tipos_personas") },
                { label: "Géneros", icon: <VenusAndMarsIcon />, action: () => navigate("/admin/generos") },
                { label: "Tipos de Solicitudes", icon: <FaArchive />, action: () => navigate("/admin/tipos_solicitudes") },
                { label: "Áreas Responsables", icon: <Building />, action: () => navigate("/admin/areas_responsables") },
                { label: "Departamentos", icon: <Building />, action: () => navigate("/admin/departamentos") },
                { label: "Municipios", icon: <Building />, action: () => navigate("/admin/municipios") },
            ],
        },
        {
            label: "Administracion PQs",
            icon: <FaUsersCog />,
            children: [
                { label: "Adjuntos", icon: <FaPaperclip />, action: () => navigate("/admin/adjuntos") },
                { label: "Estados PQs", icon: <FaTasks />, action: () => navigate("/admin/estados_peticiones") },
                { label: "PQs", icon: <FaInbox />, action: () => navigate("/admin/gestion_pqs") },
                { label: "Historial PQs", icon: <FaHistory />, action: () => navigate("/admin/historial_estados") },
            ],
        },
        { label: "FAQs", icon: <FaQuestion />, action: () => navigate("/faqs") },
        { label: "Perfil", icon: <FaUser />, action: () => navigate("/mostrar_perfil") },
        { label: "Salir", icon: <FaSignOutAlt />, action: logout },
    ];

    const userInfo = {
        nombre:
            user?.persona.nombre.split(" ")[0] +
                " " +
                user?.persona.apellido.split(" ")[0] || "Usuario",
        iniciales:
            user?.persona.nombre && user?.persona.apellido
                ? user?.persona.nombre![0] + user?.persona.apellido![0]
                : "U",
    };

    return (
        <>
            <style>{`
                body {
                    scrollbar-width: thin;
                    scrollbar-color: #2563eb #dbeafe;
                }
                body::-webkit-scrollbar {
                    width: 8px;
                }
                body::-webkit-scrollbar-track {
                    background: #dbeafe;
                }
                body::-webkit-scrollbar-thumb {
                    background-color: #2563eb;
                    border-radius: 9999px;
                    border: 2px solid #dbeafe;
                }
                body::-webkit-scrollbar-thumb:hover {
                    background-color: #1e40af;
                }
            `}</style>

            <aside
                ref={sidebarRef}
                className={`${menuOpen ? "w-64" : "w-20"
                    } bg-blue-100 h-screen fixed top-0 left-0 p-4 transition-all duration-300 ease-in-out flex flex-col justify-between border-r border-gray-300 z-50`}
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

                        {/* Dashboards dinámicos según permisos */}
                        {dashboards.length > 1 && (
                            <div key="Dashboards">
                                <div
                                    onClick={() =>
                                        setOpenSubmenu(openSubmenu === "Dashboards" ? null : "Dashboards")
                                    }
                                    className={`flex items-center justify-between cursor-pointer px-3 py-2 rounded-md transition-colors duration-200 ${activeItem === "Dashboards" ? "bg-blue-600 text-white" : "text-blue-900 hover:bg-blue-200"
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <span className="flex items-center justify-center w-6 h-6">
                                            <FaFolderOpen size={18} className="block" />
                                        </span>
                                        {menuOpen && (
                                            <span className="ml-3 whitespace-nowrap">
                                                Dashboards
                                            </span>
                                        )}
                                    </div>
                                    {menuOpen && (
                                        <FaChevronDown
                                            className={`transition-transform duration-300 ${openSubmenu === "Dashboards" ? "rotate-180" : ""
                                                }`}
                                        />
                                    )}
                                </div>

                                {/* Submenú dinámico */}
                                <div
                                    className={`transition-all duration-300 ease-in-out overflow-hidden ${openSubmenu === "Dashboards" ? "max-h-[300px] opacity-100 mt-1" : "max-h-0 opacity-0"
                                        }`}
                                >
                                    {dashboards.map((d) => (
                                        <div
                                            key={d.tabla}
                                            onClick={() => {
                                                setActiveItem(d.tabla);
                                                navigate(`/${d.tabla}`);
                                                setOpenSubmenu(null);
                                                setMenuOpen(false);
                                            }}
                                            className={`flex items-center cursor-pointer px-3 py-2 rounded-md transition-colors duration-200 ${activeItem === d.tabla ? "bg-blue-500 text-white" : "text-blue-900 hover:bg-blue-200"
                                                }`}
                                        >
                                            <span className="flex items-center justify-center w-6 h-6">
                                                <FaFileAlt size={18} className="block" />
                                            </span>
                                            {menuOpen && (
                                                <span className="ml-3 whitespace-nowrap">
                                                    {d.tabla.charAt(0).toUpperCase() + d.tabla.slice(1)}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {menuItems.map(({ label, icon, action, children }) => (
                            <div key={label}>
                                <div
                                    onClick={() => {
                                        if (children) {
                                            setOpenSubmenu(openSubmenu === label ? null : label);
                                        } else {
                                            setActiveItem(label);
                                            action?.();
                                            setOpenSubmenu(null);
                                            setMenuOpen(false);
                                        }
                                    }}
                                    className={`flex items-center justify-between cursor-pointer px-3 py-2 rounded-md transition-colors duration-200 ${activeItem === label
                                        ? "bg-blue-600 text-white"
                                        : "text-blue-900 hover:bg-blue-200"
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <span className="flex items-center justify-center w-6 h-6">
                                            {React.cloneElement(icon, { size: 18, className: "block" })}
                                        </span>
                                        {menuOpen && (
                                            <span className="ml-3 whitespace-nowrap">
                                                {label}
                                            </span>
                                        )}
                                    </div>
                                    {children && menuOpen && (
                                        <FaChevronDown
                                            className={`transition-transform duration-300 ${openSubmenu === label ? "rotate-180" : ""
                                                }`}
                                        />
                                    )}
                                </div>

                                {/* Submenú */}
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
                                                        setOpenSubmenu(null); // 👈 cerrar submenú después de elegir
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
                                                    {menuOpen && (
                                                        <span className="ml-3 whitespace-nowrap">
                                                            {child.label}
                                                        </span>
                                                    )}
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
                        <div className="flex items-center w-40 overflow-hidden">
                            <span className="whitespace-nowrap transition-opacity duration-300 opacity-100">
                                {userInfo.nombre}
                            </span>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
};

export default SlidebarAdmin;
