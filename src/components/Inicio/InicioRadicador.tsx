import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../ui/card";
import { CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { FileText, BarChart3, ClipboardList, User, Users } from "lucide-react";
import Breadcrumbs from "../Navegacion/Breadcrumbs";
import apiServiceWrapper from "../../api/ApiService";
import type { PaginatedResponse } from "../../models/PaginatedResponse";
import type { PqItem } from "../../models/PqItem";
import { useAuth } from "../../context/AuthProvider";
const InicioRadicador: React.FC = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const api = apiServiceWrapper
    const currentRole = location.pathname.split("/")[1]

    // Stats dinámicas
    const [stats, setStats] = useState({
        pendientes: 0,
        aceptadas: 0,
        rechazadas: 0,
    })

    const fetchResumen = async () => {
        try {
            const pendientes = await api.get<PaginatedResponse<PqItem>>("/pqs/sin_responsable", { page: 0, size: 1 })
            const aceptadas = await api.get<PaginatedResponse<PqItem>>("/pqs/aceptadas", { page: 0, size: 1 })
            const rechazadas = await api.get<PaginatedResponse<PqItem>>("/pqs/rechazadas", { page: 0, size: 1 })

            setStats({
                pendientes: pendientes.total_count ?? 0,
                aceptadas: aceptadas.total_count ?? 0,
                rechazadas: rechazadas.total_count ?? 0,
            })
        } catch (error) {
            console.error("Error cargando resumen Radicador", error)
        }
    }

    useEffect(() => {
        fetchResumen()
    }, [])

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <div className="w-full p-32">
                <div className="max-w-7xl mx-auto">
                    {/* Breadcrumbs */}
                    <div className="mb-6">
                        <Breadcrumbs />
                        <div className="flex items-center justify-between mt-2">
                            <h1 className="text-2xl font-bold text-blue-900">Inicio Radicador</h1>
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
                                        onClick={() => navigate(`/${currentRole}/dashboard`)}
                                    >
                                        <FileText className="w-5 h-5 mr-2" />
                                        Solicitudes Pendientes
                                    </Button>
                                    <Button variant="outline" className="hover:bg-gray-100">
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
                                <p className="text-3xl font-bold text-orange-500">{stats.pendientes}</p>
                                <p className="text-gray-600">Pendientes de Radicación</p>
                            </CardContent>
                        </Card>
                        <Card className="text-center shadow hover:shadow-lg transition">
                            <CardContent className="p-6">
                                <p className="text-3xl font-bold text-green-600">{stats.aceptadas}</p>
                                <p className="text-gray-600">Solicitudes Aceptadas</p>
                            </CardContent>
                        </Card>
                        <Card className="text-center shadow hover:shadow-lg transition">
                            <CardContent className="p-6">
                                <p className="text-3xl font-bold text-red-600">{stats.rechazadas}</p>
                                <p className="text-gray-600">Solicitudes Rechazadas</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Accesos rápidos */}
                    <h2 className="text-xl font-semibold text-blue-900 mt-10 mb-4">Accesos rápidos</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <Card
                            className="cursor-pointer hover:shadow-lg transition"
                            onClick={() => navigate(`/${currentRole}/dashboard`)}
                        >
                            <CardContent className="flex flex-col items-center p-6">
                                <ClipboardList className="w-8 h-8 text-blue-600 mb-2" />
                                <p className="font-semibold text-blue-900">Gestión de Solicitudes</p>
                            </CardContent>
                        </Card>

                        <Card
                            className="cursor-pointer hover:shadow-lg transition"
                            onClick={() => navigate(`/${currentRole}/reportes`)}
                        >
                            <CardContent className="flex flex-col items-center p-6">
                                <BarChart3 className="w-8 h-8 text-blue-600 mb-2" />
                                <p className="font-semibold text-blue-900">Reportes</p>
                            </CardContent>
                        </Card>

                        <Card
                            className="cursor-pointer hover:shadow-lg transition"
                            onClick={() => navigate(`/${currentRole}/asignaciones`)}
                        >
                            <CardContent className="flex flex-col items-center p-6">
                                <Users className="w-8 h-8 text-blue-600 mb-2" />
                                <p className="font-semibold text-blue-900">Asignaciones</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Guía rápida */}
                    <h2 className="text-xl font-semibold text-blue-900 mt-10 mb-4">Guía rápida</h2>
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

export default InicioRadicador