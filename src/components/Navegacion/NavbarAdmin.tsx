import React, { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthProvider"
import {
    ChevronDown,
    LayoutDashboard,
    Settings2,
    User,
    LogOut,
    Menu,
    X,
} from "lucide-react"
import logo from "../../assets/Logo.webp"
import {
    FaAddressCard,
    FaArchive,
    FaChartBar,
    FaHistory,
    FaIdCard,
    FaInbox,
    FaPaperclip,
    FaQuestion,
    FaTasks,
    FaUsers,
    FaUsersCog,
    FaUserShield,
} from "react-icons/fa"
import { VenusAndMarsIcon, Building } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu"
import {
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu"

const NavbarAdmin: React.FC = () => {
    const navigate = useNavigate()
    const { logout, permisos, user } = useAuth()

    const [showDashboards, setShowDashboards] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [openMenu, setOpenMenu] = useState<string | null>(null) // 🔹 Nuevo estado para acordeones

    const userInfo = {
        nombre:
            user?.persona.nombre + " " + user?.persona.apellido || "Usuario",
        iniciales:
            user?.persona.nombre && user?.persona.apellido
                ? user?.persona.nombre![0].toUpperCase() +
                user?.persona.apellido![0].toUpperCase()
                : "U",
    }

    const location = useLocation()
    const currentRole = location.pathname.split("/")[1]

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
    ]

    const dashboards = permisos.filter((p) => p.accion === "dashboard")

    return (
        <header className="fixed top-0 left-0 z-50 w-full shadow-md">
            {/* Primera fila */}
            <div className="w-full bg-[#0A192F]">
                <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-2 font-bold text-white">
                        <img src={logo} alt="Logo" className="w-8 h-8" />
                        <span className="text-lg sm:text-xl">Plataforma PQRSDF</span>
                    </div>

                    {/* Botón hamburguesa en mobile */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="sm:hidden bg-[#173A5E] text-white hover:text-gray-200"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    {/* Avatar + Nombre + Menú (oculto en mobile) */}
                    <div className="hidden sm:flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger className="px-3 py-2 text-sm text-white hover:bg-blue-700 rounded-md flex items-center gap-1 focus:outline-none">
                                {userInfo.nombre}
                                <ChevronDown size={16} />
                            </DropdownMenuTrigger>

                            <DropdownMenuContent className="bg-white border border-gray-200 rounded-md shadow-lg min-w-[180px] p-1 z-50">
                                <DropdownMenuItem
                                    onClick={() => navigate(`/${currentRole}/perfil`)}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer rounded"
                                >
                                    <User size={14} /> Mi Perfil
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => navigate("/perfil")}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer rounded"
                                >
                                    <Settings2 size={14} /> Configuración
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={async () => await logout()}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer rounded"
                                >
                                    <LogOut size={14} /> Cerrar sesión
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Segunda fila (desktop) */}
            <div className="w-full bg-[#173A5E] hidden sm:flex">
                <div className="max-w-7xl mx-auto px-4 flex items-center h-12 gap-6 w-full">
                    {/* Menú horizontal */}
                    <div className="flex items-center gap-3">
                        {menuItems.map(({ label, icon, action, children }) => (
                            <DropdownMenu key={label}>
                                <DropdownMenuTrigger
                                    className="px-3 py-2 text-sm text-white hover:bg-blue-700 rounded-md flex items-center gap-1"
                                    onClick={!children ? action : undefined}
                                >
                                    <span className="flex items-center gap-2">
                                        {React.cloneElement(icon, { size: 18 })}
                                        {label}
                                    </span>
                                    {children && <ChevronDown size={14} />}
                                </DropdownMenuTrigger>
                                {children && (
                                    <DropdownMenuContent
                                        className="bg-white border border-gray-200 rounded-md shadow-lg min-w-[180px] p-1"
                                        align="start"
                                    >
                                        {children.map((child) => (
                                            <DropdownMenuItem
                                                key={child.label}
                                                onClick={child.action}
                                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded hover:bg-gray-100 cursor-pointer"
                                            >
                                                {React.cloneElement(child.icon, { size: 16 })}
                                                {child.label}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                )}
                            </DropdownMenu>
                        ))}
                    </div>

                    {/* Dashboard button */}
                    {dashboards.length > 1 && (
                        <div className="ml-auto relative">
                            <button
                                onClick={() => setShowDashboards(!showDashboards)}
                                className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition"
                            >
                                <LayoutDashboard size={14} />
                                Dashboard
                                <ChevronDown size={12} />
                            </button>

                            {showDashboards && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                                    <ul className="py-1">
                                        {dashboards.map((d) => (
                                            <li
                                                key={d.tabla}
                                                onClick={() => {
                                                    navigate(`/${d.tabla}/inicio`)
                                                    setShowDashboards(false)
                                                }}
                                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                                            >
                                                {d.tabla.charAt(0).toUpperCase() + d.tabla.slice(1)}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Menú lateral (mobile) */}
            {mobileMenuOpen && (
                <div className="sm:hidden bg-[#173A5E]  px-4 py-3 space-y-3">
                    {menuItems.map(({ label, icon, action, children }) => (
                        <div key={label}>
                            <button
                                onClick={() => {
                                    if (children) {
                                        setOpenMenu(openMenu === label ? null : label)
                                    } else {
                                        action?.()
                                        setMobileMenuOpen(false)
                                    }
                                }}
                                className="flex items-center justify-between w-full py-2 bg-[#173A5E] text-white hover:bg-blue-700 rounded px-2"
                            >
                                <span className="flex items-center gap-2">
                                    {React.cloneElement(icon, { size: 18 })}
                                    {label}
                                </span>
                                {children && (
                                    <ChevronDown
                                        size={16}
                                        className={`transition-transform ${openMenu === label ? "rotate-180" : ""
                                            }`}
                                    />
                                )}
                            </button>

                            {/* Submenú desplegable */}
                            {children && openMenu === label && (
                                <div className="pl-6 space-y-2">
                                    {children.map((child) => (
                                        <button
                                            key={child.label}
                                            onClick={() => {
                                                child.action?.()
                                                setMobileMenuOpen(false)
                                            }}
                                            className="flex items-center mt-2 gap-2 w-full text-left text-sm py-1 bg-[#173A5E] text-white hover:bg-blue-600 rounded px-2"
                                        >
                                            {React.cloneElement(child.icon, { size: 14 })}
                                            {child.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Botón dashboard */}
                    {dashboards.length > 1 && (
                        <div className="pt-2 border-t border-blue-700 mt-3">
                            <p className="text-xs uppercase text-gray-300 mb-2">Dashboards</p>
                            {dashboards.map((d) => (
                                <button
                                    key={d.tabla}
                                    onClick={() => {
                                        navigate(`/${d.tabla}/inicio`)
                                        setMobileMenuOpen(false)
                                    }}
                                    className="block w-full text-left bg-[#173A5E] text-white py-2 px-2 rounded hover:bg-blue-600"
                                >
                                    {d.tabla.charAt(0).toUpperCase() + d.tabla.slice(1)}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Menú de usuario (mobile) */}
                    <div className="pt-3 border-t border-blue-700">
                        <p className="text-xs uppercase  text-gray-300 mb-2">Usuario</p>
                        <button
                            onClick={() => {
                                navigate(`/${currentRole}/perfil`)
                                setMobileMenuOpen(false)
                            }}
                            className="flex items-center gap-2 w-full text-left py-2 mb-2 px-2 bg-[#173A5E] text-white hover:bg-blue-700 rounded"
                        >
                            <User size={14} /> Mi Perfil
                        </button>
                        <button
                            onClick={() => {
                                navigate("/perfil")
                                setMobileMenuOpen(false)
                            }}
                            className="flex items-center gap-2 w-full text-left py-2 px-2 mb-2 bg-[#173A5E] text-white hover:bg-blue-700 rounded"
                        >
                            <Settings2 size={14} /> Configuración
                        </button>
                        <button
                            onClick={async () => {
                                await logout()
                                setMobileMenuOpen(false)
                            }}
                            className="flex items-center gap-2 w-full text-left py-2 px-2 mb-2 bg-[#173A5E]  text-red-400 hover:bg-red-700 rounded"
                        >
                            <LogOut size={14} /> Cerrar sesión
                        </button>
                    </div>
                </div>
            )}
        </header>
    )
}

export default NavbarAdmin
