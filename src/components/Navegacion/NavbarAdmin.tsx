import React, { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthProvider"
import {
    ChevronDown,
    LayoutDashboard,
    Settings2,
    User,
    LogOut,
    VenusAndMarsIcon,
    AppWindow,
    Landmark,
    MapPin,
    MapIcon,
    Icon,
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
            label: "Tablas de Soporte",
            icon: <FaUsersCog />,
            children: [
                { label: "Roles", icon: <FaUserShield />, action: () => navigate("/admin/roles") },
                { label: "Tipos de Documentos", icon: <FaIdCard />, action: () => navigate("/admin/tipos_documentos") },
                { label: "Tipos de Personas", icon: <FaUsers />, action: () => navigate("/admin/tipos_personas") },
                { label: "Géneros", icon: <VenusAndMarsIcon />, action: () => navigate("/admin/generos") },
                { label: "Tipos de Solicitudes", icon: <FaArchive />, action: () => navigate("/admin/tipos_pqs") },
                { label: "Áreas Responsables", icon: <Landmark />, action: () => navigate("/admin/areas_responsables") },
                { label: "Departamentos", icon: <MapIcon />, action: () => navigate("/admin/departamentos") },
                { label: "Municipios", icon: <MapPin />, action: () => navigate("/admin/municipios") },
            ],
        },
        {
            label: "Administracion PQs",
            icon: <FaUsersCog />,
            children: [
                { label: "Adjuntos", icon: <FaPaperclip />, action: () => navigate("/admin/adjuntos") },
                { label: "Estados PQs", icon: <FaTasks />, action: () => navigate("/admin/estados_pqs") },
                { label: "Responsables PQs", icon: <User2 />, action: () => navigate("/admin/responsables_pqs") },
                { label: "PQs", icon: <FaInbox />, action: () => navigate("/admin/gestion_pqs") },
                { label: "Historial PQs", icon: <FaHistory />, action: () => navigate("/admin/historial_estados") },
            ],
        },
        { label: "FAQs", icon: <FaQuestion />, action: () => navigate("/faqs") },
    ]

    const dashboards = permisos.filter((p) => p.accion === "dashboard")

    return (
        <header className="fixed z-50 w-screen shadow-md">
            {/* Primera fila */}
            <div className="w-full bg-[#0A192F]">
                <div className="max-w-7xl mx-auto flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-2 font-bold text-white">
                        <img src={logo} alt="Logo" className="w-8 h-8" />
                        <span className="text-lg sm:text-xl">Plataforma PQRSDF</span>
                    </div>

                    <div className="hidden sm:flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-[#173A5E] flex items-center justify-center text-white font-semibold">
                            {userInfo.iniciales}
                        </div>
                        <DropdownMenu modal={false}>
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
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 cursor-default"
                                >
                                    <FaUserCog size={14} /> Rol:{" "}
                                    {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}
                                </DropdownMenuItem>

                                {dashboards.length > 1 && (
                                    <div
                                        onClick={() => setShowDashboards(!showDashboards)}
                                        className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer rounded"
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
                                    ))
                                }

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

            {/* Segunda fila */}
            <div className="w-full bg-[#173A5E] hidden sm:flex">
                <div className="max-w-7xl mx-auto flex items-center h-12 gap-6 w-full">
                    {/* Menú horizontal */}
                    <div className="flex items-center gap-3">
                        {menuItems.map(({ label, icon, action, children }) => (
                            <DropdownMenu modal={false} key={label}>
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

                </div>
            </div>
        </header>
    )
}

export default NavbarAdmin
