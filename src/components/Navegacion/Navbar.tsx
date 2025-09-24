import React, { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthProvider"
import {
  ChevronDown,
  FileText,
  Home,
  LayoutDashboard,
  Settings2,
  User,
  LogOut,
} from "lucide-react"
import logo from "../../assets/Logo.webp"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

const Navbar: React.FC = () => {
  const navigate = useNavigate()
  const { logout, permisos, user } = useAuth()

  const [showDashboards, setShowDashboards] = useState(false)

  const userMenuRef = useRef<HTMLDivElement>(null)
  const dashboardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      )
        if (
          dashboardsRef.current &&
          !dashboardsRef.current.contains(event.target as Node)
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
    nombre: user?.persona
      ? `${user.persona.nombre} ${user.persona.apellido}`
      : "Usuario",
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
      (p) => p.accion === "dashboard" && p.tabla === "contratista"
    )
  ) {
    acciones.push({
      label: "Peticiones Pendientes",
      icon: <FileText size={14} />,
      action: () => navigate(`/${currentRole}/peticiones_pendientes`),
    })
  }

  if (
    permisosRol.find(
      (p) => p.accion === "dashboard" && p.tabla === "contratista"
    )
  ) {
    acciones.push({
      label: "Historial Peticiones",
      icon: <FileText size={14} />,
      action: () => navigate(`/${currentRole}/historial_peticiones`),
    })
  }

  if (
    permisosRol.find((p) => p.accion === "dashboard" && p.tabla === "usuario")
  ) {
    acciones.push({
      label: "Mis Peticiones",
      icon: <FileText size={14} />,
      action: () => navigate(`/${currentRole}/peticiones`),
    })
  }

  if (
    permisosRol.find((p) => p.accion === "dashboard" && p.tabla === "radicador")
  ) {
    acciones.push({
      label: "Por Asignar",
      icon: <FileText size={14} />,
      action: () => navigate(`/${currentRole}/peticiones`),
    })
  }

  return (
    <header className="fixed z-50 w-screen shadow-md">
      {/* Primera fila */}
      <div className="w-full bg-[#0A192F]">
        <div className="max-w-7xl mx-auto flex justify-between items-center h-16">
          <div className="flex items-center gap-2 font-bold text-white">
            <img src={logo} alt="Logo" className="w-8 h-8" />
            <span className="text-xl">Plataforma de Gestión PQRSDF</span>
          </div>

          {/* 🔹 Avatar + Nombre + Menú */}
          <div className="hidden sm:flex items-center gap-2">
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
        <div className="max-w-7xl mx-auto flex justify-between items-center h-12 w-full">
          {/* Menú horizontal (izquierda) */}
          <div className="flex items-center gap-3">
            {acciones.map(({ label, icon, action }) => (
              <DropdownMenu modal={false} key={label}>
                <DropdownMenuTrigger
                  className="px-3 py-2 text-sm text-white hover:bg-blue-700 rounded-md flex items-center gap-1"
                  onClick={(e) => {
                    action()
                    e.currentTarget.blur()
                  }}
                >
                  <span className="flex items-center gap-2">
                    {React.cloneElement(icon, { size: 18 })}
                    {label}
                  </span>
                </DropdownMenuTrigger>
              </DropdownMenu>
            ))}
          </div>

          {/* Dashboard button (derecha) */}
          {dashboards.length > 1 && (
            <div className="relative">
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
    </header>
  )
}

export default Navbar
