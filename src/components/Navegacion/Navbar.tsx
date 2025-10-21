import React, { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthProvider"
import {
    ChevronDown,
    FileText,
    Home,
    User,
    LogOut,
    Users,
    Archive,
    LayoutDashboard,
    AppWindow,
    Menu,
    X,
} from "lucide-react"
import logo from "../../assets/Logo.webp"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { FaUserCog } from "react-icons/fa"
import { Button } from "../ui/button"

const Navbar: React.FC = () => {
    const navigate = useNavigate()
    const { logout, permisos, user } = useAuth()

    const [showDashboards, setShowDashboards] = useState(false)

    const userMenuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(event.target as Node)
            ) {
                setShowDashboards(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

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
    const permisosRol = permisos.filter((p) => p.tabla === currentRole)
    const dashboards = permisos.filter((p) => p.accion === "dashboard")

    const acciones = [
        {
            label: "Inicio",
            icon: <Home size={14} />,
            action: () => {
                const inicioPermiso = permisosRol.find((p) => p.accion === "dashboard")
                if (inicioPermiso) {
                    navigate(`/${inicioPermiso.tabla}/inicio`)
                }
            },
        },
    ].filter(Boolean)

    if (
        permisosRol.find(
            (p) => p.accion === "dashboard" && p.tabla === "funcionario"
        )
    ) {
        acciones.push({
            label: "Peticiones Pendientes",
            icon: <FileText size={14} />,
            action: () => navigate(`/funcionario/peticiones_pendientes`),
        })

        acciones.push({
            label: "Historial Peticiones",
            icon: <Archive size={14} />,
            action: () => navigate(`/funcionario/historial_peticiones`),
        })
    }

    if (
        permisosRol.find((p) => p.accion === "dashboard" && p.tabla === "usuario")
    ) {
        acciones.push({
            label: "Mis Peticiones",
            icon: <FileText size={14} />,
            action: () => navigate(`/usuario/peticiones`),
        })
    }

    // asignador
    if (
        permisosRol.find((p) => p.accion === "dashboard" && p.tabla === "asignador")
    ) {
        acciones.push({
            label: "Por Asignar",
            icon: <FileText size={14} />,
            action: () => navigate(`/asignador/peticiones`),
        })
    }

    if (
        permisosRol.find(
            (p) => p.accion === "dashboard" && p.tabla === "asignador"
        )?.accion
    ) {
        acciones.push({
            label: "Historial Peticiones",
            icon: <Archive size={14} />,
            action: () => navigate(`/asignador/historial_peticiones_usuario`),
        })
        acciones.push({
            label: "Responsables",
            icon: <Users size={14} />,
            action: () => navigate(`/asignador/responsables_pqs`),
        })
    }

    const handleClose = () => {
        navigate(`/${currentRole}/perfil`)
        setMenuOpen(false)
    }

    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <header className="fixed z-50 w-full shadow-md">
            {/* Primera fila (principal) */}
            <div className="w-full bg-[#0A192F]">
                <div className="max-w-7xl mx-auto flex justify-between items-center h-16 px-4">
                    {/* Logo y título */}
                    <div className="flex items-center gap-2 font-bold text-white">
                        <img src={logo} alt="Logo" className="w-8 h-8" />
                        <span className="text-lg sm:text-xl">Plataforma PQRSD</span>
                    </div>

                    {/* Menú usuario (solo en escritorio) */}
                    <div className="hidden sm:flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-[#173A5E] flex items-center justify-center text-white font-semibold">
                            {userInfo.iniciales}
                        </div>

                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger className="px-3 py-2 text-sm text-white bg-[#0A192F] hover:bg-blue-700 rounded-md flex items-center gap-1 focus:outline-none">
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
                                    <FaUserCog size={14} /> Rol: {user?.rol?.nombre || "N/A"}
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
                                            <AppWindow size={14} />{" "}
                                            {d.tabla.charAt(0).toUpperCase() + d.tabla.slice(1)}
                                        </DropdownMenuItem>
                                    ))}

                                <DropdownMenuItem
                                    onClick={async () => await logout()}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer rounded"
                                >
                                    <LogOut size={14} /> Cerrar sesión
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Botón menú móvil */}
                    <button
                        className="sm:hidden text-white hover:text-blue-300 bg-[#0A192F]"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {menuOpen ? <X size={26} /> : <Menu size={26} />}
                    </button>
                </div>
            </div>

            {/* Segunda fila (menú horizontal) escritorio */}
            <div className="w-full bg-[#173A5E] hidden sm:flex">
                <div className="max-w-7xl mx-auto flex justify-between items-center h-12 w-full px-4">
                    <div className="flex items-center gap-3">
                        {acciones.map(({ label, icon, action }) => (
                            <Button
                                key={label}
                                onClick={action}
                                className="px-3 py-2 text-sm bg-[#173A5E] text-white hover:bg-blue-700 rounded-md flex items-center gap-2"
                            >
                                {React.cloneElement(icon, { size: 18 })}
                                {label}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Menú móvil desplegable */}
            {menuOpen && (
                <div className="sm:hidden bg-[#173A5E] text-white shadow-md">
                    <div className="flex flex-col items-start gap-2 p-4">
                        {acciones.map(({ label, icon, action }) => (
                            <button
                                key={label}
                                onClick={() => {
                                    action()
                                    setMenuOpen(false)
                                }}
                                className="w-full text-left bg-[#173A5E] flex items-center gap-2 px-3 py-2 rounded-md hover:bg-blue-700"
                            >
                                {React.cloneElement(icon, { size: 18 })}
                                {label}
                            </button>
                        ))}

                        <hr className="border-blue-800 w-full my-2" />

                        <button
                            onClick={handleClose}
                            className="w-full flex items-center bg-[#173A5E] gap-2 px-3 py-2 hover:bg-blue-700 rounded-md"
                        >
                            <User size={16} /> Mi Perfil
                        </button>

                        <button
                            onClick={async () => await logout()}
                            className="w-full flex items-center bg-[#173A5E] gap-2 px-3 py-2 text-red-400 hover:bg-red-700 rounded-md"
                        >
                            <LogOut size={16} /> Cerrar sesión
                        </button>
                    </div>
                </div>
            )}
        </header>
    )
}

export default Navbar
