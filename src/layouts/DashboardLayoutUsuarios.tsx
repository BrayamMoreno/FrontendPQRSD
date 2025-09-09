// layouts/DashboardLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navegacion/Navbar";


const DashboardLayoutUsuarios: React.FC = () => {
  return (
    <div >
      <Navbar />
      <main >
        <Outlet />
      </main>
    </div>

  );
};

export default DashboardLayoutUsuarios;
