import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthProvider"
import { ChevronDown, FileText, Home, LayoutDashboard, Settings2, User, LogOut } from "lucide-react"
import logo from "../../assets/Logo.webp"

const Navbar: React.FC = () => {
  const navigate = useNavigate()
  const { logout, permisos, user } = useAuth()

  const [showDashboards, setShowDashboards] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  // 🔹 Referencias para detectar clics fuera
  const userMenuRef = useRef<HTMLDivElement>(null)
  const dashboardsRef = useRef<HTMLDivElement>(null)

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false)
      }
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
    nombre:
      user?.persona.nombre +
        " " +
        user?.persona.apellido || "Usuario",
    iniciales:
      user?.persona.nombre && user?.persona.apellido
        ? user?.persona.nombre![0].toUpperCase() + user?.persona.apellido![0].toUpperCase()
        : "U",
  }

  const location = useLocation()
  const currentRole = location.pathname.split("/")[1]
  const permisosRol = permisos.filter(p => p.tabla === currentRole)

  const acciones = [
    {
      label: "Inicio",
      icon: <Home size={14} />,
      action: () => {
        const inicioPermiso = permisosRol.find(p => p.accion === "dashboard")
        if (inicioPermiso) {
          navigate(`/${inicioPermiso.tabla}/inicio`)
        }
      },
    },
    {
      label: "Peticiones",
      icon: <FileText size={14} />,
      action: () => {
        const peticionesPermiso = permisosRol.find(p => p.accion === "dashboard")
        if (peticionesPermiso) {
          navigate(`/${peticionesPermiso.tabla}/peticiones`)
        }
      },
    },
  ]

  const dashboards = permisos.filter((p) => p.accion === "dashboard")

  return (
    <header className="fixed top-0 left-0 z-50 w-full shadow-md">
      {/* Primera fila */}
      <div className="w-full bg-[#0A192F]">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
          <div className="flex items-center gap-2 font-bold text-white">
            <img src={logo} alt="Logo" className="w-8 h-8" />
            <span className="text-xl">Plataforma de Gestión PQRSDF</span>
          </div>

          {/* 🔹 Avatar + Nombre + Menú */}
          <div className="flex items-center gap-2 relative" ref={userMenuRef}>
            <div className="bg-blue-600 text-white rounded-full w-9 h-9 flex items-center justify-center text-sm font-bold shadow-md">
              {userInfo.iniciales}
            </div>

            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="hidden md:flex items-center gap-1  text-white bg-blue-600 text-sm font-medium focus:outline-none"
            >
              {userInfo.nombre}
              <ChevronDown
                size={16}
                className={`transition-transform ${showUserMenu ? "rotate-180" : ""}`}
              />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-12 bg-gray-50 border border-gray-200 rounded-md shadow-lg z-50">
                <ul className="py-1">
                  <li
                    onClick={() => {
                      navigate(`/${currentRole}/perfil`, { state: { from: location.pathname } })
                      setShowUserMenu(false)
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    <User size={14} /> Mi Perfil
                  </li>
                  <li
                    onClick={() => {
                      navigate("/perfil")
                      setShowUserMenu(false)
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    <Settings2 size={14} /> Configuración
                  </li>
                  <li
                    onClick={async () => {
                      await logout()
                      setShowUserMenu(false)
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    <LogOut size={14} /> Cerrar sesión
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Segunda fila */}
      <div className="w-full bg-[#173A5E]">
        <div className="max-w-7xl mx-auto px-4 flex items-center h-12 gap-6">
          {/* 🔹 Acciones rápidas */}
          <div className="flex items-center gap-2 ">
            {acciones.map((a) => (
              <button
                key={a.label}
                onClick={a.action}
                className="flex items-center px-3 py-1 gap-1 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow transition"
              >
                {a.icon}
                <span>{a.label}</span>
              </button>
            ))}
          </div>

          {/* 🔹 Botón de dashboard */}
          {dashboards.length > 1 && (
            <div className="ml-auto relative" ref={dashboardsRef}>
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
                        key={`/${d.tabla}`}
                        onClick={() => {
                          navigate(`/${d.tabla}`)
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
