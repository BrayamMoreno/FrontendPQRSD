// layouts/DashboardLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navegacion/Navbar";

const DashboardLayoutContratistas: React.FC = () => {
  return (
    <div className="flex">
      <Navbar />
      <main className="pt-24">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayoutContratistas;
