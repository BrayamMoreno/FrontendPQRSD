import type React from "react"
import { useState } from "react"
import { FaBars } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthProvider"

type MenuOpcion = {
  label: string
  action: () => void | Promise<void>
  roles?: string[]
}

type MenuGrupo = {
  grupo: string
  roles: string[]
  opciones: MenuOpcion[]
}

const Navbar: React.FC = () => {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [activeGrupo, setActiveGrupo] = useState<string | null>(null)

  const rol = sessionStorage.getItem("usuario_rol_nombre") || ""

  const userInfo = {
    nombre:
      sessionStorage.getItem("persona_nombre")?.split(" ")[0] +
        " " +
        sessionStorage.getItem("persona_apellido")?.split(" ")[0] || "Usuario",
    iniciales:
      sessionStorage.getItem("persona_nombre") && sessionStorage.getItem("persona_apellido")
        ? sessionStorage.getItem("persona_nombre")![0] + sessionStorage.getItem("persona_apellido")![0]
        : "U",
  }

  const menuItems: MenuGrupo[] = [
    {
      grupo: "Gestión",
      roles: ["Admin"],
      opciones: [
        { label: "Dashboard Admin", action: () => navigate("/admin/dashboard") },
        { label: "Usuarios", action: () => navigate("/admin/dashboard/gestion_usuarios") },
        { label: "Roles", action: () => navigate("/admin/dashboard/roles") },
        { label: "Tipos de Documentos", action: () => navigate("/admin/dashboard/tipos_documentos") },
        { label: "Tipos de Personas", action: () => navigate("/admin/dashboard/tipos_personas") },
      ],
    },
    {
      grupo: "Peticiones",
      roles: ["Usuario", "Radicador", "Contratista"],
      opciones: [
        { label: "Peticiones Radicadas", action: () => navigate("/usuario/dashboard"), roles: ["Usuario"] },
        { label: "Peticiones Pendientes", action: () => navigate("/radicador/dashboard"), roles: ["Radicador"] },
        { label: "Peticiones Asignadas", action: () => navigate("/contratista/dashboard"), roles: ["Contratista"] },
        { label: "Todas las Peticiones", action: () => navigate("/contratista/dashboard"), roles: ["Contratista"] },
      ],
    },
    {
      grupo: "General",
      roles: ["Admin", "Usuario", "Radicador", "Contratista"],
      opciones: [
        { label: "Faqs", action: () => navigate("/faqs") },
        { label: "Perfil", action: () => navigate("/dashboard/mostrar_perfil") },
        { label: "Salir", action: () => logout() },
      ],
    },
  ]

  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        {/* Primera fila: logo y usuario */}
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer font-bold text-gray-800"
            onClick={() => navigate("/")}
          >
            <FaBars className="text-xl text-blue-600" />
            <span className="text-xl">Plataforma Integral de Gestión PQRSDF</span>
          </div>

          {/* Usuario */}
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="bg-blue-600 text-white rounded-full w-9 h-9 flex items-center justify-center text-sm font-bold shadow-md">
              {userInfo.iniciales}
            </div>
            <span className="hidden md:inline text-gray-800 text-sm font-medium">{userInfo.nombre}</span>
          </div>
        </div>
      </div>
      
      {/* Segunda fila: cinta de opciones. Separada para que la barra se extienda al 100% del ancho */}
      <div className="bg-blue-100 text-white">
        <div className="max-w-7xl mx-auto px-4 flex">
          {menuItems
            .filter((item) => item.roles.includes(rol))
            .map(({ grupo }) => (
              <div key={grupo} className="relative">
                <div
                  onClick={() => setActiveGrupo(activeGrupo === grupo ? null : grupo)}
                  className={`px-4 py-2 text-sm font-medium cursor-pointer transition-colors ${
                    activeGrupo === grupo
                      ? "bg-blue-700"
                      : "hover:bg-blue-500"
                  }`}
                >
                  {grupo}
                </div>

                {/* Menú desplegable */}
                {activeGrupo === grupo && (
                  <div className="absolute left-0 mt-0 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <ul className="py-1">
                      {menuItems
                        .find((item) => item.grupo === grupo)
                        ?.opciones.filter((opcion) => !opcion.roles || opcion.roles.includes(rol))
                        .map(({ label, action }) => (
                          <li
                            key={label}
                            onClick={() => {
                              action()
                              setActiveGrupo(null) // cerrar menú después de click
                            }}
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
                          >
                            {label}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </header>
  )
}

export default Navbar