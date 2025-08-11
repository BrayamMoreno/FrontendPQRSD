// src/components/DashboardCard.tsx
import React from "react";

interface DashboardCardProps {
    title: string;
    value: number | string;
    color?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, color }) => {
    return (
        <div className={`p-4 rounded-lg shadow bg-${color || "white"} text-white`}>
            <h3 className="text-sm font-medium">{title}</h3>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    );
};

export default DashboardCard;
