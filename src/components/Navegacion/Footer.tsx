import { Facebook, Twitter, Instagram, Mail, Phone } from "lucide-react"

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#173A5E] text-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Columna 1 - Logo / Descripción */}
        <div>
          <h2 className="text-xl font-bold text-white mb-3">Mi Aplicación</h2>
          <p className="text-sm text-gray-300">
            Plataforma para la gestión de solicitudes PQRSD de manera
            rápida, organizada y segura.
          </p>
        </div>

        {/* Columna 2 - Links rápidos */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Enlaces útiles</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Inicio
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Mis Peticiones
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Radicar Solicitud
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Ayuda
              </a>
            </li>
          </ul>
        </div>

        {/* Columna 3 - Contacto / Redes */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Contáctanos</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              soporte@miapp.com
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              +57 300 123 4567
            </li>
          </ul>

          <div className="flex gap-4 mt-4">
            <a href="#" className="hover:text-white">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-white">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-white">
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Línea inferior */}
      <div className="border-t border-blue-700 mt-6">
        <p className="text-center text-sm text-gray-400 py-4">
          © {new Date().getFullYear()} Mi Aplicación — Todos los derechos reservados
        </p>
      </div>
    </footer>
  )
}

export default Footer
