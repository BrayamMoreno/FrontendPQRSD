import { UserCog, CheckCircle2 } from "lucide-react"

import { useAuth } from "../../context/AuthProvider"
import Breadcrumbs from "../Navegacion/Breadcrumbs"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table" // Asegúrate de tener estos componentes
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import type { PqItem } from "../../models/PqItem"
import type { PaginatedResponse } from "../../models/PaginatedResponse"
import apiServiceWrapper from "../../api/ApiService"
import { LoadingSpinner } from "../LoadingSpinner"
import clsx from "clsx"

const InicioFuncionario: React.FC = () => {

    const { user } = useAuth()
    const navigate = useNavigate()

    const api = apiServiceWrapper

    const [isLoading, setIsLoading] = useState(true)
    const [solicitudesPendientes, setSolicitudesPendientes] = useState<PqItem[]>([])
    const [solicitudesVencidas, setSolicitudesVencidas] = useState<PqItem[]>([])
    const [pendientesCount, setPendientesCount] = useState(0);
    const [vencidasCount, setVencidasCount] = useState(0);

    useEffect(() => {
        fetchAllData()
    }, [])

    const fetchAllData = async () => {
        try {
            await Promise.all([
                fetchData<PqItem>("pqs/proximas_a_vencer", setSolicitudesPendientes, setPendientesCount),
                fetchData<PqItem>("pqs/vencidas", setSolicitudesVencidas, setVencidasCount)
            ])
        } catch (error) {
            console.error("Error al cargar datos iniciales:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchData = async <T,>(
        endpoint: string,
        setter: React.Dispatch<React.SetStateAction<T[]>>,
        countSetter?: React.Dispatch<React.SetStateAction<number>>
    ): Promise<void> => {
        try {
            const params: Record<string, any> = {
                responsableId: user?.persona.id,
            };
            const response = await api.get<PaginatedResponse<T>>(endpoint, params);
            const result = response.data ?? [];
            countSetter?.(response.total_count);
            setter(result);
        } catch (error) {
            console.error(`Error al obtener los datos de ${endpoint}:`, error);
        }
    };

    return (
        <div className="min-h-screen w-full bg-gray-50">
            <div className="w-full px-4 sm:px-6 lg:px-8 pt-32 pb-8 ">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6">
                        {/* Breadcrumbs arriba */}
                        <Breadcrumbs />
                        {/* Contenedor de título y botón */}
                        <div className="flex items-center justify-between mt-2">
                            <h1 className="text-2xl font-bold text-blue-900">Inicio</h1>
                        </div>
                    </div>

                    {/* Bienvenida */}
                    <Card className="bg-white shadow-md border mb-8">
                        <CardContent className="text-center">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center shadow-md">
                                    <UserCog className="w-10 h-10 text-green-700" />
                                </div>
                                <h1 className="text-3xl font-bold text-blue-900">
                                    ¡Bienvenido
                                    {user?.persona?.nombre
                                        ? `, ${user?.persona?.nombre} ${user?.persona?.apellido}`
                                        : ""}!
                                </h1>
                                <p className="text-gray-600 max-w-xl">
                                    Desde aquí podrás gestionar y dar solución a las solicitudes PQRSD, así como administrar tu cuenta.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                        <Card className="w-full text-center shadow hover:shadow-lg transition">
                            <CardContent className="p-6 flex flex-col items-center">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-4">
                                        <LoadingSpinner />
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-3xl font-bold text-green-600">{pendientesCount || 0}</p>
                                        <p className="text-gray-600">Solicitudes Pendientes</p>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card
                            className={clsx(
                                "w-full text-center shadow transition rounded-2xl",
                                vencidasCount > 0
                                    ? "border-2 border-red-300 animate-pulse bg-red-100"
                                    : "hover:shadow-lg"
                            )}
                            style={
                                vencidasCount > 0
                                    ? {
                                        animation: "flashBg 1s infinite",
                                    }
                                    : {}
                            }
                        >
                            <style>
                                {`
                                    @keyframes flashBg {
                                        0%, 100% { background-color: #fee2e2; } /* rojo claro */
                                        50% { background-color: #fecaca; } /* rojo medio */
                                    }
                                `}
                            </style>

                            <CardContent className="p-6 flex flex-col items-center">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-4">
                                        <LoadingSpinner />
                                    </div>
                                ) : (
                                    <>
                                        <p
                                            className={clsx(
                                                "text-3xl font-bold",
                                                vencidasCount > 1
                                                    ? "text-red-700 animate-pulse"
                                                    : "text-orange-500"
                                            )}
                                        >
                                            {vencidasCount || 0}
                                        </p>
                                        <p className="text-gray-600">Solicitudes Vencidas</p>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                    </div>


                    {/* Sección de gestión de peticiones */}
                    <Card className="bg-white shadow-md border mb-8">
                        <CardContent>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-blue-900">Peticiones Vencidas</h2>
                            </div>
                            {isLoading ? (
                                <div className="flex items-center justify-center py-4">
                                    <LoadingSpinner />
                                </div>
                            ) : solicitudesVencidas.length === 0 ? (
                                <div className="text-center text-gray-500">
                                    No hay peticiones próximas a vencer.
                                </div>
                            ) : (
                                <>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Numero Radicado</TableHead>
                                                <TableHead>Nombre Solicitante</TableHead>
                                                <TableHead>Tipo</TableHead>
                                                <TableHead>Fecha Vencimiento</TableHead>
                                                <TableHead>Tiempo Vencido</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {solicitudesVencidas.map((p) => (
                                                <TableRow key={p.id}>
                                                    <TableCell>{p.numeroRadicado || p.id}</TableCell>
                                                    <TableCell>{p.solicitante.nombre} {p.solicitante.apellido}</TableCell>
                                                    <TableCell>{p.tipoPQ.nombre}</TableCell>
                                                    <TableCell>{new Date(p.fechaResolucionEstimada).toLocaleDateString()}</TableCell>
                                                    <TableCell>
                                                        {(() => {
                                                            const hoy = new Date();
                                                            const fechaEstimada = new Date(p.fechaResolucionEstimada);
                                                            const diffMs = hoy.getTime() - fechaEstimada.getTime();
                                                            const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

                                                            if (diffDias <= 0) {
                                                                return "Hoy vencía";
                                                            }
                                                            return `${diffDias} días vencidos`;
                                                        })()}
                                                    </TableCell>

                                                    <TableCell>
                                                        <Button
                                                            className="text-xs flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
                                                            onClick={() =>
                                                                navigate(`/contratista/peticiones_pendientes`, {
                                                                    state: { modalOpen: true, selectPq: p },
                                                                })
                                                            }
                                                        >
                                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                                            Dar Respuesta
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Sección de gestión de peticiones */}
                    <Card className="bg-white shadow-md border mb-8">
                        <CardContent>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-blue-900">
                                    Peticiones Próximas a Vencer
                                </h2>
                            </div>
                            {isLoading ? (
                                <div className="flex items-center justify-center py-4">
                                    <LoadingSpinner />
                                </div>
                            ) : solicitudesPendientes.length === 0 ? (
                                <div className="text-center text-gray-500">
                                    No hay peticiones próximas a vencer.
                                </div>
                            ) : (
                                <>
                                    {/* Tabla de peticiones por vencer */}
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Numero Radicado</TableHead>
                                                <TableHead>Nombre Solicitante</TableHead>
                                                <TableHead>Tipo</TableHead>
                                                <TableHead>Fecha Vencimiento</TableHead>
                                                <TableHead>Tiempo Restante</TableHead>
                                                <TableHead>Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {solicitudesPendientes.map((p) => (
                                                <TableRow key={p.id}>
                                                    <TableCell>{p.numeroRadicado || p.id}</TableCell>
                                                    <TableCell>
                                                        {p.solicitante.nombre} {p.solicitante.apellido}
                                                    </TableCell>
                                                    <TableCell>{p.tipoPQ.nombre}</TableCell>
                                                    <TableCell>
                                                        {new Date(p.fechaResolucionEstimada).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        {(() => {
                                                            const hoy = new Date();
                                                            const fechaEstimada = new Date(p.fechaResolucionEstimada);
                                                            const diffMs = fechaEstimada.getTime() - hoy.getTime();
                                                            const diffDias = Math.ceil(
                                                                diffMs / (1000 * 60 * 60 * 24)
                                                            );
                                                            return diffDias < 0
                                                                ? "Vencida"
                                                                : diffDias === 0
                                                                    ? "Hoy"
                                                                    : `${diffDias} días`;
                                                        })()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            className="text-xs flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
                                                            onClick={() =>
                                                                navigate(`/contratista/peticiones_pendientes`, {
                                                                    state: { modalOpen: true, selectPq: p },
                                                                })
                                                            }
                                                        >
                                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                                            Dar Respuesta
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default InicioFuncionario
