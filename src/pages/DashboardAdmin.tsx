import React from "react";
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

const proximasAVencer = [
    { nombre: "PQ-001", dias: 2 },
    { nombre: "PQ-002", dias: 4 },
    { nombre: "PQ-003", dias: 1 },
];

const ultimasPeticiones = [
    { codigo: "PQ-010", tipo: "Queja", fecha: "2025-08-05" },
    { codigo: "PQ-011", tipo: "Petición", fecha: "2025-08-06" },
    { codigo: "PQ-012", tipo: "Reclamo", fecha: "2025-08-07" },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const DashboardAdmin: React.FC = () => {
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
                            <p className="text-2xl font-bold">120</p>
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
                            <p className="text-2xl font-bold">{proximasAVencer.length}</p>
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
                            <h2 className="text-lg font-semibold mb-4">Peticiones por Tipo</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={peticionesPorTipo}
                                        dataKey="valor"
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
                                        <th className="p-2 text-left">Días Restantes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {proximasAVencer.map((pq, idx) => (
                                        <tr key={idx} className="border-b">
                                            <td className="p-2">{pq.nombre}</td>
                                            <td className="p-2">{pq.dias}</td>
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
                                        <th className="p-2 text-left">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ultimasPeticiones.map((pq, idx) => (
                                        <tr key={idx} className="border-b">
                                            <td className="p-2">{pq.codigo}</td>
                                            <td className="p-2">{pq.tipo}</td>
                                            <td className="p-2">{pq.fecha}</td>
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
