import type React from "react"
import { useNavigate } from "react-router-dom"
import landing from "../assets/Landing.webp"
import Logo from "../assets/Logo.webp"
import { useAuth } from "../context/AuthProvider"

const LandingPage: React.FC = () => {
  const navigate = useNavigate()
  const { isAuthenticated, permisos } = useAuth()

  const handleLoginClick = () => {
    if (isAuthenticated) {
      // 👇 buscar dashboard disponible
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
    <div className="h-screen w-screen bg-gradient-to-b from-[#0A192F] to-[#173A5E] text-white flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <img src={Logo} className="h-12 w-12 text-white" />
          <span className="text-lg font-bold">
            Secretaría de Tránsito y Transporte de Girardot
          </span>
        </div>
        <div className="flex items-center gap-4">
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
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col md:flex-row items-center justify-center px-8">
        {/* Texto */}
        <div className="md:w-1/2 text-center md:text-left space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Sistema PQRSDF de la Secretaría de Tránsito
          </h1>
          <p className="text-lg md:text-xl text-gray-300">
            Radique sus Peticiones, Quejas, Reclamos, Sugerencias, Denuncias y
            Felicitaciones de manera fácil y rápida.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button
              onClick={() => navigate("/register")}
              className="px-6 py-3 rounded-lg bg-[#1E4C7C] hover:bg-[#173A5E] transition font-semibold"
            >
              Radicar PQRSDF
            </button>
            <a href="#como-funciona">
              <button className="px-6 py-3 rounded-lg border border-white hover:bg-white hover:text-[#0A192F] transition font-semibold">
                ¿Cómo funciona?
              </button>
            </a>
          </div>
        </div>

        {/* Imagen */}
        <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
          <img
            src={landing}
            alt="landing"
            className="rounded-xl shadow-2xl w-4/5 md:w-full"
          />
        </div>
      </section>
    </div>
  )
}

export default LandingPage
