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
    <div className="min-h-screen w-screen bg-gradient-to-b from-[#0A192F] to-[#173A5E] text-white flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 relative">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src={Logo} className="h-10 w-10 md:h-12 md:w-12" />
          <span className="text-base md:text-lg font-bold leading-tight">
            Secretaría de Tránsito y Transporte de Girardot
          </span>
        </div>

        {/* Botones desktop */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={handleLoginClick}
            className="px-4 py-2 rounded-lg bg-white text-[#0A192F] font-medium hover:bg-gray-200 transition"
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => navigate("/register")}
            className="px-4 py-2 rounded-lg bg-[#1E4C7C] hover:bg-[#173A5E] transition font-medium"
          >
            Registrarse
          </button>
        </div>

        {/* Botón hamburguesa en móvil */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-[#1E4C7C] transition"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Menú móvil */}
        {menuOpen && (
          <div className="absolute top-full right-0 mt-2 bg-[#0A192F] w-48 rounded-lg shadow-lg flex flex-col md:hidden z-50">
            <button
              onClick={() => {
                handleLoginClick()
                setMenuOpen(false)
              }}
              className="px-4 py-2 text-left hover:bg-[#173A5E] rounded-t-lg"
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => {
                navigate("/register")
                setMenuOpen(false)
              }}
              className="px-4 py-2 text-left hover:bg-[#173A5E] rounded-b-lg"
            >
              Registrarse
            </button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col md:flex-row items-center justify-center px-6 md:px-12 py-8 md:py-0 gap-10">
        {/* Texto */}
        <div className="md:w-1/2 text-center md:text-left space-y-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
            Sistema PQRSDF de la Secretaría de Tránsito
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300">
            Radique sus Peticiones, Quejas, Reclamos, Sugerencias, Denuncias y
            Felicitaciones de manera fácil y rápida.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button
              onClick={() => navigate("/register")}
              className="px-6 py-3 rounded-lg bg-[#1E4C7C] hover:bg-[#173A5E] transition font-semibold w-full sm:w-auto"
            >
              Radicar PQRSDF
            </button>
          </div>
        </div>

        {/* Imagen */}
        <div className="md:w-1/2 flex justify-center">
          <img
            src={landing}
            alt="landing"
            className="rounded-xl shadow-2xl w-4/5 md:w-full max-w-md md:max-w-lg"
          />
        </div>
      </section>
    </div>
  )
}

export default LandingPage
