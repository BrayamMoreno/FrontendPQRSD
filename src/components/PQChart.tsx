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
        <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center">
            <h2 className="text-lg font-semibold mb-4">Distribución por Estado</h2>
            <PieChart width={350} height={320}>
                <Pie
                    data={data}
                    cx="50%"
                    cy="25%"   // subimos un poco la torta para dejar espacio abajo
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={3}
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend
                    layout="vertical"        // vertical para que se apilen
                    align="right"            // a la derecha de la gráfica
                    verticalAlign="middle"   // centrados verticalmente
                />
            </PieChart>
        </div>
    );
};

export default PQChart;
