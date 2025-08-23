// layouts/DashboardLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";


const DashboardLayoutUsuarios: React.FC = () => {
  return (
    <div className="flex">
      <Navbar />
      <main className="pt-24">
        <Outlet />
      </main>
    </div>

  );
};

export default DashboardLayoutUsuarios;
