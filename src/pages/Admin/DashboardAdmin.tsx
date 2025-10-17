import React, { useEffect, useState } from "react";
import {
    PieChart,
    Pie,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import type { PaginatedResponse } from "../../models/PaginatedResponse";
import type { PqItem } from "../../models/PqItem";
import apiServiceWrapper from "../../api/ApiService";
import Breadcrumbs from "../../components/Navegacion/Breadcrumbs";
import { Users, ClipboardCheck, MapPin, Flag } from "lucide-react";
import { Button } from "../../components/ui/button";

const COLORS = ["#2ecc71", "#3498db", "#f39c12", "#9b59b6", "#e74c3c"];

const DashboardAdmin: React.FC = () => {
    const api = apiServiceWrapper;

    const [ultimasSolicitudes, setUltimasSolicitudes] = useState<PqItem[]>([]);
    const [proximasAVencer, setProximasAVencer] = useState<PqItem[]>([]);
    const [totalSolicitudes, setTotalSolicitudes] = useState<number>(0);
    const [totalProximasAVencer, setTotalProximasAVencer] = useState<number>(0);

    const fetchData = async <T,>(
        endpoint: string,
        setter: React.Dispatch<React.SetStateAction<T[]>>,
        setterNumberData: React.Dispatch<React.SetStateAction<number>>
    ) => {
        try {
            const response = await api.get<PaginatedResponse<T>>(endpoint);
            setter(response.data || []);
            setterNumberData(response.total_count || 0);
        } catch (error) {
            console.error(`Error al obtener los datos de ${endpoint}:`, error);
        }
    };

    const fetchAllData = async () => {
        await Promise.all([
            fetchData("/pqs", setUltimasSolicitudes, setTotalSolicitudes),
            fetchData("/pqs/proximas_a_vencer", setProximasAVencer, setTotalProximasAVencer),
        ]);
    };

    useEffect(() => {
        fetchAllData();
    }, []);

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
                                <p className="text-2xl font-bold text-blue-700">20</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
                            <div className="bg-blue-100 p-3 rounded-full">
                                <ClipboardCheck className="text-blue-600 w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">Total de Solicitudes</p>
                                <p className="text-2xl font-bold text-blue-700">{totalSolicitudes}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
                            <div className="bg-blue-100 p-3 rounded-full">
                                <MapPin className="text-blue-600 w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">Peticiones Diarias</p>
                                <p className="text-2xl font-bold text-blue-700">2</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
                            <div className="bg-blue-100 p-3 rounded-full">
                                <Flag className="text-blue-600 w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">Peticiones Mensuales</p>
                                <p className="text-2xl font-bold text-blue-700">312</p>
                            </div>
                        </div>
                    </div>

                    {/* Estadísticas */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                        <div className="bg-white rounded-xl shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-700 mb-4">
                                Lugar de Hospedaje del Turista
                            </h2>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: "Hotel", value: 45 },
                                            { name: "Apartamento", value: 25 },
                                            { name: "Finca", value: 20 },
                                            { name: "Otro", value: 10 },
                                        ]}
                                        dataKey="value"
                                        outerRadius={90}
                                        fill="#8884d8"
                                        label
                                    >
                                        {COLORS.map((color, index) => (
                                            <Cell key={`cell-${index}`} fill={color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-white rounded-xl shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-700 mb-4">
                                Tipo de Alojamiento Utilizado
                            </h2>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: "Hotel", value: 30 },
                                            { name: "Camping", value: 15 },
                                            { name: "Casa Familiar", value: 40 },
                                            { name: "Otro", value: 15 },
                                        ]}
                                        dataKey="value"
                                        outerRadius={90}
                                        fill="#82ca9d"
                                        label
                                    >
                                        {COLORS.map((color, index) => (
                                            <Cell key={`cell-${index}`} fill={color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Tablas */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-700 mb-4">
                                Peticiones Próximas a Vencer
                            </h2>
                            <table className="w-full text-sm">
                                <thead className="bg-blue-100 text-blue-800">
                                    <tr>
                                        <th className="p-2 text-left">Código</th>
                                        <th className="p-2 text-left">Fecha Estimada</th>
                                        <th className="p-2 text-left">Días Restantes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {proximasAVencer.map((solicitud: PqItem) => (
                                        <tr key={solicitud.id} className="border-b hover:bg-blue-50">
                                            <td className="p-2">{solicitud.id}</td>
                                            <td className="p-2">{solicitud.fechaResolucionEstimada}</td>
                                            <td className="p-2">
                                                {(() => {
                                                    const hoy = new Date();
                                                    const fechaEstimada = new Date(solicitud.fechaResolucionEstimada);
                                                    const diffMs = fechaEstimada.getTime() - hoy.getTime();
                                                    const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                                                    return diffDias < 0
                                                        ? "Vencida"
                                                        : diffDias === 0
                                                            ? "Hoy"
                                                            : `${diffDias} días`;
                                                })()}
                                            </td>
                                        </tr>
                                    ))}
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
                                        <th className="p-2 text-left">Código</th>
                                        <th className="p-2 text-left">Tipo</th>
                                        <th className="p-2 text-left">Estado</th>
                                        <th className="p-2 text-left">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ultimasSolicitudes.map((solicitud: PqItem) => (
                                        <tr key={solicitud.id} className="border-b hover:bg-blue-50">
                                            <td className="p-2">{solicitud.id}</td>
                                            <td className="p-2">{solicitud.tipoPQ?.nombre}</td>
                                            <td className="p-2">{solicitud.nombreUltimoEstado}</td>
                                            <td className="p-2">
                                                {new Date(solicitud.fechaRadicacion).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
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
