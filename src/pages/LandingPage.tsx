import type React from "react"

import { Link } from "react-router-dom"
import {
  FaCheckCircle,
  FaCar,
} from "react-icons/fa"
import landingImage from "../assets/landing.webp"


const LandingPage: React.FC = () => {

  return (
    <div className="min-h-screen w-screen bg-white">
      {/* Navbar */}
      <nav className="bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <FaCar className="h-8 w-8 mr-2" />
              <span className="text-xl font-bold">Secretaría de Tránsito</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-40 flex items-baseline space-x-4">
                <a href="#servicios" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800">
                  Servicios
                </a>
                <a href="#como-funciona" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800">
                  Cómo Funciona
                </a>
                <a href="#tramites" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800">
                  Trámites
                </a>

                <a href="#faq" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800">
                  Preguntas Frecuentes
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <button className="px-4 py-2 border bg-blue-700 text-white rounded-md hover:bg-blue-800">
                  Iniciar Sesión
                </button>
              </Link>
              <Link to="/register">
                <button className="px-4 py-2 border bg-blue-700 text-white rounded-md hover:bg-blue-800">
                  Registrarse
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Sistema PQRSDF de la Secretaría de Tránsito</h1>
              <p className="text-xl mb-8">
                Presente sus Peticiones, Quejas, Reclamos, Sugerencias, Denuncias y Felicitaciones de manera fácil y
                rápida.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <button className="px-6 py-3 border bg-blue-700 text-white rounded-md font-medium hover:bg-blue-800">
                    Radicar PQRSDF
                  </button>
                </Link>
                <a href="#como-funciona">
                  <button className="px-6 py-3 border bg-blue-700 text-white rounded-md font-medu hover:bg-blue-800">
                    ¿Cómo funciona?
                  </button>
                </a>
              </div>
            </div>
            <div className="md:w-1/2">
              <img
                src={landingImage}
                alt="landingImage"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">¿Cómo funciona el sistema PQRSDF?</h2>
            <p className="mt-4 text-xl text-gray-600">
              Un proceso simple para presentar y dar seguimiento a sus solicitudes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              title="Registro en el Sistema"
              description="Cree una cuenta con su correo electrónico y documento de identidad para acceder al sistema."
            />
            <StepCard
              number="2"
              title="Radique su Solicitud"
              description="Seleccione el tipo de solicitud, complete el formulario con los detalles necesarios y adjunte documentos si es necesario."
            />
            <StepCard
              number="3"
              title="Seguimiento y Respuesta"
              description="Reciba actualizaciones sobre el estado de su solicitud y la respuesta oficial dentro de los plazos establecidos."
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Preguntas frecuentes</h2>
            <p className="mt-4 text-xl text-gray-600">Respuestas a las dudas más comunes sobre nuestros servicios</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <FaqItem
              question="¿Cuál es el tiempo de respuesta para una PQRSDF?"
              answer="Las peticiones se responden en un plazo máximo de 15 días hábiles, las quejas y reclamos en 15 días hábiles, y las denuncias en 30 días hábiles según la normativa vigente."
            />
            <FaqItem
              question="¿Cómo puedo consultar el estado de mi solicitud?"
              answer="Puede ingresar al sistema con su usuario y contraseña, y en la sección 'Mis Solicitudes' podrá ver el estado actual de cada una de sus PQRSDF."
            />
            <FaqItem
              question="¿Qué documentos necesito para radicar una petición?"
              answer="Para radicar una petición básica solo necesita su documento de identidad. Dependiendo del tipo de solicitud, es posible que se requieran documentos adicionales que podrá adjuntar en el sistema."
            />
            <FaqItem
              question="¿Puedo modificar una solicitud ya radicada?"
              answer="Una vez radicada la solicitud no se puede modificar, pero puede enviar información adicional a través del sistema seleccionando la opción 'Anexar documentos' en su solicitud."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Secretaría de Tránsito</h3>
              <p className="text-gray-400">
                Entidad encargada de planificar, regular y controlar el tránsito y transporte en nuestra jurisdicción.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Enlaces rápidos</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Inicio
                  </a>
                </li>
                <li>
                  <a href="#servicios" className="text-gray-400 hover:text-white">
                    Servicios
                  </a>
                </li>
                <li>
                  <a href="#como-funciona" className="text-gray-400 hover:text-white">
                    Cómo funciona
                  </a>
                </li>
                <li>
                  <a href="#tramites" className="text-gray-400 hover:text-white">
                    Trámites
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Información legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/transparencia" className="text-gray-400 hover:text-white">
                    Transparencia
                  </Link>
                </li>
                <li>
                  <Link to="/normatividad" className="text-gray-400 hover:text-white">
                    Normatividad
                  </Link>
                </li>
                <li>
                  <Link to="/politicas" className="text-gray-400 hover:text-white">
                    Políticas de privacidad
                  </Link>
                </li>
                <li>
                  <Link to="/terminos" className="text-gray-400 hover:text-white">
                    Términos y condiciones
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contacto</h4>
              <ul className="space-y-2 text-gray-400">
                <li>contacto@secretariatransito.gov.co</li>
                <li>Línea de atención: 01 8000 123 456</li>
                <li>Dirección: Calle Principal #123</li>
                <li>Horario: Lunes a Viernes 8:00 AM - 5:00 PM</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Secretaría de Tránsito. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-blue-900 text-white flex items-center justify-center text-2xl font-bold mb-4">
        {number}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}


function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div>
      <h4 className="text-lg font-bold mb-2 flex items-center">
        <FaCheckCircle className="text-blue-500 mr-2" /> {question}
      </h4>
      <p className="text-gray-600 ml-7">{answer}</p>
    </div>
  )
}

export default LandingPage;