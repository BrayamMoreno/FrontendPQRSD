import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../ui/card";
import { CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { FileText, User, Users } from "lucide-react";
import Breadcrumbs from "../Navegacion/Breadcrumbs";
import apiServiceWrapper from "../../api/ApiService";
import { useAuth } from "../../context/AuthProvider";

interface stats {
    asignadas: number;
    rechazadas: number;
    por_asignar: number;
}

const InicioAsignador: React.FC = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const api = apiServiceWrapper
    const currentRole = location.pathname.split("/")[1]

    const personaId = user?.persona?.id || 0

    const [stats, setStats] = useState<stats>({
        asignadas: 0,
        rechazadas: 0,
        por_asignar: 0,
    })

    const fetchResumen = async () => {
        try {
            const response = await api.getAll(`/pqs/conteo-asignador/${personaId}`);

            const conteo = response.data as stats

            setStats({
                asignadas: conteo.asignadas ?? 0,
                rechazadas: conteo.rechazadas ?? 0,
                por_asignar: conteo.por_asignar ?? 0,
            })
        } catch (error) {
            console.error("Error cargando resumen Asignador", error)
        }
    }

    useEffect(() => {
        fetchResumen()
    }, [])

    return (
        <div className="min-h-screen w-full bg-gray-50">
            <div className="w-full px-4 sm:px-6 lg:px-8 pt-32 pb-8 ">
                <div className="max-w-7xl mx-auto">
                    {/* Breadcrumbs */}
                    <div className="mb-6">
                        <Breadcrumbs />
                        <div className="flex items-center justify-between mt-2">
                            <h1 className="text-2xl font-bold text-blue-900">Inicio Asignador STTG</h1>
                        </div>
                    </div>

                    {/* Bienvenida */}
                    <Card className="bg-white rounded-2xl hover:shadow-lg  transition">
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
                                    Desde aquí podrás gestionar solicitudes pendientes, asignar responsables y dar
                                    seguimiento al proceso de radicación PQRSD.
                                </p>

                                {/* Acciones principales */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <Button
                                        className="bg-blue-600 text-white hover:bg-blue-700"
                                        onClick={() => navigate(`/${currentRole}/peticiones`)}
                                    >
                                        <FileText className="w-5 h-5 mr-2" />
                                        Solicitudes Pendientes
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="hover:bg-gray-100"
                                        onClick={() => navigate(`/${currentRole}/responsables_pqs`)}
                                        >
                                        <Users className="w-5 h-5 mr-2" />
                                        Ver Responsable
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Indicadores */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
                        <Card className="text-center shadow hover:shadow-lg transition">
                            <CardContent className="p-6">
                                <p className="text-3xl font-bold text-green-600">{stats.asignadas}</p>
                                <p className="text-gray-600">Solicitudes Asignadas</p>
                            </CardContent>
                        </Card>
                        <Card className="text-center shadow hover:shadow-lg transition">
                            <CardContent className="p-6">
                                <p className="text-3xl font-bold text-red-600">{stats.rechazadas}</p>
                                <p className="text-gray-600">Solicitudes Rechazadas</p>
                            </CardContent>
                        </Card>
                        <Card className="text-center shadow hover:shadow-lg transition">
                            <CardContent className="p-6">
                                <p className="text-3xl font-bold text-yellow-500">{stats.por_asignar}</p>
                                <p className="text-gray-600">Solicitudes por Asignar</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Guía rápida */}
                    <h2 className="text-xl font-semibold text-blue-900 mt-10">Guía rápida</h2>
                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                        <li>1. Revisa las <b>solicitudes pendientes</b> en tu tablero.</li>
                        <li>2. Asigna responsables según el tipo de solicitud.</li>
                        <li>3. Marca como <b>aceptada</b> o <b>rechazada</b> según corresponda.</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default InicioAsignador