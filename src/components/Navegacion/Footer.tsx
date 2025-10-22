import { Mail, Phone } from "lucide-react";

const Footer: React.FC = () => {
    return (
        <footer className="bg-[#173A5E] text-gray-200">
            <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Columna 1 - Logo / Descripción */}
                <div>
                    <h2 className="text-xl font-bold text-white mb-3">Plataforma PQRSD</h2>
                    <p className="text-sm text-gray-300">
                        Plataforma para la radicación y seguimiento de Peticiones, Quejas, Reclamos, Sugerencias, Denuncias y Otros (PQRSD) del
                        Municipio de Girardot - Cundinamarca.
                    </p>
                </div>

                {/* Columna 2 - Datos de contacto */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Datos de contacto</h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li><b>Dirección: </b> Carrera 11 No. 17 - Esquina, Palacio Municipal. Girardot - Cundinamarca</li>
                        <li><b>Oficiona:</b> Cuarto Piso, Secretaria de Transito y Transporte</li>
                        <li className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            transitoytransporte@girardot-cundinamarca.gov.co
                        </li>
                        <li className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            (601) 8393510 ext. 1070
                        </li>
                        <li><b>Horario atención al público:</b> Lunes a Viernes de 08:00 a.m. a 12:00 m. y 02:00 p.m. a 06:00 p.m.</li>
                    </ul>
                </div>

            </div>

            {/* Línea inferior */}
            <div className="border-t border-blue-700">
                <p className="text-center text-sm text-gray-400 py-4">
                    © {new Date().getFullYear()} Mi Aplicación — Todos los derechos reservados
                </p>
            </div>
        </footer>
    )
}

export default Footer;
