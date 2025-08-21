// layouts/DashboardLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import Slidebar from "../components/Slidebar"; // ajusta la ruta

const DashboardLayoutRadicador: React.FC = () => {
  return (
    <div className="flex">
      <Slidebar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayoutRadicador;
