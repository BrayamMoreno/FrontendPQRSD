// src/components/PQChart.tsx
import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const data = [
    { name: "Pendientes", value: 10 },
    { name: "En Proceso", value: 6 },
    { name: "Resueltas", value: 14 },
];

const COLORS = ["#EF4444", "#F59E0B", "#10B981"];

const PQChart: React.FC = () => {
    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Distribución por Estado</h2>
            <PieChart width={300} height={250}>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                >
                    {data.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </div>
    );
};

export default PQChart;
