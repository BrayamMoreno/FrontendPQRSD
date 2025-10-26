import type React from "react"
import { useNavigate } from "react-router-dom"
import landing from "../../assets/landing.webp"
import Logo from "../../assets/Logo.webp"
import { useAuth } from "../../context/AuthProvider"
import { useState } from "react"
import { Menu, X } from "lucide-react"

const LandingPage: React.FC = () => {
  const navigate = useNavigate()
  const { isAuthenticated, permisos } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLoginClick = () => {
    if (isAuthenticated) {
      const dashboards = permisos.filter((p) => p.accion === "dashboard")
      if (dashboards.length > 0) {
        navigate(`/${dashboards[0].tabla}/inicio`)
      } else {
        navigate("/") // fallback si no hay dashboards
      }
    } else {
      navigate("/login")
    }
  }

  return (
    <div className="min-h-screen w-screen bg-gradient-to-b from-[#0A192F] to-[#173A5E] text-white flex flex-col font-sans">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4  border-b border-[#1C2A50] relative">
        {/* Logo y texto */}
        <div className="flex items-center gap-3">
          <img src={Logo} className="h-8 w-8 md:h-10 md:w-10" alt="Logo Girardot" />
          <span className="text-sm sm:text-base md:text-lg font-semibold">
            Secretaría de Tránsito y Transporte de Girardot
          </span>
        </div>

        {/* Botones desktop */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={handleLoginClick}
            className="px-4 py-2 rounded-md bg-[#1E4C7C] hover:bg-[#173A5E] transition text-sm font-medium"
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => navigate("/register")}
            className="px-4 py-2 rounded-md bg-[#1E4C7C] hover:bg-[#173A5E] transition text-sm font-medium"
          >
            Registrarse
          </button>
        </div>

        {/* Botón hamburguesa en móvil */}
        <button
          className="md:hidden p-2 rounded-md bg-[#1E4C7C] hover:bg-[#173A5E] transition"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Menú móvil */}
        {menuOpen && (
          <div className="absolute top-full right-0 mt-2 bg-[#1E4C7C] hover:bg-[#173A5E] w-44 rounded-lg shadow-lg flex flex-col md:hidden z-50 border border-[#1C2A50]">
            <button
              onClick={() => {
                handleLoginClick()
                setMenuOpen(false)
              }}
              className="px-4 py-2 text-left bg-[#1E4C7C] hover:bg-[#173A5E]"
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => {
                navigate("/register")
                setMenuOpen(false)
              }}
              className="px-4 py-2 text-left bg-[#1E4C7C] hover:bg-[#173A5E]"
            >
              Registrarse
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col md:flex-row items-center justify-center px-6 md:px-12 py-12 gap-10">
        {/* Texto principal */}
        <div className="md:w-1/2 text-center md:text-left space-y-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
            Sistema PQRSD de la Secretaría de Tránsito
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300">
            Radique sus Peticiones, Quejas, Reclamos, Sugerencias y Denuncias de manera fácil y rápida.
          </p>
          <div>
            <button
              onClick={() => navigate("/login")}
              className="mt-4 px-6 py-3 rounded-md bg-[#1E4C7C] hover:bg-[#173A5E] transition font-semibold text-white shadow-md"
            >
              Radicar PQRSD
            </button>
          </div>
        </div>

        {/* Imagen decorativa */}
        <div className="md:w-1/2 flex justify-center">
          <img
            src={landing}
            alt="landing"
            className="rounded-xl shadow-2xl w-4/5 md:w-full max-w-md md:max-w-lg"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-4 text-gray-400 text-sm border-t border-[#1C2A50]">
        © 2025 Secretaría de Tránsito y Transporte de Girardot. Todos los derechos reservados.
      </footer>
    </div>
  )
}

export default LandingPage