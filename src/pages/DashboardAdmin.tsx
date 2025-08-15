import React, { use, useEffect, useState } from "react";
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from "recharts";

const tendenciasDiarias = [
    { fecha: "Lun", cantidad: 12 },
    { fecha: "Mar", cantidad: 19 },
    { fecha: "Mié", cantidad: 8 },
    { fecha: "Jue", cantidad: 15 },
    { fecha: "Vie", cantidad: 22 },
    { fecha: "Sáb", cantidad: 10 },
    { fecha: "Dom", cantidad: 5 },
];

const peticionesPorTipo = [
    { tipo: "Quejas", valor: 30 },
    { tipo: "Peticiones", valor: 20 },
    { tipo: "Reclamos", valor: 15 },
    { tipo: "Felicitaciones", valor: 5 },
];

const peticionesPorDepartamento = [
    { departamento: "Antioquia", cantidad: 25 },
    { departamento: "Cundinamarca", cantidad: 18 },
    { departamento: "Valle", cantidad: 12 },
    { departamento: "Santander", cantidad: 8 },
    { departamento: "Bolívar", cantidad: 5 },
];


const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

import apiServiceWrapper from "../api/ApiService";

const DashboardAdmin: React.FC = () => {

    const api = apiServiceWrapper
    const [ultimasSolicitudes, setUltimasSolicitudes] = useState<any | []>([]);
    const [proximasAVencer, setProximasAVencer] = useState<any | []>([]);
    const [tendenciasDiarias, setTendenciasDiarias] = useState<any[]>([]);
    const [peticionesPorTipo, setPeticionesPorTipo] = useState<any[]>([]);
    const [peticionesPorDepartamento, setPeticionesPorDepartamento] = useState<any[]>([]);

    const [totalSolicitudes, setTotalSolicitudes] = useState(0);
    const [totalProximasAVencer, setTotalProximasAVencer] = useState(0);

    const fetchData = async (
        endpoint: string,
        setter: React.Dispatch<React.SetStateAction<any[]>>,
        setterNumberData: React.Dispatch<React.SetStateAction<number>>) => {
        try {
            const response = await api.get(endpoint)
            const data = await response.data.data
            setter(data || [])
            setterNumberData(response.data.total_count || 0)
        } catch (error) {
            console.error(`Error al obtener los datos de ${endpoint}:`, error)
        }
    }

    const fetchEstadisticas = async (
        endpoint: string,
        setter: React.Dispatch<React.SetStateAction<any[]>>,) => {
        try {
            const response = await api.get(endpoint)
            const data = await response.data
            setter(data || [])
            console.log(data)
        } catch (error) {
            console.error("Error al obtener las tendencias diarias:", error)
        }
    }


    const fetchAllData = async () => {
        await Promise.all([
            fetchData("/pqs", setUltimasSolicitudes, setTotalSolicitudes),
            fetchData("/pqs/proximas_a_vencer", setProximasAVencer, setTotalProximasAVencer),
            fetchEstadisticas("/pqs/ultimos_7_dias", setTendenciasDiarias),
            fetchEstadisticas("/pqs/contar_por_tipo_mes", setPeticionesPorTipo)
        ])
    }

    useEffect(() => {
        fetchAllData()
    }, []);


    return (
        <div className="flex min-h-screen w-screen bg-gray-100 z-15">
            <div className="ml-10 w-full">
                <div className="max-w-7xl mx-auto p-4">
                    {/* Título */}
                    <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>

                    {/* Resumen general */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
                        <div className="bg-white rounded-lg p-4 shadow text-center">
                            <p className="text-sm text-gray-500">Total de Peticiones</p>
                            <p className="text-2xl font-bold">{totalSolicitudes}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow text-center">
                            <p className="text-sm text-gray-500">Peticiones Resueltas</p>
                            <p className="text-2xl font-bold">85</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow text-center">
                            <p className="text-sm text-gray-500">Pendientes</p>
                            <p className="text-2xl font-bold">35</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow text-center">
                            <p className="text-sm text-gray-500">Próximas a Vencer</p>
                            <p className="text-2xl font-bold">{totalProximasAVencer}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow text-center">
                            <p className="text-sm text-gray-500">Tiempo Prom. Resolución</p>
                            <p className="text-2xl font-bold">3.2 días</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow text-center">
                            <p className="text-sm text-gray-500">Peticiones Vencidas</p>
                            <p className="text-2xl font-bold">7</p>
                        </div>
                    </div>

                    {/* Gráficos */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Tendencia diaria */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <h2 className="text-lg font-semibold mb-4">Tendencia Diaria</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={tendenciasDiarias}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="fecha" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="cantidad" stroke="#8884d8" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Peticiones por tipo */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <h2 className="text-lg font-semibold mb-4">Peticiones Mensuales por Tipo</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={peticionesPorTipo}
                                        dataKey="cantidad"
                                        nameKey="tipo"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        fill="#8884d8"
                                        label
                                    >
                                        {peticionesPorTipo.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Peticiones por departamento */}
                        <div className="bg-white rounded-lg shadow p-4 lg:col-span-2">
                            <h2 className="text-lg font-semibold mb-4">Peticiones por Departamento</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={peticionesPorDepartamento}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="departamento" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="cantidad" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Tablas */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Próximas a vencer */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <h2 className="text-lg font-semibold mb-4">Peticiones Próximas a Vencer</h2>
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="p-2 text-left">Código</th>
                                        <th className="p-2 text-left">Fecha de Resolución Estimada</th>
                                        <th className="p-2 text-left">Días Restantes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {proximasAVencer.map((solicitud: any) => (
                                        <tr key={solicitud.id} className="border-b">
                                            <td className="p-2">{solicitud.id}</td>
                                            <td className="p-2">{solicitud.fechaResolucionEstimada}</td>
                                            <td className="p-2">
                                                {(() => {
                                                    const hoy = new Date();
                                                    const fechaEstimada = new Date(solicitud.fechaResolucionEstimada);
                                                    const diffMs = fechaEstimada.getTime() - hoy.getTime(); // ahora sí es number
                                                    const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                                                    return diffDias < 0 ? "Vencida" : `${diffDias} días`;
                                                })()}
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Últimas peticiones registradas */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <h2 className="text-lg font-semibold mb-4">Últimas Peticiones</h2>
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="p-2 text-left">Código</th>
                                        <th className="p-2 text-left">Tipo</th>
                                        <th className="p-2 text-left">Ultimo Estado</th>
                                        <th className="p-2 text-left">Fecha de Radicación</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ultimasSolicitudes.map((solicitud: any) => (
                                        <tr key={solicitud.id} className="border-b">
                                            <td className="p-2">{solicitud.id}</td>
                                            <td className="p-2">{solicitud.tipoPQ.nombre}</td>
                                            <td className="p-2">{solicitud.nombreUltimoEstado}</td>
                                            <td className="p-2">{new Date(solicitud.fechaRadicacion).toLocaleDateString()}</td>
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
