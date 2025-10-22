import React, { useState, type JSX } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthProvider"
import {
    ChevronDown,
    LayoutDashboard,
    User,
    LogOut,
    VenusAndMarsIcon,
    AppWindow,
    Landmark,
    MapPin,
    MapIcon,
    User2,
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
    FaTools,
    FaUserCog,
    FaUsers,
    FaUsersCog,
    FaUserShield,
} from "react-icons/fa"
import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu"

const NavbarAdmin: React.FC = () => {
    const navigate = useNavigate()
    const { logout, permisos, user } = useAuth()

    const [showDashboards, setShowDashboards] = useState(false)
    const location = useLocation()
    const currentRole = location.pathname.split("/")[1]

    const userInfo = {
        nombre:
            user?.persona.nombre + " " + user?.persona.apellido || "Usuario",
        iniciales:
            user?.persona.nombre && user?.persona.apellido
                ? user?.persona.nombre![0].toUpperCase() +
                user?.persona.apellido![0].toUpperCase()
                : "U",
    }

    // Helper: verifica si el usuario tiene permiso de leer o modificar una tabla
    const canAccess = (tabla: string) =>
        permisos.some(
            (p) =>
                (p.accion === "leer" || p.accion === "acceder") &&
                p.tabla === tabla
        )

    const menuItems = [
        { label: "Página Principal", icon: <FaChartBar />, action: () => navigate("/admin") },

        canAccess("usuarios") && {
            label: "Gestión Usuarios",
            icon: <FaAddressCard />,
            action: () => navigate("/admin/usuarios"),
        },

        {
            label: "Tablas de Soporte",
            icon: <FaUsersCog />,
            children: [
                canAccess("roles") && { label: "Roles", icon: <FaUserShield />, action: () => navigate("/admin/roles") },
                canAccess("tipos_documentos") && { label: "Tipos de Documentos", icon: <FaIdCard />, action: () => navigate("/admin/tipos_documentos") },
                canAccess("tipos_personas") && { label: "Tipos de Personas", icon: <FaUsers />, action: () => navigate("/admin/tipos_personas") },
                canAccess("generos") && { label: "Géneros", icon: <VenusAndMarsIcon />, action: () => navigate("/admin/generos") },
                canAccess("tipos_pqs") && { label: "Tipos de Solicitudes", icon: <FaArchive />, action: () => navigate("/admin/tipos_pqs") },
                canAccess("areas_responsables") && { label: "Áreas Responsables", icon: <Landmark />, action: () => navigate("/admin/areas_responsables") },
                canAccess("departamentos") && { label: "Departamentos", icon: <MapIcon />, action: () => navigate("/admin/departamentos") },
                canAccess("municipios") && { label: "Municipios", icon: <MapPin />, action: () => navigate("/admin/municipios") },
            ].filter(Boolean),
        },

        {
            label: "Administración PQs",
            icon: <FaUsersCog />,
            children: [
                canAccess("adjuntos_pq") && { label: "Adjuntos", icon: <FaPaperclip />, action: () => navigate("/admin/adjuntos") },
                canAccess("estados_pqs") && { label: "Estados PQs", icon: <FaTasks />, action: () => navigate("/admin/estados_pqs") },
                canAccess("responsables_pqs") && { label: "Responsables PQs", icon: <User2 />, action: () => navigate("/admin/responsables_pqs") },
                canAccess("pqs") && { label: "PQs", icon: <FaInbox />, action: () => navigate("/admin/gestion_pqs") },
                canAccess("historial_estados") && { label: "Historial PQs", icon: <FaHistory />, action: () => navigate("/admin/historial_estados") },
            ].filter(Boolean),
        },

        canAccess("utilidades") && { label: "Utilidades", icon: <FaTools />, action: () => navigate("/admin/utilidades") },

        { label: "FAQs", icon: <FaQuestion />, action: () => navigate("/faqs") },
    ]
        .filter(Boolean) as {
            label: string
            icon: JSX.Element
            action?: () => void
            children?: { label: string; icon: JSX.Element; action: () => void }[]
        }[]


    const dashboards = permisos.filter((p) => p.accion === "dashboard")

    return (
        <header className="fixed z-50 w-screen shadow-md">
            {/* Primera fila */}
            <div className="w-full bg-[#0A192F]">
                <div className="max-w-7xl mx-auto flex justify-between items-center h-16">
                    <div className="flex items-center gap-2 font-bold text-white">
                        <img src={logo} alt="Logo" className="w-8 h-8" />
                        <span className="text-lg sm:text-xl">Plataforma PQRSDF</span>
                    </div>

                    <div className="hidden sm:flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-[#173A5E] flex items-center justify-center text-white font-semibold">
                            {userInfo.iniciales}
                        </div>

                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger className="px-3 py-2 text-sm text-white bg-[#0A192F] hover:bg-blue-700 rounded-md flex items-center gap-1">
                                {userInfo.nombre}
                                <ChevronDown size={16} />
                            </DropdownMenuTrigger>

                            <DropdownMenuContent className="bg-white border border-gray-200 rounded-md shadow-lg min-w-[180px] p-1 z-50">
                                <DropdownMenuItem
                                    onClick={() => navigate(`/${currentRole}/perfil`)}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
                                >
                                    <User size={14} /> Mi Perfil
                                </DropdownMenuItem>

                                <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 cursor-default">
                                    <FaUserCog size={14} /> Rol:{" "}
                                    {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}
                                </DropdownMenuItem>

                                {dashboards.length > 1 && (
                                    <div
                                        onClick={() => setShowDashboards(!showDashboards)}
                                        className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
                                    >
                                        <span className="flex items-center gap-2">
                                            <LayoutDashboard size={14} /> Dashboards
                                        </span>
                                        <ChevronDown size={12} />
                                    </div>
                                )}

                                {showDashboards &&
                                    dashboards.map((d) => (
                                        <DropdownMenuItem
                                            key={d.tabla}
                                            onClick={() => {
                                                navigate(`/${d.tabla}/inicio`)
                                                setShowDashboards(false)
                                            }}
                                            className="pl-8 pr-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer rounded"
                                        >
                                            <AppWindow size={14} />
                                            {d.tabla.charAt(0).toUpperCase() + d.tabla.slice(1)}
                                        </DropdownMenuItem>
                                    ))}

                                <DropdownMenuItem
                                    onClick={async () => await logout()}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                >
                                    <LogOut size={14} /> Cerrar sesión
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Segunda fila */}
            <div className="w-full bg-[#173A5E] hidden sm:flex">
                <div className="max-w-7xl mx-auto flex items-center h-12 gap-6 w-full">
                    <div className="flex items-center gap-3">
                        {menuItems.map(({ label, icon, action, children }) => (
                            <DropdownMenu modal={false} key={label}>
                                <DropdownMenuTrigger
                                    className="px-3 py-2 text-sm text-white bg-[#173A5E] hover:bg-blue-700 rounded-md flex items-center gap-1"
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
                </div>
            </div>
        </header>
    )
}

export default NavbarAdmin
