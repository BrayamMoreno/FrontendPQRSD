import React, { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    PieChart,
    Pie,
    Tooltip,
    ResponsiveContainer,
    Cell,
    BarChart,
    Bar,
} from "recharts";
import type { PaginatedResponse } from "../../models/PaginatedResponse";
import type { PqItem } from "../../models/PqItem";
import apiServiceWrapper from "../../api/ApiService";
import Breadcrumbs from "../../components/Navegacion/Breadcrumbs";
import { Users, ClipboardCheck, Calendar1Icon, Calendar } from "lucide-react";
import { LoadingSpinner } from "../../components/LoadingSpinner";

const COLORS = ["#2ecc71", "#3498db", "#f39c12", "#9b59b6", "#e74c3c"];

interface TendenciaDiaria {
    fecha: string;      // Día de la semana en español, ej: "Lunes"
    cantidad: number;   // Cantidad de peticiones para ese día
}

interface TipoCantidad {
    tipo: string;
    cantidad: number;
}

const DashboardAdmin: React.FC = () => {
    const api = apiServiceWrapper;

    const [ultimasSolicitudes, setUltimasSolicitudes] = useState<PqItem[]>([]);
    const [vencidas, setVencidas] = useState<PqItem[]>([]);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isLoadingChart, setIsLoadingChart] = useState<boolean>(true);

    const [countTotalUsers, setCountTotalUsers] = useState<number>(0);
    const [countTotalPqs, setCountTotalPqs] = useState<number>(0);
    const [countTotalPqsHoy, setCountTotalPqsHoy] = useState<number>(0);
    const [countTotalPqsMes, setCountTotalPqsMes] = useState<number>(0);

    const [tendenciaDiaria, setTendenciaDiaria] = useState<TendenciaDiaria[]>([]);
    const [coteoTipoMes, setConteoTipoMes] = useState<TipoCantidad[]>([]);

    useEffect(() => {
        fetchAllStats();
    }, []);

    const fetchAllStats = async () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();

        const firstDay = new Date(year, month, 1).toISOString().split('T')[0];
        const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0];

        await Promise.all([
            fetchStats("/usuarios", setCountTotalUsers),
            fetchStats("/pqs", setCountTotalPqs),

            fetchStats("/pqs/all_pqs", setCountTotalPqsHoy,
                new Date().toISOString().split('T')[0],
                new Date().toISOString().split('T')[0]
            ),

            fetchStats("/pqs/all_pqs", setCountTotalPqsMes,
                firstDay,
                lastDay
            ),
        ]);
    };

    const fetchStats = async <T,>(
        endpoint: string,
        setterNumberData: React.Dispatch<React.SetStateAction<number>>,
        fechaInicio?: string,
        fechaFin?: string
    ) => {
        try {
            const params: Record<string, any> = {
                size: 1,
                page: 0
            };

            if (fechaInicio) params.fechaInicio = fechaInicio;
            if (fechaFin) params.fechaFin = fechaFin;
            const response = await api.get<PaginatedResponse<T>>(endpoint, params)
            setterNumberData(response.total_count || 0);
        } catch (error) {
            console.error(`Error al obtener los datos de ${endpoint}:`, error);
        }
    };

    const fetchData = async <T,>(
        endpoint: string,
        setter: React.Dispatch<React.SetStateAction<T[]>>,
        setterNumberData?: React.Dispatch<React.SetStateAction<number>>
    ) => {
        try {
            const response = await api.get<PaginatedResponse<T>>(endpoint)
            setter(response.data || []);
            setterNumberData?.(response.total_count || 0);
        } catch (error) {
            console.error(`Error al obtener los datos de ${endpoint}:`, error);
        }
    };

    const fetchAllData = async () => {
        setIsLoading(true);
        await Promise.all([
            fetchData("/pqs/all_pqs", setUltimasSolicitudes),
            fetchData("/pqs/vencidas_admin", setVencidas)
        ]);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchAllData();
        fetchTendenciaDiaria();
        fetchTendenciaPorTipo();
    }, []);

    const fetchTendenciaDiaria = async () => {
        try {
            const response = await api.getAll<TendenciaDiaria[]>("/pqs/ultimos_7_dias");
            setTendenciaDiaria(response.data || []);
        } catch (error) {
            console.error("Error al obtener la tendencia diaria:", error);
        } finally {
            setIsLoadingChart(false);
        }
    };

    const fetchTendenciaPorTipo = async () => {
        try {
            const response = await api.getAll<TipoCantidad[]>("/pqs/contar_por_tipo_mes");
            setConteoTipoMes(response.data || []);
        } catch (error) {
            console.error("Error al obtener la tendencia diaria:", error);
        } finally {
            setIsLoadingChart(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-gray-50">
            <div className="w-full px-4 sm:px-6 lg:px-8 pt-32 pb-8">
                <div className="max-w-7xl mx-auto">
                    <Breadcrumbs />

                    {/* Header */}
                    <div className="bg-blue-100 rounded-2xl shadow mt-2 p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-blue-800 mb-1">
                                Dashboard Administrativo
                            </h1>
                            <p className="text-blue-700 text-sm">
                                Panel de control con estadísticas y métricas clave
                            </p>
                        </div>
                    </div>

                    {/* KPIs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                        <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
                            <div className="bg-blue-100 p-3 rounded-full">
                                <Users className="text-blue-600 w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">Total Usuarios Registrados</p>
                                <p className="text-2xl font-bold text-blue-700">{countTotalUsers}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
                            <div className="bg-blue-100 p-3 rounded-full">
                                <ClipboardCheck className="text-blue-600 w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">Total de Solicitudes</p>
                                <p className="text-2xl font-bold text-blue-700">{countTotalPqs}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
                            <div className="bg-blue-100 p-3 rounded-full">
                                <Calendar1Icon className="text-blue-600 w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">Peticiones del Dia</p>
                                <p className="text-2xl font-bold text-blue-700">{countTotalPqsHoy}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
                            <div className="bg-blue-100 p-3 rounded-full">
                                <Calendar className="text-blue-600 w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">Peticiones Mensuales</p>
                                <p className="text-2xl font-bold text-blue-700">{countTotalPqsMes}</p>
                            </div>
                        </div>
                    </div>

                    {/* Estadísticas */}
                    <div className="grid grid-cols-1 gap-8 mb-10">
                        {/* Tendencia de Peticiones (últimos 7 días) */}
                        <div className="bg-white rounded-xl shadow p-6 w-full">
                            <h2 className="text-lg font-semibold text-gray-700 mb-4">
                                Tendencia de Peticiones (últimos 7 días)
                            </h2>
                            {isLoadingChart ? (
                                <div className="flex justify-center items-center h-[45vh]">
                                    <LoadingSpinner />
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={window.innerHeight * 0.45}>
                                    <LineChart data={tendenciaDiaria}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="fecha" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="cantidad" stroke="#3498db" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* Cantidad de PQ por Tipo */}
                        <div className="bg-white rounded-xl shadow p-6 w-full">
                            <h2 className="text-lg font-semibold text-gray-700 mb-4">
                                Cantidad de PQ por Tipo
                            </h2>
                            {isLoading ? (
                                <div className="flex justify-center items-center h-[45vh]">
                                    <LoadingSpinner />
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={window.innerHeight * 0.45}>
                                    <BarChart data={coteoTipoMes} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="tipo"
                                            tickLine={false}
                                            axisLine={false}
                                            style={{ fontSize: 12, fill: '#4B5563' }}
                                        />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="cantidad" fill="#3B82F6">
                                            {coteoTipoMes.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>


                    {/* Tablas */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-700 mb-4">
                                Peticiones Vencidas
                            </h2>
                            <table className="w-full text-sm">
                                <thead className="bg-blue-100 text-blue-800">
                                    <tr>
                                        <th className="p-2 text-left"># Radicado</th>
                                        <th className="p-2 text-left">Responsable</th>
                                        <th className="p-2 text-left">Fecha Estimada</th>
                                        <th className="p-2 text-left">Días Restantes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={4} className="py-10">
                                                <div className="flex justify-center items-center">
                                                    <LoadingSpinner />
                                                </div>
                                            </td>
                                        </tr>
                                    ) : vencidas.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-10">
                                                <div className="flex justify-center items-center">
                                                    No hay peticiones vencidas
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        <>
                                            {vencidas.map((solicitud: PqItem) => (

                                                <tr key={solicitud.id} className="border-b hover:bg-blue-50">
                                                    <td className="p-2">{solicitud.numeroRadicado || solicitud.id}</td>
                                                    <td className="p-2">
                                                        {solicitud.responsable?.personaResponsable?.nombre}{" "}
                                                        {solicitud.responsable?.personaResponsable?.apellido}
                                                    </td>
                                                    <td className="p-2">
                                                        {solicitud.fechaResolucionEstimada
                                                            ? new Date(solicitud.fechaResolucionEstimada).toLocaleDateString()
                                                            : "Sin fecha"}
                                                    </td>
                                                    <td className="p-2">
                                                        {(() => {
                                                            const hoy = new Date();
                                                            const fechaEstimada = new Date(solicitud.fechaResolucionEstimada);
                                                            const diffMs = hoy.getTime() - fechaEstimada.getTime();
                                                            const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

                                                            if (diffDias <= 0) {
                                                                return "Hoy vencía";
                                                            }
                                                            return `${diffDias} días vencidos`;
                                                        })()}
                                                    </td>
                                                </tr>
                                            ))
                                            }
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-white rounded-xl shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-700 mb-4">
                                Últimas Peticiones
                            </h2>
                            <table className="w-full text-sm">
                                <thead className="bg-blue-100 text-blue-800">
                                    <tr>
                                        <th className="p-2 text-left"># Radicado</th>
                                        <th className="p-2 text-left">Tipo</th>
                                        <th className="p-2 text-left">Estado</th>
                                        <th className="p-2 text-left">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={4} className="py-10">
                                                <div className="flex justify-center items-center">
                                                    <LoadingSpinner />
                                                </div>
                                            </td>
                                        </tr>
                                    ) : vencidas.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-10">
                                                <div className="flex justify-center items-center">
                                                    No hay peticiones
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        <>
                                            {ultimasSolicitudes.map((solicitud: PqItem) => (
                                                <tr key={solicitud.id} className="border-b hover:bg-blue-50">
                                                    <td className="p-2">{solicitud.numeroRadicado || solicitud.id}</td>
                                                    <td className="p-2">{solicitud.tipoPQ?.nombre}</td>
                                                    <td className="p-2">{solicitud.nombreUltimoEstado}</td>
                                                    <td className="p-2">
                                                        {new Date(solicitud.fechaRadicacion).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardAdmin;
