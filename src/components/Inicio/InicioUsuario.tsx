import { FileText, User, HelpCircle, ClipboardList, Bell } from "lucide-react"
import { useAuth } from "../../context/AuthProvider"
import Breadcrumbs from "../Navegacion/Breadcrumbs"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { useNavigate } from "react-router-dom"
import { use, useEffect, useState } from "react"
import config from "../../config"

interface ResumenEstados {
    resueltas: number;
    rechazadas: number;
    pendientes: number;
}

const InicioUsuario: React.FC = () => {
    const { user } = useAuth()
    const navigate = useNavigate()

    const baseUrl = config.apiBaseUrl

    const currentRole = location.pathname.split("/")[1]

    const personaId = user?.persona?.id;

    const [resumen, setResumen] = useState<ResumenEstados | null>(null);

    useEffect(() => {
        const fetchResumen = async () => {
            try {
                const response = await fetch(`${baseUrl}/pqs/conteo?solicitanteId=${personaId}`);
                const data = await response.json();
                setResumen(data);
            } catch (error) {
                console.error("Error al obtener el resumen:", error);
            }
        };
        fetchResumen();
    }, []);

    return (
        <div className="min-h-screen w-full bg-gray-50">
            <div className="w-full px-4 sm:px-6 lg:px-8 pt-32 pb-8 ">
                <div className="max-w-7xl mx-auto">
                    {/* Breadcrumbs */}
                    <div className="mb-6">
                        <Breadcrumbs />
                        <div className="flex items-center justify-between mt-2">
                            <h1 className="text-2xl font-bold text-blue-900">Inicio</h1>
                        </div>
                    </div>

                    {/* Bienvenida */}
                    <Card className="bg-white rounded-2xl hover:shadow-xl transition mb-8">
                        <CardContent>
                            <div className="flex flex-col items-center text-center space-y-6 py-6">
                                {/* Avatar */}
                                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center shadow-md">
                                    <User className="w-10 h-10 text-blue-700" />
                                </div>

                                {/* Título */}
                                <h1 className="text-3xl font-bold text-blue-900">
                                    ¡Bienvenido
                                    {user?.persona?.nombre ? `, ${user?.persona?.nombre} ${user?.persona?.apellido}` : ""}!
                                </h1>

                                {/* Subtítulo */}
                                <p className="text-gray-600 max-w-xl">
                                    Aquí podrás gestionar tus solicitudes PQRSD, hacer seguimiento y mantener toda tu
                                    información organizada en un solo lugar.
                                </p>


                                {/* Acciones principales */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <Button
                                        className="bg-blue-600 text-white hover:bg-blue-700"
                                        onClick={() => navigate("/usuario/peticiones", { state: { modal: true } })}
                                    >
                                        <FileText className="w-5 h-5 mr-2" />
                                        Radicar mi Solicitud
                                    </Button>
                                    <Button variant="outline" className="hover:bg-gray-100">
                                        <HelpCircle className="w-5 h-5 mr-2" />
                                        Ver guía de uso
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Indicadores */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
                        <Card className="text-center shadow hover:shadow-lg transition">
                            <CardContent className="p-6">
                                <p className="text-3xl font-bold text-blue-700">{resumen?.pendientes || 0}</p>
                                <p className="text-gray-600">Solicitudes Pendientes</p>
                            </CardContent>
                        </Card>
                        <Card className="text-center shadow hover:shadow-lg transition">
                            <CardContent className="p-6">
                                <p className="text-3xl font-bold text-green-600">{resumen?.rechazadas || 0}</p>
                                <p className="text-gray-600">Solicitudes Rechazadas</p>
                            </CardContent>
                        </Card>
                        <Card className="text-center shadow hover:shadow-lg transition">
                            <CardContent className="p-6">
                                <p className="text-3xl font-bold text-orange-500">{resumen?.resueltas || 0}</p>
                                <p className="text-gray-600">Solicitudes Resueltas</p>
                            </CardContent>
                        </Card>
                    </div>


                    {/* Guía rápida */}
                    <h2 className="text-xl font-semibold text-blue-900 mt-10 mb-4">Guía rápida</h2>
                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                        <li>1. Radica tu solicitud en la sección <b>Mis Peticiones</b>.</li>
                        <li>2. Haz seguimiento en <b>Mis Peticiones - Ver Detalles</b>.</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default InicioUsuario
