// src/components/RecentPQTable.tsx
import React from "react";

const recentRequests = [
    { id: 1, tipo: "Queja", estado: "Pendiente", fecha: "2025-08-09" },
    { id: 2, tipo: "Petición", estado: "En Proceso", fecha: "2025-08-08" },
    { id: 3, tipo: "Reclamo", estado: "Resuelta", fecha: "2025-08-07" },
];

const RecentPQTable: React.FC = () => {
    return (
        <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
            <h2 className="text-lg font-semibold mb-4">Solicitudes Recientes</h2>
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="p-2">ID</th>
                        <th className="p-2">Tipo</th>
                        <th className="p-2">Estado</th>
                        <th className="p-2">Fecha</th>
                    </tr>
                </thead>
                <tbody>
                    {recentRequests.map((req) => (
                        <tr key={req.id} className="border-t">
                            <td className="p-2">{req.id}</td>
                            <td className="p-2">{req.tipo}</td>
                            <td className="p-2">{req.estado}</td>
                            <td className="p-2">{req.fecha}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RecentPQTable;
